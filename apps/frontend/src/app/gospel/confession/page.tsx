// app/confession/page.tsx
"use client";

import Image from "next/image";
import {useRouter} from "next/navigation";

export default function ConfessionPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* 헤더 */}
            <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
                <div className="mx-auto max-w-xl px-4 py-3 grid grid-cols-3 items-center">
                    <button
                        onClick={() => router.back()}
                        aria-label="뒤로가기"
                        className="justify-self-start rounded-lg p-2 hover:bg-gray-100 active:scale-95"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-center text-[clamp(1rem,5vw,1.25rem)] font-bold tracking-tight">
                        신앙고백
                    </h1>
                    <div className="justify-self-end" />
                </div>
            </header>

            {/* 본문 */}
            <main className="mx-auto max-w-xl px-4 py-6">
                {/* 가운데 이미지 */}
                <div className="relative mx-auto mb-6 h-48 w-48">
                    <Image
                        src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop"
                        alt="신앙고백 이미지"
                        fill
                        className="rounded-lg object-cover"
                        unoptimized
                    />
                </div>

                {/* 고대신조 */}
                <section className="mb-6 px-4">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        고대신조
                    </h3>
                    <ol className="list-decimal space-y-1 pl-6 text-sm leading-relaxed text-gray-700">
                        <li>사도신조</li>
                        <li>니케아-콘스탄티노플 신조</li>
                        <li>칼케톤 신조</li>
                        <li>아타나시우스 신조</li>
                    </ol>
                </section>

                {/* 개혁신앙 신조 */}
                <section className="mb-6 px-4">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        개혁신앙 신조
                    </h3>
                    <ol className="list-decimal space-y-1 pl-6 text-sm leading-relaxed text-gray-700">
                        <li>하이델베르크 요리문답</li>
                        <li>웨스트민스터 소요리문답</li>
                        <li>벨직 신조</li>
                        <li>돌트 신조</li>
                    </ol>
                </section>
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