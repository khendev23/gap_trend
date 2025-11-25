// app/theology/page.tsx
"use client";

import Image from "next/image";
import {useRouter} from "next/navigation";

export default function TheologyPage() {
    const router = useRouter();

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
                        정통신학
                    </h1>
                    <div className="justify-self-end" />
                </div>
            </header>

            {/* 본문 */}
            <main className="mx-auto max-w-xl px-4 py-6 text-center">
                {/* 이미지 */}
                <div className="relative mx-auto mb-6 h-48 w-48">
                    <Image
                        src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=400&auto=format&fit=crop"
                        alt="정통신학 이미지"
                        fill
                        className="rounded-lg object-cover"
                        unoptimized
                    />
                </div>

                {/* 제목 */}
                <h2 className="mb-3 text-lg font-semibold text-gray-900">정통신학이란?</h2>

                {/* 내용 */}
                <p className="mb-2 text-sm leading-relaxed text-gray-700">
                    예수님이 전해주신 참된 복음을 사도들이 사명으로 사람들에게 전하였습니다.
                </p>
                <p className="text-sm leading-relaxed text-gray-700">
                    이러한 사도들이 전한 복음을 사도적 복음, 정통 이라고 합니다.
                </p>
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