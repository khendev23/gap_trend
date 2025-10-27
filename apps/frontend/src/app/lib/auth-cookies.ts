// app/lib/auth-cookies.ts
export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

export const cookieOpts = {
    access: { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 15 },
    refresh:{ httpOnly: true, secure: true, sameSite: 'strict' as const, path: '/api/auth', maxAge: 60 * 60 * 24 * 30 },
};
