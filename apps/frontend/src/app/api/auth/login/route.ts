import {NextRequest, NextResponse} from "next/server";

const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';
const cookieOpts = {
    access: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 2 },
    refresh: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/api/auth', maxAge: 60 * 60 * 24 * 30 },
}

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
    resp.cookies.set(ACCESS_TOKEN, data.accessToken, cookieOpts.access);
    resp.cookies.set(REFRESH_TOKEN, data.refreshToken, cookieOpts.refresh);

    return resp;
}