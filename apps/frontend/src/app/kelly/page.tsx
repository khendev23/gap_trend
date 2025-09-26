"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KellyBoard() {
    const router = useRouter();
    const images = [
        "https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/kelly/kelly240603.jpg",
        "https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/kelly/kelly240701.jpg",
        "https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/kelly/IMG_9459.jpeg",
        "https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/kelly/IMG_9460.jpeg",
        "https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/kelly/IMG_9461.jpeg",
    ];

    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* 헤더 */}
            <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
                <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
                    {/* 뒤로가기 */}
                    <button
                        onClick={() => router.back()}
                        aria-label="뒤로가기"
                        className="p-2 rounded-lg hover:bg-gray-100 active:scale-95"
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

                    {/* 제목 */}
                    <h1 className="text-lg font-bold">켈리 게시판</h1>

                    {/* 업로드 버튼 */}
                    <button
                        onClick={() => alert("업로드 기능 연결")}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 active:scale-95"
                    >
                        업로드
                    </button>
                </div>
            </header>

            {/* Masonry layout */}
            <main className="mx-auto max-w-xl px-4 py-4">
                <div className="columns-2 gap-4 sm:columns-3">
                    {images.map((src, idx) => (
                        <div key={idx} className="mb-4 break-inside-avoid">
                            <button
                                onClick={() => setSelected(src)}
                                className="block w-full overflow-hidden rounded-xl shadow-sm hover:opacity-90"
                            >
                                <img src={src} alt={`켈리 작품 ${idx + 1}`} className="w-full" />
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* 모달 */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="relative max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="relative">
                            <img src={selected} alt="켈리 작품 확대" className="w-full" />
                            <button
                                onClick={() => setSelected(null)}
                                className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border-t">
                            <a
                                href={selected}
                                download
                                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                            >
                                다운로드
                            </a>
                            <button
                                onClick={() => setSelected(null)}
                                className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}