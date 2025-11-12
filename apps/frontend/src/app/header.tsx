"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import HeaderMenu from "@/component/main/ts/headerMenu";
import {router} from "next/client";

type MegaItem = { label: string; href: string; desc?: string };
type MegaGroup = { title: string; items: MegaItem[] };

const NAV: Array<{
    key: string;
    label: string;
    groups?: MegaGroup[];
    href?: string;
}> = [
    {
        key: "gospel",
        label: "복음",
        groups: [
            {
                title: "신학/신앙",
                items: [
                    { label: "정통신학", href: "/gospel/theology" },
                    { label: "신앙의 삶", href: "/gospel/life" },
                    { label: "신앙고백", href: "/gospel/confession" },
                ],
            },
        ],
    },
    {
        key: "worship",
        label: "예배",
        groups: [
            {
                title: "예배",
                items: [
                    { label: "예배", href: "/worship" },
                    { label: "예배 안내", href: "/worship/worship-info" },
                ],
            },
        ],
    },
    {
        key: "church",
        label: "교회",
        groups: [
            {
                title: "소개",
                items: [
                    { label: "교회소개", href: "/church/church-info" },
                    { label: "목사님 소개", href: "/church/pastor" },
                    { label: "목회비전", href: "/church/vision" },
                    { label: "섬기는이", href: "/church/leaders" },
                    { label: "오시는길", href: "/church/location" },
                    { label: "연간행사", href: "/church/annual-events" },
                ],
            },
        ],
    },
    { key: "notice", label: "공지/소식", href: "/notice" },
    {
        key: "ministry",
        label: "사역",
        groups: [
            {
                title: "사역",
                items: [
                    { label: "이단", href: "/ministry/heresy-counseling" },
                    { label: "양육", href: "/ministry/discipleship" },
                    { label: "상담", href: "/ministry/counsel" },
                ],
            },
            {
                title: "다음 세대",
                items: [
                    { label: "우리는청년", href: "/groups/weare" },
                    { label: "라온학생부", href: "/groups/laon" },
                    { label: "주일학교", href: "/groups/kids" },
                ],
            },
            {
                title: "목장/기관",
                items: [
                    { label: "사랑목장", href: "/groups/love" },
                    { label: "푸른목장", href: "/groups/green" },
                    { label: "OK목장", href: "/groups/ok" },
                    { label: "평강목장", href: "/groups/peace" },
                    { label: "온유목장", href: "/groups/onyu" },
                    { label: "은혜목장", href: "/groups/grace" },
                    { label: "쉴만한목장", href: "/groups/rest" },
                    { label: "믿음목장", href: "/groups/faith" },
                ],
            },
        ],
    },
];

type AuthUser = {
    id: string;
    name?: string | null;
    role?: string | null;
} | null;

type AppHeaderProps = {
    user: AuthUser;
};

export default function Header({user}: AppHeaderProps) {

    // 모바일 사이드 메뉴
    const [menuOpen, setMenuOpen] = useState(false);

    // 데스크탑 메가 메뉴
    const [openKey, setOpenKey] = useState<string | null>(null);
    const [hovering, setHovering] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const closeTimer = useRef<number | null>(null);

    // 바디 스크롤 잠금 (모바일 메뉴 열릴 때)
    useEffect(() => {
        if (menuOpen) document.body.classList.add("overflow-hidden");
        else document.body.classList.remove("overflow-hidden");
        return () => document.body.classList.remove("overflow-hidden");
    }, [menuOpen]);

    // 바깥 클릭 시 메가 메뉴 닫기
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!panelRef.current) return;
            if (panelRef.current.contains(e.target as Node)) return;
            setOpenKey(null);
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    // hover-out 약간 지연 닫기
    const scheduleClose = () => {
        if (closeTimer.current) window.clearTimeout(closeTimer.current);
        closeTimer.current = window.setTimeout(() => {
            if (!hovering) setOpenKey(null);
        }, 120);
    };

    return (
        <>
            {/* 고정 헤더 */}
            <header className="fixed inset-x-0 top-0 z-40 bg-white border-b border-gray-100 pt-[env(safe-area-inset-top)] h-14 md:h-16">
                <div className="mx-auto max-w-6xl h-full px-3 md:px-4 flex items-center justify-between">
                    {/* 좌: 로그인 */}
                    {user ? (
                        <>
                            <span className="text-gray-700 text-sm">
                                {user.name ?? "사용자"} 성도님 환영합니다
                            </span>
                            <button
                                onClick={() => router.push("/mypage")}
                                className="text-sm px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition"
                                title="내정보"
                            >
                                ⚙️ 내정보
                            </button>
                            <button
                                // onClick={handleLogout}
                                className="text-sm px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition"
                                title="로그아웃"
                            >
                                🚪 로그아웃
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/user/login"
                            className="flex items-center justify-center w-10 h-10 text-black"
                            aria-label="로그인"
                        >
                            <UserIcon className="h-6 w-6" />
                        </Link>
                    )}

                    {/* 중앙: 로고 */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/">
                            <img
                                src="https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/web/logo.jpeg"
                                alt="홈으로 이동"
                                className="h-8 md:h-10 w-auto"
                            />
                        </Link>
                    </div>

                    {/* 우: 모바일 햄버거 / 데스크탑 내비 */}
                    <div className="flex items-center gap-2">
                        {/* 데스크탑 내비 + 메가 트리거 */}
                        <nav className="hidden md:flex items-center gap-1">
                            {NAV.map((m) =>
                                m.groups ? (
                                    <button
                                        key={m.key}
                                        type="button"
                                        onMouseEnter={() => {
                                            setHovering(true);
                                            setOpenKey(m.key);
                                        }}
                                        onMouseLeave={() => {
                                            setHovering(false);
                                            scheduleClose();
                                        }}
                                        onClick={() => setOpenKey((k) => (k === m.key ? null : m.key))}
                                        className={[
                                            "px-3 py-2 text-sm rounded-lg transition",
                                            openKey === m.key
                                                ? "bg-gray-100 text-gray-900"
                                                : "text-gray-700 hover:bg-gray-50",
                                        ].join(" ")}
                                        aria-expanded={openKey === m.key}
                                        aria-haspopup="true"
                                    >
                                        {m.label}
                                    </button>
                                ) : (
                                    <Link
                                        key={m.key}
                                        href={m.href!}
                                        className="px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        {m.label}
                                    </Link>
                                )
                            )}
                        </nav>

                        {/* 모바일 햄버거 (기존 HeaderMenu 연동) */}
                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            className="md:hidden flex items-center justify-center w-10 h-10 text-black"
                            aria-label="메뉴 열기"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* 데스크탑 메가 메뉴 패널 */}
                <MegaPanel
                    openKey={openKey}
                    onMouseEnter={() => {
                        setHovering(true);
                        if (openKey) setOpenKey(openKey);
                    }}
                    onMouseLeave={() => {
                        setHovering(false);
                        scheduleClose();
                    }}
                    ref={panelRef}
                />
            </header>

            {/* 헤더 높이만큼 본문 패딩 */}
            <div className="pt-[calc(env(safe-area-inset-top)+3.5rem)] md:pt-[calc(env(safe-area-inset-top)+4rem)]" />

            {/* 모바일 사이드 메뉴 (기존 컴포넌트) */}
            <HeaderMenu isOpen={menuOpen} closeAction={() => setMenuOpen(false)} />
        </>
    );
}

/* ===== 메가 메뉴 패널 ===== */
type MegaPanelProps = {
    openKey: string | null;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
};

const MegaPanel = Object.assign(
    // eslint-disable-next-line react/display-name
    (props: MegaPanelProps & { ref?: React.Ref<HTMLDivElement> }) => {
        const { openKey, onMouseEnter, onMouseLeave, ref } = props;
        const def = NAV.find((n) => n.key === openKey);

        return (
            <div
                ref={ref as any}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={[
                    "absolute inset-x-0 top-full", // 헤더 바로 아래
                    "hidden md:block",              // 데스크탑만
                    "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80",
                    "border-b border-gray-100 shadow-sm",
                    "transition-[opacity,transform] duration-200",
                    openKey
                        ? "opacity-100 translate-y-0"
                        : "pointer-events-none opacity-0 -translate-y-1",
                ].join(" ")}
                aria-hidden={!openKey}
            >
                <div className="mx-auto max-w-6xl px-6 py-6">
                    {!def?.groups ? (
                        <div className="text-sm text-gray-500">메뉴를 선택하세요.</div>
                    ) : (
                        <div className="grid grid-cols-12 gap-6">
                            {def.groups.map((g, idx) => (
                                <div key={idx} className="col-span-12 md:col-span-4">
                                    <h4 className="mb-2 text-sm font-semibold text-gray-900">
                                        {g.title}
                                    </h4>
                                    <ul className="space-y-1">
                                        {g.items.map((it) => (
                                            <li key={it.href}>
                                                <Link
                                                    href={it.href}
                                                    className="group flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-gray-50"
                                                >
                                                    <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-800 group-hover:text-gray-900">
                                                            {it.label}
                                                        </div>
                                                        {it.desc && (
                                                            <div className="text-xs text-gray-500">{it.desc}</div>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    },
    {}
);

/* ===== 아이콘 ===== */
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <circle cx="12" cy="8.5" r="3.5" strokeWidth="2" />
            <path d="M5 20a7 7 0 0 1 14 0" strokeWidth="2" />
        </svg>
    );
}
function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
