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
    const baseOpts: RequestInit = {
        ...options,
        cache: 'no-store' as RequestCache, // 또는 'no-store' as const
    };

    const first = await fetch(url, baseOpts);

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

    const mergedCookie = mergeCookieHeader(
        options.headers as HeadersInit,
        req.headers.get('cookie') ?? '',
        refreshResult.setCookies
    );

    // ✅ HeadersInit → Headers 로 정규화
    const retryHeaders = new Headers(options.headers as HeadersInit | undefined);

    // 새 쿠키 반영
    retryHeaders.set('Cookie', mergedCookie);

    // (옵션) Bearer도 갱신
    const newAccess = extractCookieValue(refreshResult.setCookies, 'access_token');
    if (newAccess) retryHeaders.set('Authorization', `Bearer ${newAccess}`);

    // 리프레시 성공 → 원요청 1회 재시도
    const retry = await fetch(url, { ...baseOpts, headers: retryHeaders });
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

function mergeCookieHeader(
    originalHeaders: HeadersInit | undefined,
    originalCookieHeader: string,
    setCookies: string[]
): string {
    // 원래 요청의 Cookie 헤더를 Key-Value로 파싱
    const jar: Record<string, string> = parseCookieHeader(originalCookieHeader);

    // 새 Set-Cookie 들을 반영 (만료된 건 무시, 새 값만 덮어씀)
    for (const sc of setCookies) {
        const { name, value } = parseSetCookie(sc);
        if (name) jar[name] = value ?? '';
    }

    // 다시 "Cookie: a=1; b=2" 형태로 직렬화
    return Object.entries(jar)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('; ');
}

function parseCookieHeader(header: string): Record<string, string> {
    const out: Record<string, string> = {};
    header.split(';').forEach((kv) => {
        const [k, ...rest] = kv.trim().split('=');
        if (!k) return;
        out[k] = decodeURIComponent(rest.join('=') ?? '');
    });
    return out;
}

function parseSetCookie(sc: string): { name: string; value: string | null } {
    // "name=value; Path=/; HttpOnly; ..." 에서 name/value만 추출
    const first = sc.split(';')[0];
    const eq = first.indexOf('=');
    if (eq < 0) return { name: '', value: null };
    const name = first.slice(0, eq).trim();
    const value = first.slice(eq + 1).trim();
    return { name, value };
}

function extractCookieValue(setCookies: string[], target: string): string | null {
    for (const sc of setCookies) {
        const { name, value } = parseSetCookie(sc);
        if (name === target) return value ?? null;
    }
    return null;
}