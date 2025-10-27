// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_COOKIE } from '@/app/lib/auth-cookies';

export function middleware(req: NextRequest) {
    const protectedPaths = ['/admin', '/mypage'];
    const needAuth = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p));
    if (!needAuth) return NextResponse.next();

    const hasAT = !!req.cookies.get(ACCESS_COOKIE)?.value;
    if (!hasAT) {
        const url = new URL('/user/login', req.url);
        url.searchParams.set('next', req.nextUrl.pathname);
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/mypage/:path*'] };
