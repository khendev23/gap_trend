// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authFetch } from '@/app/lib/authFetch';

export async function GET(req: NextRequest) {
    const url = new URL('/server-api/auth/me', req.url);
    const access = req.cookies.get('access_token')?.value;

    // 원요청 헤더 구성: 쿠키 전달 + (선택) Bearer
    const headers: HeadersInit = {
        Cookie: req.headers.get('cookie') ?? '',
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
    };

    // 1) 보호 API 호출 (401 시 단일 갱신 → 원요청 1회 재시도)
    const { res, refreshSetCookies } = await authFetch(
        req,
        url,
        { method: 'GET', headers, cache: 'no-store' }
        // 필요 시 만료 구분 콜백 전달 가능
        // (r) => r.status === 401
    );

    // 2) 응답 변환
    const text = await res.text();
    const response = new NextResponse(text, { status: res.status });

    // 2-1) 원요청/재시도의 Set-Cookie 전달
    res.headers.forEach((v, k) => {
        if (k.toLowerCase() === 'set-cookie') response.headers.append('set-cookie', v);
    });

    // 2-2) 리프레시에서 온 Set-Cookie도 반드시 전달(새 토큰 반영)
    for (const sc of refreshSetCookies) {
        response.headers.append('set-cookie', sc);
    }

    // 2-3) content-type 유지
    response.headers.set(
        'content-type',
        res.headers.get('content-type') ?? 'application/json'
    );

    return response;
}
