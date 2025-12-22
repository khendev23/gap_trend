// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts } from '@/app/lib/auth-cookies';

export async function POST(req: NextRequest) {
    const cookies = req.cookies;
    const rt = cookies.get(REFRESH_COOKIE)?.value ?? '';
    const at = cookies.get(ACCESS_COOKIE)?.value ?? '';

    console.log(rt)

    let r: Response | null = null;

    const logoutUrl = new URL('/server-api/auth/login', req.url);

    try {
        r = await fetch(logoutUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rt }),
        });
    } catch (e) {
        console.log(e)
    }

    const resp = NextResponse.json({ ok: true });
    resp.cookies.set(ACCESS_COOKIE, '', { ...cookieOpts.access, maxAge: 0 });
    resp.cookies.set(REFRESH_COOKIE, '', { ...cookieOpts.refresh, maxAge: 0 });
    resp.cookies.delete("session_user");
    return resp;
}
