"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TipTapEditor from "@/component/editor/ts/TipTapEditor";

type Category = "notice" | "news";

export default function NoticeWritePage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<Category>("notice");
    const [contentHtml, setContentHtml] = useState("<p></p>");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }

        // TODO: 서버 저장 로직
        // await fetch("/api/notices", { method: "POST", body: JSON.stringify({ title, category, contentHtml }) })

        // 임시: 저장 완료 후 목록으로
        router.push("/notice");
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* 헤더 */}
            <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
                <div className="mx-auto max-w-xl px-4 py-3 grid grid-cols-3 items-center">
                    <button
                        onClick={() => router.back()}
                        className="justify-self-start rounded-lg p-2 hover:bg-gray-100 active:scale-95 lg:opacity-0 lg:pointer-events-none"
                        aria-label="뒤로가기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                             className="h-6 w-6" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <h1 className="text-center text-[clamp(1rem,5vw,1.25rem)] font-bold tracking-tight">
                        글쓰기
                    </h1>
                    <div className="justify-self-end" />
                </div>
            </header>

            {/* 폼 */}
            <main className="mx-auto max-w-xl px-4 py-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 제목 */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                            required
                        />
                    </div>

                    {/* 구분 */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">구분</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Category)}
                            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                        >
                            <option value="notice">공지사항</option>
                            <option value="news">교회소식</option>
                        </select>
                    </div>

                    {/* 에디터 */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">내용</label>
                        <div className="rounded-xl border">
                            <TipTapEditor initial="<p></p>" onChange={setContentHtml} />
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
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
            </main>
        </div>
    );
}