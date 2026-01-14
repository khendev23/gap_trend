// components/auth/AuthInitializer.tsx
"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, AuthUser } from "@/app/lib/useAuthStore";

export default function AuthInitializer({ serverUser }: { serverUser: AuthUser }) {
    const setUser = useAuthStore((state) => state.setUser);
    const initialized = useRef(false);

    // 렌더링 시 서버 데이터를 스토어에 딱 한 번만 주입
    if (!initialized.current) {
        setUser(serverUser);
        initialized.current = true;
    }

    return null;
}