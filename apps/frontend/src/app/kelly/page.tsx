"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type KellyItem = { id: string; publicUrl: string; alt?: string };
type KellyResponse = { items: KellyItem[]; nextCursor?: string | null };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""; // 리라이트 쓰면 빈 문자열도 OK

export default function KellyBoard() {
    const router = useRouter();

    const [items, setItems] = useState<KellyItem[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);

    // 모달 상태 (선택 이미지)
    const [selected, setSelected] = useState<KellyItem | null>(null);

    // 업로드 모달 상태
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string>("");
    const [uploadDescription, setUploadDescription] = useState("");

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false); // 동시 호출 방지

    // 페이지 로더
    const fetchPage = async (cursor?: string | null) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const base = API_BASE ? API_BASE.replace(/\/+$/, "") : "";
            const qs = new URLSearchParams({ limit: "6", ...(cursor ? { cursor } : {}) });
            const url = `/server-api/calliGr/list?${qs.toString()}`;

            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: KellyResponse = await res.json();

            console.log(data);

            const newItems = Array.isArray(data.items) ? data.items : [];
            setItems((prev) => {
                const seen = new Set(prev.map((p) => p.id));
                const merged = [...prev];
                for (const it of newItems) if (!seen.has(it.id)) merged.push(it);
                return merged;
            });

            const nc = data.nextCursor ?? null;
            setNextCursor(nc);
            setHasMore(Boolean(nc));
        } catch (e: any) {
            setError(e?.message ?? "불러오기 실패");
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    // 최초 로딩
    useEffect(() => {
        fetchPage(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 인터섹션 옵저버로 다음 페이지 로드
    useEffect(() => {
        if (!hasMore || loading) return;
        const el = sentinelRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !loadingRef.current && hasMore) {
                    fetchPage(nextCursor);
                }
            },
            { root: null, rootMargin: "200px", threshold: 0 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [hasMore, nextCursor, loading]);

    // ESC로 모달 닫기
    useEffect(() => {
        if (!selected && !isUploadOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelected(null);
                setIsUploadOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [selected, isUploadOpen]);

    // 업로드 미리보기
    useEffect(() => {
        if (!uploadFile) {
            setUploadPreview("");
            return;
        }
        const url = URL.createObjectURL(uploadFile);
        setUploadPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [uploadFile]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) {
            alert("사진을 선택해주세요.");
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("file", uploadFile);
            if (uploadDescription) {
                formData.append("description", uploadDescription);
            }

            const res = await fetch("/server-api/calliGr/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error(`업로드 실패 (HTTP ${res.status})`);

            alert("업로드가 완료되었습니다.");
            
            // 모달 닫기 및 초기화
            setIsUploadOpen(false);
            setUploadFile(null);
            setUploadDescription("");

            // 목록 새로고침 (첫 페이지부터 다시 불러오기)
            setItems([]);
            fetchPage(null);
        } catch (e: any) {
            alert(e?.message ?? "업로드 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* 헤더 */}
            <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
                <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        aria-label="뒤로가기"
                        className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 lg:opacity-0 lg:pointer-events-none"
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

                    <h1 className="text-base md:text-lg font-bold">켈리 게시판</h1>

                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="rounded-lg px-3 py-2 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 active:scale-95"
                    >
                        업로드
                    </button>
                </div>
            </header>

            {/* 본문 */}
            <main className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
                {/* 에러 */}
                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        이미지를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. ({error})
                    </div>
                )}

                {/* 목록 + 스켈레톤 */}
                {items.length === 0 && loading ? (
                    <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="mb-4 break-inside-avoid">
                                <div className="h-40 w-full animate-pulse rounded-xl bg-gray-200" />
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-center text-sm text-gray-500">표시할 이미지가 없습니다.</p>
                ) : (
                    <>
                        {/* 모바일~데스크톱 모두 대응하는 masonry-style 컬럼 */}
                        <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5">
                            {items.map((item) => (
                                <div key={item.id} className="mb-4 break-inside-avoid">
                                    {/* 모달 오픈 버튼 */}
                                    <button
                                        onClick={() => setSelected(item)}
                                        className="block w-full overflow-hidden rounded-xl shadow-sm hover:opacity-90"
                                        aria-label={`${item.alt ?? `켈리 작품 ${item.id}`} 확대 보기`}
                                    >
                                        <img
                                            src={item.publicUrl}
                                            alt={item.alt ?? `켈리 작품 ${item.id}`}
                                            loading="lazy"
                                            className="w-full h-auto"
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* 무한 스크롤 센티널 */}
                        {(loading || hasMore) && (
                            <div className="mt-6 flex justify-center">
                                <div
                                    ref={sentinelRef}
                                    className="h-10 w-10 animate-pulse rounded-full bg-gray-200"
                                />
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* 모달 (다운로드 버튼 포함) */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={(e) => {
                        // 오버레이 클릭 시 닫기 (컨텐츠 클릭은 유지)
                        if (e.target === e.currentTarget) setSelected(null);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={selected.alt ?? "켈리 작품 확대"}
                        className="relative max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="relative">
                            <img src={selected.publicUrl} alt={selected.alt ?? "켈리 작품 확대"} className="w-full" />
                            <button
                                onClick={() => setSelected(null)}
                                className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                                aria-label="닫기"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border-t">
                            <div className="flex flex-col">
                                <a
                                    href={`/server-api/kelly/${selected.id}/download`}
                                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 text-center"
                                >
                                    다운로드
                                </a>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                닫기
                            </button>
                        </div>
                        {selected.alt && (
                            <div className="px-4 pb-4">
                                <p className="text-sm text-gray-600">{selected.alt}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 업로드 모달 */}
            {isUploadOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsUploadOpen(false);
                    }}
                >
                    <div className="relative max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h2 className="text-base font-semibold">사진 업로드</h2>
                            <button
                                onClick={() => setIsUploadOpen(false)}
                                className="rounded-lg p-2 hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    사진 (필수)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                />
                                {uploadPreview && (
                                    <div className="mt-3 relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                                        <img
                                            src={uploadPreview}
                                            alt="미리보기"
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    설명 (선택)
                                </label>
                                <textarea
                                    value={uploadDescription}
                                    onChange={(e) => setUploadDescription(e.target.value)}
                                    placeholder="사진에 대한 설명을 입력하세요."
                                    rows={3}
                                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadOpen(false)}
                                    className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "업로드 중..." : "올리기"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
