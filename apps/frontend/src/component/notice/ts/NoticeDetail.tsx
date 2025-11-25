"use client";

import { useRouter } from "next/navigation";
import React from "react";
import {useEffect, useState} from "react";

interface NoticeDetailProps {
    id: string;
}

type noticeItem = {
    id: string;
    title: string;
    date: string;
    author: string;
    content: string[];
    attachments: { name: string; url: string; size: string }[];
};

// 공지사항 게시글 상세 (모바일 퍼스트)
export default function NoticeDetail({ id }: NoticeDetailProps) {
    const router = useRouter();
    const [noticeItems, setNoticeItems] = useState<noticeItem[]>([]);

    useEffect(() => {
        const url = `/server-api/notices/getNoticePost/${id}`;

        (async () => {
            try {
                const res = await fetch(url, { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();
                console.log('detail data:', data);

                if (Array.isArray(data)) {
                    if (data.length) setNoticeItems(data);
                } else if (data) {
                    // 👈 객체 하나일 때 배열로 감싸기
                    setNoticeItems([data]);
                }
            } catch (e) {
                console.error(e);
            }
        })();
    }, [id]); // id도 deps에 넣어 주세요


    return (
        <div className="min-h-screen bg-white text-gray-900 pb-6">
            {/* 헤더 */}
            <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
                <div className="mx-auto grid max-w-xl grid-cols-3 items-center px-4 py-3">
                    <div className="justify-self-start">
                        <button
                            aria-label="뒤로가기"
                            onClick={() => router.back()}
                            className="rounded-xl p-2 active:scale-95 transition lg:opacity-0 lg:pointer-events-none"
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
                {noticeItems.map(notice => (
                    <React.Fragment key={notice.id}>
                        <h2 className="mt-4 text-lg font-semibold leading-snug">{notice.title}</h2>
                        {/* 메타 */}
                        <div className="mt-1 text-sm text-gray-500">
                            <span>{formatDateK(notice.date)}</span>
                            <span className="mx-1">·</span>
                            <span>작성자: {notice.author}</span>
                        </div>

                        {/* 구분선 */}
                        <hr className="mt-3 border-gray-200" />

                        {/* 본문 콘텐츠 */}
                        <section className="prose prose-sm mt-4 max-w-none text-gray-800 prose-p:leading-relaxed prose-li:leading-relaxed">
                            {notice.content}
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
                    </React.Fragment>
                ))}
            </main>
        </div>
    );
}

function formatDateK(dateStr: string) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-'); // "2025-11-25" → ["2025","11","25"]
    return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}