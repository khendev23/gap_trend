// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts } from '@/app/lib/auth-cookies';

export async function POST(req: NextRequest) {
    const cookies = req.cookies;
    const rt = cookies.get(REFRESH_COOKIE)?.value ?? '';
    const at = cookies.get(ACCESS_COOKIE)?.value ?? '';

    await fetch('/server-api/auth/logout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt, accessToken: at }),
    }).catch(() => {});

    const resp = NextResponse.json({ ok: true });
    resp.cookies.set(ACCESS_COOKIE, '', { ...cookieOpts.access, maxAge: 0 });
    resp.cookies.set(REFRESH_COOKIE, '', { ...cookieOpts.refresh, maxAge: 0 });
    return resp;
}
