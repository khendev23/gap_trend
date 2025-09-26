"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";

export default function WorshipBoard() {
    type Category = "all" | "sundayAM" | "sundayPM" | "wednesday" | "friday" | "youth";
    interface Post {
        id: number;
        date: string;
        title: string;
        verse: string;
        preacher: string;
        category: Exclude<Category, "all">;
        thumbnail: string; // http(s) | blob: | data:
    }

    const [category, setCategory] = useState<Category>("all");
    const [q, setQ] = useState<string>("");

    // 초기 데이터
    const initialPosts: Post[] = [
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

    // 목록 상태로 변경 (업로드 후 추가하기 위함)
    const [items, setItems] = useState<Post[]>(initialPosts);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        return items
            .filter((p) => (category === "all" ? true : p.category === category))
            .filter(
                (p) =>
                    !query ||
                    p.title.toLowerCase().includes(query) ||
                    p.verse.toLowerCase().includes(query) ||
                    p.preacher.toLowerCase().includes(query)
            );
    }, [category, q, items]);

    // 관리자만 업로드 버튼 노출 (예시)
    const isAdmin: boolean = true;

    // -----------------------------
    // 업로드 모달 상태 & 로직
    // -----------------------------
    const [open, setOpen] = useState(false);
    const [fDate, setFDate] = useState<string>("");
    const [fUrl, setFUrl] = useState<string>("");
    const [fTitle, setFTitle] = useState<string>("");
    const [fVerse, setFVerse] = useState<string>("");
    const [fPreacher, setFPreacher] = useState<string>("");
    const [fContent, setFContent] = useState<string>(""); // 상세 내용 (지금은 리스트에는 미표시)
    const [fThumbFile, setFThumbFile] = useState<File | null>(null);
    const [thumbPreview, setThumbPreview] = useState<string>("");

    const [fCategory, setFCategory] = useState<Exclude<Category, "all">>(
        category !== "all" ? category : "sundayAM"
    );

    useEffect(() => {
        if (open) {
            setFCategory(category !== "all" ? category : "sundayAM");
        }
    }, [open, category]);

    // 현재 필터가 특정 카테고리면 그걸 기본값으로, 아니면 주일오전으로
    const defaultUploadCategory: Exclude<Category, "all"> =
        category !== "all" ? category : "sundayAM";

    // 파일 미리보기
    useEffect(() => {
        if (!fThumbFile) {
            setThumbPreview("");
            return;
        }
        const objectUrl = URL.createObjectURL(fThumbFile);
        setThumbPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [fThumbFile]);

    // 모달 열릴 때 바디 스크롤 잠금 (선택)
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [open]);

    const resetForm = useCallback(() => {
        setFDate("");
        setFUrl("");
        setFTitle("");
        setFVerse("");
        setFPreacher("");
        setFContent("");
        setFThumbFile(null);
        setThumbPreview("");
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 간단 검증
        if (!fDate || !fTitle || !fVerse || !fPreacher) {
            alert("날짜, 제목, 성경 본문, 설교자를 입력해주세요.");
            return;
        }

        // 썸네일 경로: 업로드(파일) 시 blob URL 미리보기 사용, 없으면 URL 입력 사용
        const thumb = thumbPreview || fUrl || "";

        const next: Post = {
            id: (items[0]?.id ?? 0) + Math.floor(Math.random() * 100000) + 1,
            date: fDate,
            title: fTitle,
            verse: fVerse,
            preacher: fPreacher,
            category: fCategory,              // ✅ 선택한 예배 종류 반영
            thumbnail: thumb,
        };

        setItems((prev) => [next, ...prev]);
        setOpen(false);
        resetForm();
    };

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
                    {/* 업로드 버튼 (관리자만 보임) */}
                    {isAdmin ? (
                        <button
                            onClick={() => setOpen(true)}
                            className="justify-self-end rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 active:scale-95"
                        >
                            업로드
                        </button>
                    ) : (
                        <div className="w-14" />
                    )}
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
                            <Link
                                href={`/worship/${p.id}`}
                                aria-label={`${p.title} 상세 보기`}
                                className="block -m-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition"
                            >
                                <article className="flex items-start gap-3">
                                    <div className="relative w-32 aspect-video shrink-0 overflow-hidden rounded-xl bg-gray-200">
                                        <Thumbnail src={p.thumbnail} />
                                    </div>
                                    <div className="flex-1 min-w-0 text-sm leading-5">
                                        <p className="text-gray-500">{p.date}</p>
                                        <p className="font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                                        <p className="text-gray-600 line-clamp-1">{p.verse}</p>
                                        <p className="text-gray-500 line-clamp-1">{p.preacher}</p>
                                    </div>
                                </article>
                            </Link>
                        </li>
                    ))}
                    {filtered.length === 0 && (
                        <li className="py-16 text-center text-sm text-gray-500">검색 결과가 없습니다.</li>
                    )}
                </ul>
            </main>

            {/* 하단 고정 검색바 */}
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

            {/* ====== 업로드 모달 ====== */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
                    <div className="w-full sm:max-w-md sm:rounded-2xl sm:overflow-hidden bg-white">
                        {/* 헤더 */}
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h2 className="text-base font-semibold">예배 업로드</h2>
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    resetForm();
                                }}
                                className="rounded-lg p-2 hover:bg-gray-100"
                                aria-label="닫기"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 폼 */}
                        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
                            {/* 날짜 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                                <input
                                    type="date"
                                    value={fDate}
                                    onChange={(e) => setFDate(e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                                    required
                                />
                            </div>

                            {/* 예배 종류 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">예배</label>
                                <select
                                    value={fCategory}
                                    onChange={(e) => setFCategory(e.target.value as Exclude<Category, "all">)}
                                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                                    required
                                >
                                    <option value="sundayAM">주일오전</option>
                                    <option value="sundayPM">주일오후</option>
                                    <option value="wednesday">수요</option>
                                    <option value="friday">금요</option>
                                    <option value="youth">청년</option>
                                </select>
                            </div>

                            {/* URL (YouTube 등) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={fUrl}
                                    onChange={(e) => setFUrl(e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                                />
                            </div>

                            {/* 썸네일 (파일 입력 + 미리보기) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">썸네일</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFThumbFile(e.target.files?.[0] ?? null)}
                                        className="block w-full text-sm"
                                    />
                                </div>
                                {thumbPreview && (
                                    <div className="mt-3 rounded-xl overflow-hidden bg-gray-100">
                                        <div className="relative w-full aspect-video">
                                            {/* 미리보기는 img로 간단히 */}
                                            <img src={thumbPreview} alt="미리보기" className="absolute inset-0 h-full w-full object-cover" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 설교자 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">설교자</label>
                                <input
                                    type="text"
                                    value={fPreacher}
                                    onChange={(e) => setFPreacher(e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                                    required
                                />
                            </div>

                            {/* 성경 본문 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">성경 본문</label>
                                <input
                                    type="text"
                                    placeholder="예: 요한복음 3:16"
                                    value={fVerse}
                                    onChange={(e) => setFVerse(e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                                    required
                                />
                            </div>

                            {/* 내용 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                                <textarea
                                    rows={4}
                                    placeholder="설교 요약 또는 안내 내용을 입력하세요."
                                    value={fContent}
                                    onChange={(e) => setFContent(e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                                />
                            </div>

                            {/* 제출/취소 */}
                            <div className="flex gap-2 pt-2 pb-3 sm:pb-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false);
                                        resetForm();
                                    }}
                                    className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                                >
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/** http(s)는 next/image, 그 외(blob/data)는 img로 처리 */
function Thumbnail({ src }: { src: string }) {
    const isHttp = /^https?:/i.test(src);
    if (isHttp) {
        return (
            <Image
                src={src}
                alt="썸네일"
                fill
                sizes="128px"
                className="object-cover"
                unoptimized
            />
        );
    }
    return <img src={src} alt="썸네일" className="absolute inset-0 h-full w-full object-cover" />;
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