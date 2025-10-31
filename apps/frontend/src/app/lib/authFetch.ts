// lib/server/authFetch.ts
// Next.js 서버 런타임에서 보호 API 요청 시 사용합니다.

type RefreshResult = {
    ok: boolean;
    setCookies: string[];
    status: number;
    body: string;
    headers: Headers;
};

// 전역 싱글톤 잠금 (서버 인스턴스 당 1개)
declare global {
    // eslint-disable-next-line no-var
    var __refreshLock: { promise: Promise<RefreshResult> | null } | undefined;
}
const globalLock: { promise: Promise<RefreshResult> | null } =
    globalThis.__refreshLock ?? (globalThis.__refreshLock = { promise: null });

export async function authFetch(
    req: Request,
    url: URL | string,
    options: RequestInit = {},
    isTokenExpired?: (res: Response) => boolean
): Promise<{ res: Response; refreshSetCookies: string[] }> {
    const first = await fetch(url, { ...options, cache: 'no-store' });

    if (first.ok) {
        return { res: first, refreshSetCookies: [] };
    }

    const shouldRefresh =
        first.status === 401 &&
        (typeof isTokenExpired === 'function' ? isTokenExpired(first) : true);

    if (!shouldRefresh) {
        return { res: first, refreshSetCookies: [] };
    }

    // 단일 갱신
    const refreshResult = await ensureRefreshed(req);

    if (!refreshResult.ok) {
        // 리프레시 실패 → 재시도 없이 실패 반환
        return {
            res: new Response(refreshResult.body, {
                status: refreshResult.status,
                headers: refreshResult.headers,
            }),
            refreshSetCookies: refreshResult.setCookies,
        };
    }

    // 리프레시 성공 → 원요청 1회 재시도
    const retry = await fetch(url, { ...options, cache: 'no-store' });
    return { res: retry, refreshSetCookies: refreshResult.setCookies };
}

async function ensureRefreshed(req: Request): Promise<RefreshResult> {
    if (globalLock.promise) return globalLock.promise;

    globalLock.promise = (async () => {
        try {
            return await doRefresh(req);
        } finally {
            globalLock.promise = null; // 완료 후 잠금 해제
        }
    })();

    return globalLock.promise;
}

async function doRefresh(req: Request): Promise<RefreshResult> {
    const refreshUrl = new URL('/server-api/auth/refresh', req.url);

    const r = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
            // httpOnly 쿠키 전달
            Cookie: req.headers.get('cookie') ?? '',
            // (필요 시) CSRF 헤더 등 추가
        },
        cache: 'no-store',
    });

    const setCookies = collectSetCookieHeaders(r);
    const body = await r.text();
    return { ok: r.ok, setCookies, status: r.status, body, headers: r.headers };
}

function collectSetCookieHeaders(res: Response): string[] {
    const out: string[] = [];
    res.headers.forEach((v, k) => {
        if (k.toLowerCase() === 'set-cookie') out.push(v);
    });
    return out;
}