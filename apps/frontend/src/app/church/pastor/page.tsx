// app/pastor/page.tsx
"use client";

import Image from "next/image";
import {useRouter} from "next/navigation";

export default function PastorPage() {
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
                        목사님 소개
                    </h1>
                    <div className="justify-self-end" />
                </div>
            </header>

            {/* 본문 */}
            <main className="mx-auto max-w-xl px-4 py-6 text-center">
                {/* 프로필 사진 */}
                <div className="relative mx-auto mb-4 h-48 w-48">
                    <Image
                        src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=400&auto=format&fit=crop"
                        alt="담임목사 사진"
                        fill
                        className="rounded-lg object-cover"
                        unoptimized
                    />
                </div>

                {/* 이름 */}
                <h2 className="mb-2 text-lg font-semibold text-gray-900">
                    담임목사 주기수
                </h2>

                {/* 프로필 */}
                <div className="mt-4 space-y-2 text-sm leading-relaxed text-gray-700 text-left px-4">
                    <h2 className="text-lg font-semibold">프로필</h2>
                    <p>은혜와평강교회 담임목사</p>
                    <p>경성노회 고시부장</p>
                    <p>한국개혁신학원 (서철원 박사 / 조직신학전공)</p>
                    <p>합동총회 이단대책위원회 전문위원</p>
                    <p>경인 기독교 이단상담소 소장</p>
                </div>
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