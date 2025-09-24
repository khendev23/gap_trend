'use client'

import Link from "next/link";
import HeaderMenu from "@/component/main/ts/headerMenu";
import { useEffect, useState } from "react";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    // 메뉴 오픈 시 바디 스크롤 잠금
    useEffect(() => {
        if (menuOpen) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [menuOpen]);

    return (
        <>
            {/* 고정 헤더 */}
            <header
                className="
                  fixed inset-x-0 top-0 z-20
                  bg-white border-b border-gray-100
                  pt-[env(safe-area-inset-top)]
                  h-14 md:h-16
                  flex items-center justify-between
                  px-3 md:px-4
                "
            >
                {/* 로그인 아이콘 */}
                <Link
                    href="/user/login"
                    className="flex items-center justify-center w-10 h-10 text-black"
                    aria-label="로그인"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="icon icon-tabler icons-tabler-outline icon-tabler-user-circle">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
                        <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                        <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/>
                    </svg>
                </Link>

                {/* 로고 (가운데 고정) */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <Link href="/">
                        <img
                            src="https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/web/logo.jpeg"
                            alt="홈으로 이동"
                            className="h-8 md:h-10 w-auto"
                        />
                    </Link>
                </div>

                {/* 메뉴 버튼 */}
                <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className="flex items-center justify-center w-10 h-10 text-black"
                    aria-label="메뉴 열기"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="icon icon-tabler icons-tabler-outline icon-tabler-menu-2">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M4 6l16 0"/>
                        <path d="M4 12l16 0"/>
                        <path d="M4 18l16 0"/>
                    </svg>
                </button>
            </header>

            {/* 헤더 높이만큼 본문 패딩(겹침 방지) */}
            <div className="pt-[calc(env(safe-area-inset-top)+3.5rem)] md:pt-[calc(env(safe-area-inset-top)+4rem)]" />

            {/* 메뉴(항상 마운트, 클래스 토글로 슬라이드 인/아웃) */}
            <HeaderMenu isOpen={menuOpen} closeAction={() => setMenuOpen(false)} />
        </>
    );
}