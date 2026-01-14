"use client";

import {useState, useMemo, useEffect} from "react";
import Link from "next/link";

interface Post {
    id: number;
    title: string;
    body: string;
    isNotice?: boolean;
    category: "notice" | "news"; // 공지사항, 교회소식
}

export default function MobileBulletinBoard() {
    const [q, setQ] = useState<string>("");
    const [category, setCategory] = useState<null | "notice" | "news">("notice");
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    function getDetailHref(p: Post) {
        return p.category === "notice" ? `/notice/${p.id}` : `/news/${p.id}`;
    }

    useEffect(() => {
        const ctrl = new AbortController();

        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/server-api/notices/noticeLists', {
                    signal: ctrl.signal,
                    cache: 'no-store',
                });

                if (!res.ok) {
                    throw new Error(`서버 에러: ${res.status}`);
                }

                const data = (await res.json()) as Post[];
                console.log(data);
                setPosts(data); // 데이터 상태 업데이트
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Fetch error:", err);
                    setError(err.message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();

        return () => ctrl.abort();
    }, []);

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
    }, [q, category, posts]);

    // 예시: 실제로는 로그인 세션/권한 API로 대체
    const isAdmin: boolean = true; // 👉 true면 업로드 버튼 보임

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-24">
            {/* 상단 헤더 */}
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
                <div className="mx-auto max-w-xl md:max-w-2xl lg:max-w-4xl px-4 py-3 flex items-center justify-between gap-2">
                    {/* 뒤로가기 버튼 (데스크탑에서는 투명 처리로 레이아웃 유지) */}
                    <button
                        aria-label="Back"
                        className="rounded-lg p-2 hover:bg-gray-100 lg:opacity-0 lg:pointer-events-none"
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

                    {/* 가운데 제목 */}
                    <h1 className="font-bold tracking-tight text-[clamp(1rem,5vw,1.25rem)] whitespace-nowrap text-center flex-1">
                        공지사항/교회소식
                    </h1>

                    {/* 오른쪽 글쓰기 버튼 */}
                    {isAdmin ? (
                        <Link
                            href="/notice/write"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 active:scale-95"
                        >
                            글쓰기
                        </Link>
                    ) : (
                        <div className="w-14" />
                    )}
                </div>

                {/* 🖥 태블릿/데스크탑용 상단 필터 + 검색 */}
                <div className="hidden md:block border-t">
                    <div className="mx-auto max-w-2xl lg:max-w-4xl px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        {/* 카테고리 필터 */}
                        <div className="flex flex-wrap gap-2">
                            <FilterButton
                                active={category === null}
                                onClick={() => setCategory(null)}
                            >
                                전체
                            </FilterButton>
                            <FilterButton
                                active={category === "notice"}
                                onClick={() => setCategory("notice")}
                            >
                                공지사항
                            </FilterButton>
                            <FilterButton
                                active={category === "news"}
                                onClick={() => setCategory("news")}
                            >
                                교회소식
                            </FilterButton>
                        </div>

                        {/* 검색 인풋 (태블릿 이상은 상단 배치) */}
                        <div className="w-full md:w-72 lg:w-80">
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
                                    className="w-full rounded-2xl bg-gray-100 px-10 py-2.5 text-sm lg:text-base outline-none ring-1 ring-transparent focus:ring-gray-300"
                                    type="search"
                                    inputMode="search"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </header>

            {/* 리스트 */}
            <main className="mx-auto max-w-xl md:max-w-2xl lg:max-w-4xl px-4 pt-4 md:pt-6">
                {/* 📱 모바일용 간단 필터 (선택) */}
                <div className="mb-3 flex gap-2 md:hidden overflow-x-auto">
                    <FilterButton
                        active={category === null}
                        onClick={() => setCategory(null)}
                    >
                        전체
                    </FilterButton>
                    <FilterButton
                        active={category === "notice"}
                        onClick={() => setCategory("notice")}
                    >
                        공지
                    </FilterButton>
                    <FilterButton
                        active={category === "news"}
                        onClick={() => setCategory("news")}
                    >
                        소식
                    </FilterButton>
                </div>

                {isLoading ? (
                    <div className="py-20 text-center">데이터를 불러오는 중입니다...</div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">{error}</div>
                ) : (
                    <ul role="list" className="divide-y divide-gray-200">
                        {filtered.map((p) => (
                            <li key={p.id} className="py-3 md:py-4">
                                <Link
                                    href={getDetailHref(p)}
                                    aria-label={`${p.title} 상세 보기`}
                                    className="block rounded-xl p-3 md:p-4 -m-3 hover:bg-gray-50 active:bg-gray-100 transition"
                                >
                                    <article className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="text-base md:text-lg font-semibold leading-6">
                                                {p.isNotice && (
                                                    <span className="mr-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 align-middle">
                                                        공지
                                                    </span>
                                                )}
                                                {!p.isNotice && (
                                                    <span className="mr-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 align-middle">
                                                        소식
                                                    </span>
                                                )}
                                                <span className="align-middle line-clamp-1">
                                                    {p.title}
                                                </span>
                                            </h2>

                                        </div>

                                        {/* 우측 화살표 아이콘 (탭 가능 영역 강조) */}
                                        <div className="shrink-0 self-center text-gray-400">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className="h-5 w-5 md:h-6 md:w-6"
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
                )}
            </main>

            {/* 📱 하단 고정 검색바 (모바일 전용) */}
            <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden">
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
                "px-3 py-1.5 md:py-2 text-xs md:text-sm rounded-xl border transition whitespace-nowrap",
                active
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-100 text-gray-700 border-gray-200 active:bg-gray-200",
            ].join(" ")}
        >
            {children}
        </button>
    );
}
