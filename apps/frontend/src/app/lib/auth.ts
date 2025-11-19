import { cookies } from "next/headers";
import {JWTPayload, jwtVerify} from "jose";

interface AccessPayload extends JWTPayload {
    sub: string;          // user id
    name?: string | null;
    role?: string | null;
    approval?: string | null;
}

type AuthUser = {
    id: string;
    name?: string | null;
    role?: string | null;
    approval?: string | null;
} | null;

export async function getUserFromCookie() : Promise<AuthUser> {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;

    try {
        const secretKey = process.env.JWT_ACCESS_SECRET;
        if (!secretKey) {
            console.error("JWT_ACCESS_SECRET is not defined");
            return null;
        }
        const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
        const { payload } = await jwtVerify(token, secret) as {payload: AccessPayload};
        console.log(payload);
        return { id: payload.sub, name: payload.name, role: payload.role, approval: payload.approval };
    } catch(e) {
        console.error("Token verification failed:", e);
        return null;
    }
}
