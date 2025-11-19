'use client'

import Link from "next/link";
import { useEffect, useRef } from "react";

type HeaderMenuProps = {
    isOpen: boolean;
    closeAction: () => void;
};

export default function HeaderMenu({ isOpen, closeAction }: HeaderMenuProps) {
    const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

    // ESC 키로 닫기
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeAction();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [closeAction]);

    // 열릴 때 첫 번째 포커스(접근성)
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => firstLinkRef.current?.focus(), 0);
        }
    }, [isOpen]);

    return (
        <>
            {/* 오버레이: 페이드 인/아웃 */}
            <div
                onClick={closeAction}
                className={`
                  fixed inset-0 z-[1000] md:hidden
                  bg-black/40 transition-opacity duration-300
                  ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
                `}
                aria-hidden="true"
            />

            {/* 사이드 메뉴: 오른쪽에서 슬라이드 인/아웃 */}
            <aside
                className={`
                  fixed top-0 right-0 z-[1001] md:hidden
                  w-[250px] h-dvh
                  bg-white text-black
                  shadow-[-2px_0_5px_rgba(0,0,0,0.2)]
                  p-5 overflow-y-auto
                  pt-[calc(env(safe-area-inset-top)+1rem)]
                  transform transition-transform duration-300 ease-out
                  ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-menu-title"
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={closeAction}
                    aria-label="메뉴 닫기"
                    className="fixed right-5 top-4 text-[28px] leading-none bg-transparent border-0 cursor-pointer"
                >
                    &times;
                </button>

                {/* 메뉴 본문 */}
                <nav className="mt-6 space-y-10">
                    <section>
                        <h3 id="mobile-menu-title" className="sr-only">모바일 메뉴</h3>
                        <h3 className="text-base font-semibold">복음</h3>
                        <ul className="list-none pl-2 mt-2 space-y-4">
                            <li><Link ref={firstLinkRef} href="/gospel/theology" onClick={closeAction} className="text-[16px] text-[#333] no-underline">정통신학</Link></li>
                            <li><Link href="/gospel/life" onClick={closeAction} className="text-[16px] text-[#333] no-underline focus:outline-none">신앙의삶</Link></li>
                            <li><Link href="/gospel/confession" onClick={closeAction} className="text-[16px] text-[#333] no-underline focus:outline-none">신앙고백</Link></li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-base font-semibold">예배</h3>
                        <ul className="list-none pl-2 mt-2 space-y-4">
                            <li><Link href="/worship" onClick={closeAction} className="text-[16px] text-[#333] no-underline">예배</Link></li>
                            <li><Link href="/worship/worship-info" onClick={closeAction} className="text-[16px] text-[#333] no-underline">예배 안내</Link></li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-base font-semibold">교회</h3>
                        <ul className="list-none pl-2 mt-2 space-y-4">
                            <li><Link href="/church/church-info" onClick={closeAction} className="text-[16px] text-[#333] no-underline">교회소개</Link></li>
                            <li><Link href="/church/pastor" onClick={closeAction} className="text-[16px] text-[#333] no-underline">목사님 소개</Link></li>
                            <li><Link href="/church/vision" onClick={closeAction} className="text-[16px] text-[#333] no-underline">목회비전</Link></li>
                            <li><Link href="/church/leaders" onClick={closeAction} className="text-[16px] text-[#333] no-underline">섬기는이</Link></li>
                            <li><Link href="/church/location" onClick={closeAction} className="text-[16px] text-[#333] no-underline">오시는길</Link></li>
                            <li><Link href="/church/annual-events" onClick={closeAction} className="text-[16px] text-[#333] no-underline">연간행사</Link></li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-base font-semibold">공지/소식</h3>
                        <ul className="list-none pl-2 mt-2 space-y-4">
                            <li><Link href="/notice" onClick={closeAction} className="text-[16px] text-[#333] no-underline">공지사항/교회소식</Link></li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-base font-semibold">사역</h3>
                        <ul className="list-none pl-2 mt-2 space-y-4">
                            <li><Link href="/ministry/heresy-counseling" onClick={closeAction} className="text-[16px] text-[#333] no-underline">이단</Link></li>
                            <li><Link href="/ministry/discipleship" onClick={closeAction} className="text-[16px] text-[#333] no-underline">양육</Link></li>
                            <li><Link href="/ministry/counsel" onClick={closeAction} className="text-[16px] text-[#333] no-underline">상담</Link></li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-base font-semibold">다음 세대</h3>
                        <ul className="list-none pl-2 mt-2 space-y-4">
                            <li><Link href="/groups/weare" onClick={closeAction} className="text-[16px] text-[#333] no-underline">우리는청년</Link></li>
                            <li><Link href="/groups/laon" onClick={closeAction} className="text-[16px] text-[#333] no-underline">라온학생부</Link></li>
                            <li><Link href="/groups/kids" onClick={closeAction} className="text-[16px] text-[#333] no-underline">주일학교</Link></li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-base font-semibold">목장/기관</h3>
                        <ul className="list-none pl-2 mt-2 space-y-4">
                            <li><Link href="/groups/love" onClick={closeAction} className="text-[16px] text-[#333] no-underline">사랑목장</Link></li>
                            <li><Link href="/groups/green" onClick={closeAction} className="text-[16px] text-[#333] no-underline">푸른목장</Link></li>
                            <li><Link href="/groups/ok" onClick={closeAction} className="text-[16px] text-[#333] no-underline">OK목장</Link></li>
                            <li><Link href="/groups/peace" onClick={closeAction} className="text-[16px] text-[#333] no-underline">평강목장</Link></li>
                            <li><Link href="/groups/onyu" onClick={closeAction} className="text-[16px] text-[#333] no-underline">온유목장</Link></li>
                            <li><Link href="/groups/grace" onClick={closeAction} className="text-[16px] text-[#333] no-underline">은혜목장</Link></li>
                            <li><Link href="/groups/rest" onClick={closeAction} className="text-[16px] text-[#333] no-underline">쉴만한목장</Link></li>
                            <li><Link href="/groups/faith" onClick={closeAction} className="text-[16px] text-[#333] no-underline">믿음목장</Link></li>
                        </ul>
                    </section>
                </nav>
            </aside>
        </>
    );
}