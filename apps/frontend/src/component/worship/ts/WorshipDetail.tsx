"use client";

import { useRouter } from "next/navigation";

interface SermonDetail {
    id: string;
    youtubeUrl: string; // e.g. https://www.youtube.com/embed/VIDEO_ID
    title: string;
    verse: string; // 성경구절
    preacher: string; // 설교자
    content: string[]; // 본문 단락 배열
    date?: string; // 선택: 날짜 표시용
}

// 예배 상세 페이지 (모바일 퍼스트)
// - 상단: 뒤로가기 + 가운데 타이틀
// - 본문 상단: YouTube iframe (16:9)
// - 아래: 제목, 성경구절, 설교자, 내용(문단)
// 사용: app/worship/[id]/page.tsx에서 서버/클라이언트 어디서든 전달 가능
export default function WorshipDetail({
                                          id,
                                          youtubeUrl,
                                          title,
                                          verse,
                                          preacher,
                                          content,
                                          date,
                                      }: SermonDetail) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-8">
            {/* 헤더 */}
            <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
                <div className="mx-auto grid max-w-xl grid-cols-3 items-center px-4 py-3">
                    <div className="justify-self-start">
                        <button
                            aria-label="뒤로가기"
                            onClick={() => router.back()}
                            className="rounded-xl p-2 active:scale-95 transition"
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
                    <h1 className="truncate text-center text-[clamp(1rem,5vw,1.25rem)] font-bold tracking-tight">
                        예배 상세
                    </h1>
                    <div className="justify-self-end" />
                </div>
            </header>

            {/* 본문 */}
            <main className="mx-auto max-w-xl px-4">
                {/* YouTube */}
                <div className="mt-4 overflow-hidden rounded-2xl border bg-black">
                    <div className="relative aspect-video">
                        <iframe
                            className="absolute inset-0 h-full w-full"
                            src={youtubeUrl}
                            title={title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </div>

                {/* 메타/타이틀 */}
                <section className="mt-4">
                    {date && (
                        <p className="text-sm text-gray-500">{formatDateK(date)}</p>
                    )}
                    <h2 className="mt-1 text-lg font-semibold leading-snug">{title}</h2>
                    <p className="mt-1 text-gray-700"><span className="font-medium">성경구절</span> · {verse}</p>
                    <p className="mt-0.5 text-gray-700"><span className="font-medium">설교자</span> · {preacher}</p>
                </section>

                {/* 내용 */}
                <section className="prose prose-sm mt-4 max-w-none text-gray-800 prose-p:leading-relaxed">
                    {content.map((para, i) => (
                        <p key={i}>{para}</p>
                    ))}
                </section>

                {/* 하단 버튼 (선택) */}
                <div className="mt-8 flex gap-2">
                    <button className="flex-1 rounded-xl border bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 active:bg-gray-100">
                        목록
                    </button>
                    <button className="flex-1 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white active:opacity-90">
                        공유
                    </button>
                </div>
            </main>
        </div>
    );
}

function formatDateK(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dd = d.getDate();
    return `${y}년 ${m}월 ${dd}일`;
}
