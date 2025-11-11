import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getUserFromCookie() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return { id: payload.sub, name: payload.name, role: payload.role };
    } catch {
        return null;
    }
}
