import {NextRequest, NextResponse} from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts } from '@/app/lib/auth-cookies';
import {cookies, headers} from "next/headers";


function serverDetectDeviceType(ua: string): 'mobile'|'tablet'|'desktop' {
    const low = ua.toLowerCase();
    const isTablet = /(ipad|tablet|sm-t|tab|lenovo tab|kindle|silk)/i.test(low);
    const isMobile = /(iphone|ipod|android(?!.*tablet)|windows phone|mobi)/i.test(low);
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const jar = await cookies();
    const hdrs = await headers();
    const hadRtCookie = !!jar.get(REFRESH_COOKIE)?.value; // ← 평문 미전달, 존재 여부만

    const didCookie = jar.get('did')?.value;
    const ua = hdrs.get('user-agent') ?? '';

    const deviceId = body.deviceId ?? didCookie ?? crypto.randomUUID(); // 최후 보정
    // const deviceType = body.deviceType ?? serverDetectDeviceType(ua);

    const loginUrl = new URL('/server-api/auth/login', req.url);

    const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...body, deviceId, hadRtCookie }),
        cache: 'no-store',
    });


    if (!response.ok) {
        const m = await response.json().catch(() => ({}));
        return NextResponse.json({message: m.message ?? '로그인 실패'}, {status: response.status})
    }

    const data = await response.json();

    // 🚨 [디버깅용 로그 추가]
    console.log("=== 백엔드 응답 데이터 확인 ===");
    console.log("Access Token:", !!data.accessToken); // true여야 함
    console.log("Refresh Token:", data.refreshToken); // 여기가 undefined인지 확인!!
    console.log("Refresh Cookie Option:", cookieOpts.refresh);
    console.log("============================");

    const resp = NextResponse.json({user: data.user});
    resp.cookies.set(ACCESS_COOKIE, data.accessToken, cookieOpts.access);
    if (data.refreshToken) {
        resp.cookies.set(REFRESH_COOKIE, data.refreshToken, cookieOpts.refresh);
    }

    // did 쿠키가 없다면(혹은 위에서 새로 만들었다면) 심어줌
    if (!didCookie) {
        resp.cookies.set('did', deviceId, {
            httpOnly: false, // 클라에서도 읽게
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 400,
        });
    }

    resp.cookies.set("session_user", JSON.stringify(data.user), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7일 예시
        // secure: process.env.NODE_ENV === "production",
    });

    return resp;
}