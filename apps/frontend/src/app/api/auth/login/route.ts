import {NextRequest, NextResponse} from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts } from '@/app/lib/auth-cookies';

export async function POST(req: NextRequest) {
    const body = await req.json();

    const response = await fetch('/server-api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const m = await response.json().catch(() => ({}));
        return NextResponse.json({message: m.message ?? '로그인 실패'}, {status: response.status})
    }

    const data = await response.json();

    const resp = NextResponse.json({user: data.user});
    resp.cookies.set(ACCESS_COOKIE, data.accessToken, cookieOpts.access);
    resp.cookies.set(REFRESH_COOKIE, data.refreshToken, cookieOpts.refresh);

    return resp;
}