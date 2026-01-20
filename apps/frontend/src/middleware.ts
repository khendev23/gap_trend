import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts } from '@/app/lib/auth-cookies';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    const isLoogedIn = accessToken || refreshToken; // 둘 중 하나라도 있으면 로그인된 걸로 간주

    // ⭐ [추가] "이미 로그인한 유저"가 "로그인/회원가입" 페이지에 오면 홈으로 쫓아내기
    if (isLoogedIn) {
        if (pathname.startsWith('/user/login') || pathname.startsWith('/user/signup')) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 1. 액세스 토큰 있으면 통과
    if (accessToken) {
        return NextResponse.next();
    }

    // 2. 둘 다 없으면 로그인으로
    if (!refreshToken) {
        // 보호된 경로만 튕겨내기
        if (request.nextUrl.pathname.startsWith('/user/mypage')) {
            // 1. 리다이렉트 응답 생성
            const response = NextResponse.redirect(new URL('/user/login', request.url));

            // 2. ⭐ 명찰 뺏기 (쿠키 삭제)
            // 브라우저에게 "이 쿠키들 다 지워!"라고 명령합니다.
            response.cookies.delete('access_token');
            response.cookies.delete('refresh_token');
            response.cookies.delete('session_user'); // 헤더가 보는 범인!
            response.cookies.delete('stay_login');   // 로그인 유지 플래그도 삭제

            return response;
        }
        return NextResponse.next();
    }

    // 3. 재발급 시도

    try {
        // 🚨 중요: 미들웨어에서는 localhost 대신 127.0.0.1 사용 필수
        const API_BASE_URL = process.env.backend_url || 'http://127.0.0.1:8080';

        const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Cookie': `refresh_token=${refreshToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            return NextResponse.redirect(new URL('/user/login', request.url));
        }

        const data = await res.json();
        const newAccessToken = data.accessToken;

        // 4. ⭐ [핵심] Page.tsx로 토큰 배달 (헤더 변조)
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('Authorization', `Bearer ${newAccessToken}`);

        // 5. 헤더를 실어서 다음 단계로 진행
        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        // 6. 브라우저에도 쿠키 구워주기
        response.cookies.set(ACCESS_COOKIE, newAccessToken, cookieOpts.access);

        return response;

    } catch (e) {
        return NextResponse.redirect(new URL('/user/login', request.url));
    }
}

export const config = {
    matcher: [
        '/user/mypage/:path*',
        '/user/signup',
        '/user/login',
    ], // 적용 범위 확실하게
};