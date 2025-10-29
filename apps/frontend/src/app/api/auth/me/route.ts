// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = new URL('/server-api/auth/me', req.url);
    const access = req.cookies.get('access_token')?.value;

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Cookie: req.headers.get('cookie') ?? '',
            ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        cache: 'no-store',
    });

    const text = await res.text();
    const response = new NextResponse(text, { status: res.status });
    res.headers.forEach((v, k) => {
        if (k.toLowerCase() === 'set-cookie') response.headers.append('set-cookie', v);
    });
    response.headers.set('content-type', res.headers.get('content-type') ?? 'application/json');
    return response;
}
