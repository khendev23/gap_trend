"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// 모바일 퍼스트 게시판 예시 (TypeScript)
// - 검색 바
// - 공지/게시글 리스트 (제목, 요약)
// - 항목 클릭 시 /notice/[id] 상세로 이동
export default function MobileBulletinBoard() {
    const [q, setQ] = useState<string>("");
    const [category, setCategory] = useState<null | "notice" | "news">("notice");

    function getDetailHref(p: Post) {
        return p.category === "notice" ? `/notice/${p.id}` : `/news/${p.id}`;
    }

    interface Post {
        id: number;
        title: string;
        body: string;
        isNotice?: boolean;
        category: "notice" | "news"; // 공지사항, 교회소식
    }

    const posts: Post[] = [
        {
            id: 1,
            title: "Notice Title",
            body: "This is the content of the notice.",
            isNotice: true,
            category: "notice",
        },
        {
            id: 2,
            title: "Post Title",
            body: "Here is the content of the post.",
            category: "news",
        },
        {
            id: 3,
            title: "Post Title",
            body: "The content of the post goes here.",
            category: "news",
        },
        {
            id: 4,
            title: "Long Post Title",
            body: "The content of the post goes here",
            category: "news",
        },
        {
            id: 5,
            title: "Post Title",
            body: "Here is the content of the post",
            category: "news",
        },
        {
            id: 6,
            title: "Another Notice",
            body: "Important church notice content.",
            isNotice: true,
            category: "notice",
        },
    ];

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        return posts
            .filter((p) => (category ? p.category === category : true))
            .filter(
                (p) =>
                    !query ||
                    p.title.toLowerCase().includes(query) ||
                    p.body.toLowerCase().includes(query)
            );
    }, [q, category]);

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-24">
            {/* 상단 헤더 */}
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
                <div className="mx-auto max-w-xl px-4 py-3 grid grid-cols-3 items-center">
                    <button
                        aria-label="Back"
                        className="justify-self-start"
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
                    <h1 className="font-bold tracking-tight text-center text-[clamp(1rem,5vw,1.25rem)] whitespace-nowrap">
                        공지사항/교회소식
                    </h1>
                </div>

                {/* 상단 필터 버튼 영역 */}
                <div className="mx-auto max-w-xl px-4 pb-3">
                    <div className="flex gap-2">
                        <FilterButton
                            active={category === "notice"}
                            onClick={() =>
                                setCategory((c) => (c === "notice" ? null : "notice"))
                            }
                        >
                            공지사항
                        </FilterButton>
                        <FilterButton
                            active={category === "news"}
                            onClick={() => setCategory((c) => (c === "news" ? null : "news"))}
                        >
                            교회소식
                        </FilterButton>
                    </div>
                </div>
            </header>

            {/* 리스트 */}
            <main className="mx-auto max-w-xl px-4">
                <ul role="list" className="divide-y divide-gray-200">
                    {filtered.map((p) => (
                        <li key={p.id} className="py-3">
                            <Link
                                href={getDetailHref(p)}
                                aria-label={`${p.title} 상세 보기`}
                                className="block rounded-xl p-3 -m-3 hover:bg-gray-50 active:bg-gray-100 transition"
                            >
                                <article className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="text-base font-semibold leading-6">
                                            {p.isNotice && (
                                                <span className="mr-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 align-middle">
                          NOTICE
                        </span>
                                            )}
                                            <span className="align-middle line-clamp-1">
                        {p.title}
                      </span>
                                        </h2>
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                            {p.body}
                                        </p>
                                    </div>

                                    {/* 우측 화살표 아이콘 (탭 가능 영역 강조) */}
                                    <div className="shrink-0 self-center text-gray-400">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </div>
                                </article>
                            </Link>
                        </li>
                    ))}

                    {filtered.length === 0 && (
                        <li className="py-16 text-center text-sm text-gray-500">
                            검색 결과가 없습니다.
                        </li>
                    )}
                </ul>
            </main>

            {/* 하단 고정 검색바 */}
            <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
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
                            placeholder="검색어를 입력하세요"
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

function FilterButton({
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
                "px-3 py-2 text-sm rounded-xl border transition",
                active
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-100 text-gray-700 border-gray-200 active:bg-gray-200",
            ].join(" ")}
        >
            {children}
        </button>
    );
}
