"use client";

import { useRouter } from "next/navigation";

interface NoticeDetailProps {
    id: string;
}

// 공지사항 게시글 상세 (모바일 퍼스트)
export default function NoticeDetail({ id }: NoticeDetailProps) {
    const router = useRouter();

    // 데모 데이터 (API 연동 시 교체)
    const notice = {
        title: "교회 소식 – 10월 첫째 주 안내",
        date: "2025-09-26",
        author: "관리자 (홍길동)",
        content: [
            "이번 주 예배와 교육 일정 안내드립니다.",
            "1) 새가족 교육은 주일 2부 예배 후 1층 새가족실에서 진행됩니다.",
            "2) 수요예배는 저녁 7시 30분에 본당에서 드립니다.",
            "3) 금요기도회는 밤 9시에 시작합니다. 함께 중보로 동참해 주세요.",
            "자세한 내용은 주보를 참고하시고, 궁금한 점은 사무실로 문의 바랍니다.",
        ],
        attachments: [
            { name: "주보_2025-09-28.pdf", url: "/files/bulletin_20250928.pdf", size: "1.2MB" },
            { name: "교육일정.xlsx", url: "/files/edu_schedule.xlsx", size: "280KB" },
        ],
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-6">
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
                        공지사항
                    </h1>
                    <div className="justify-self-end" />
                </div>
            </header>

            {/* 본문 */}
            <main className="mx-auto max-w-xl px-4">
                {/* 제목 */}
                <h2 className="mt-4 text-lg font-semibold leading-snug">{notice.title}</h2>

                {/* 메타 */}
                <div className="mt-1 text-sm text-gray-500">
                    <span>{formatDateK(notice.date)}</span>
                    <span className="mx-1">·</span>
                    <span>작성자: {notice.author}</span>
                </div>

                {/* 현재 ID 표시 */}
                <div className="mt-1 text-xs text-gray-400">게시글 ID: {id}</div>

                {/* 구분선 */}
                <hr className="mt-3 border-gray-200" />

                {/* 본문 콘텐츠 */}
                <section className="prose prose-sm mt-4 max-w-none text-gray-800 prose-p:leading-relaxed prose-li:leading-relaxed">
                    {notice.content.map((para, i) => (
                        <p key={i}>{para}</p>
                    ))}
                </section>

                {/* 첨부파일 (옵션) */}
                {notice.attachments?.length > 0 && (
                    <section className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-900">첨부파일</h3>
                        <ul className="mt-2 space-y-2">
                            {notice.attachments.map((f) => (
                                <li key={f.url} className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-900">{f.name}</p>
                                        <p className="text-xs text-gray-500">{f.size}</p>
                                    </div>
                                    <a
                                        href={f.url}
                                        className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        다운로드
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* 하단 버튼 */}
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

function formatDateK(dateStr: string) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dd = d.getDate();
    return `${y}년 ${m}월 ${dd}일`;
}