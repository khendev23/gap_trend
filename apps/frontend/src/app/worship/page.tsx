"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export default function WorshipBoard() {
    type Category = "all" | "sundayAM" | "sundayPM" | "wednesday" | "friday" | "youth";
    interface Post {
        id: number;
        date: string;
        title: string;
        verse: string;
        preacher: string;
        category: Exclude<Category, "all">;
        thumbnail: string;
    }

    const [category, setCategory] = useState<Category>("all");
    const [q, setQ] = useState<string>("");

    const posts: Post[] = [
        {
            id: 1,
            date: "2025-09-25",
            title: "수요예배 안내",
            verse: "시편 23편",
            preacher: "홍길동 목사",
            category: "wednesday",
            thumbnail:
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
        },
        {
            id: 2,
            date: "2025-09-28",
            title: "주일 오전 예배",
            verse: "요한복음 3:16",
            preacher: "이순신 목사",
            category: "sundayAM",
            thumbnail:
                "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=400&auto=format&fit=crop",
        },
        {
            id: 3,
            date: "2025-09-28",
            title: "주일 오후예배",
            verse: "로마서 8:28",
            preacher: "김철수 목사",
            category: "sundayPM",
            thumbnail:
                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=400&auto=format&fit=crop",
        },
        {
            id: 4,
            date: "2025-09-26",
            title: "금요기도회",
            verse: "사도행전 2:42",
            preacher: "박영희 목사",
            category: "friday",
            thumbnail:
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop",
        },
        {
            id: 5,
            date: "2025-09-27",
            title: "청년예배",
            verse: "디모데전서 4:12",
            preacher: "최민수 전도사",
            category: "youth",
            thumbnail:
                "https://images.unsplash.com/photo-1536104968055-4d61aa56f46a?q=80&w=400&auto=format&fit=crop",
        },
    ];

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        return posts
            .filter((p) => (category === "all" ? true : p.category === category))
            .filter(
                (p) =>
                    !query ||
                    p.title.toLowerCase().includes(query) ||
                    p.verse.toLowerCase().includes(query) ||
                    p.preacher.toLowerCase().includes(query)
            );
    }, [category, q]);

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-24">
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
                <div className="mx-auto max-w-xl px-4 py-3 grid grid-cols-3 items-center">
                    <div className="justify-self-start">
                        <button
                            aria-label="Back"
                            className="rounded-xl p-2 active:scale-95 transition"
                            onClick={() => history.back()}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                    </div>
                    <h1 className="text-center font-bold tracking-tight whitespace-nowrap text-[clamp(1rem,5vw,1.25rem)]">
                        예배 게시판
                    </h1>
                    <div className="justify-self-end" />
                </div>

                {/* 필터 버튼 두 줄 */}
                <div className="mx-auto max-w-xl px-4 pb-3 space-y-2">
                    <div className="flex items-center rounded-2xl bg-gray-100 p-1">
                        <SegButton active={category === "all"} onClick={() => setCategory("all")}>
                            전체
                        </SegButton>
                        <SegButton active={category === "sundayAM"} onClick={() => setCategory("sundayAM")}>
                            주일오전
                        </SegButton>
                        <SegButton active={category === "sundayPM"} onClick={() => setCategory("sundayPM")}>
                            주일오후
                        </SegButton>
                    </div>
                    <div className="flex items-center rounded-2xl bg-gray-100 p-1">
                        <SegButton active={category === "wednesday"} onClick={() => setCategory("wednesday")}>
                            수요
                        </SegButton>
                        <SegButton active={category === "friday"} onClick={() => setCategory("friday")}>
                            금요
                        </SegButton>
                        <SegButton active={category === "youth"} onClick={() => setCategory("youth")}>
                            청년
                        </SegButton>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-xl px-4">
                <ul role="list" className="divide-y divide-gray-200">
                    {filtered.map((p) => (
                        <li key={p.id} className="py-3">
                            <article className="flex items-start gap-3">
                                <div className="relative w-32 aspect-video shrink-0 overflow-hidden rounded-xl bg-gray-200">
                                    <Image
                                        src={p.thumbnail}
                                        alt="썸네일"
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1 min-w-0 text-sm leading-5">
                                    <p className="text-gray-500">{p.date}</p>
                                    <p className="font-semibold text-gray-900">{p.title}</p>
                                    <p className="text-gray-600">{p.verse}</p>
                                    <p className="text-gray-500">{p.preacher}</p>
                                </div>
                            </article>
                        </li>
                    ))}
                    {filtered.length === 0 && (
                        <li className="py-16 text-center text-sm text-gray-500">검색 결과가 없습니다.</li>
                    )}
                </ul>
            </main>

            <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 backdrop-blur">
                <div className="mx-auto max-w-xl px-4 py-3 pb-[env(safe-area-inset-bottom)]">
                    <label className="relative block">
                        <span className="sr-only">Search</span>
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-3.6-3.6" />
              </svg>
            </span>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="예배 게시글 검색"
                            className="w-full rounded-2xl bg-gray-100 px-10 py-2.5 text-base outline-none ring-1 ring-transparent focus:ring-gray-300"
                            type="search"
                            inputMode="search"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}

function SegButton({
                       active,
                       onClick,
                       children,
                   }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "flex-1 rounded-xl px-3 py-2 text-sm transition",
                active ? "bg-white shadow text-gray-900" : "text-gray-700",
            ].join(" ")}
        >
            {children}
        </button>
    );
}
