// app/vision/page.tsx
"use client";

import {useRouter} from "next/navigation";

export default function VisionPage() {

    const router = useRouter();

    const visions = [
        "기독교 세계관과 가치관의 혼재로 방황하는 청소년, 청년들에게 그리스도를 앎으로 방황 끝, 행복 시작으로 꿈을 꾸고 이뤄가는 교회",
        "창조주 하나님을 앎으로 나의 존재와 참된 존재 목적과 존재 방식을 알게 된다. 이와같이 성경의 바른 이해와 해석으로 이끄는 교회",
        "하나님이 주인되시는 가정, 교회, 이 나라 이 민족 더 나아가 세계 열방으로 뻗어나가도록 영향력을 끼치는 바른 사도적 복음을 가르치는 교회",
        "요람에서 무덤까지 책임지는 교회",
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* 헤더 */}
            <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
                <div className="mx-auto max-w-xl px-4 py-3 grid grid-cols-3 items-center">
                    <button
                        onClick={() => router.back()}
                        aria-label="뒤로가기"
                        className="justify-self-start rounded-lg p-2 hover:bg-gray-100 active:scale-95 lg:opacity-0 lg:pointer-events-none"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-center text-[clamp(1rem,5vw,1.25rem)] font-bold tracking-tight">
                        목회 비전
                    </h1>
                    <div className="justify-self-end" />
                </div>
            </header>

            {/* 본문 */}
            <main className="mx-auto max-w-xl px-4 py-6">
                <h2 className="mb-4 text-center text-lg font-semibold text-gray-900">
                    은혜와평강교회는
                </h2>
                <ol className="space-y-4">
                    {visions.map((v, i) => (
                        <li
                            key={i}
                            className="rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700"
                        >
                            <span className="mr-2 font-bold text-gray-900">{i + 1}.</span>
                            {v}
                        </li>
                    ))}
                </ol>
            </main>
        </div>
    );
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path
                d="M15 18l-6-6 6-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}