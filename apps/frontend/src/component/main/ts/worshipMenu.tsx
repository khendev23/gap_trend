'use client'

import Link from "next/link";

export default function WorshipMenu() {
    return (
        <section className="w-screen min-h-[30vh]">
            <div className="w-full max-w-5xl mx-auto">
                {/* 타이틀 박스 */}
                <div className="flex justify-between items-center text-black px-6 md:px-0 pt-4">
                    <h3 className="text-lg md:text-xl font-semibold">예배</h3>
                    <Link href="/worship" className="text-sm md:text-base hover:underline">
                        더보기
                    </Link>
                </div>

                {/* 가로 스크롤 래퍼 (모바일뿐 아니라 전체에서 스크롤) */}
                <div
                    className="
                      mt-8 px-0 py-6
                      overflow-x-auto
                      whitespace-nowrap
                      -webkit-overflow-scrolling-touch
                      scroll-smooth
                      snap-x snap-mandatory
                      /* 스크롤바 숨김 */
                      [-ms-overflow-style:none] [scrollbar-width:none]
                      [&::-webkit-scrollbar]:hidden
                    "
                    aria-label="예배 카드 리스트"
                >
                    {/* 카드 리스트 */}
                    <div className="flex gap-5 px-6">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <Link
                                href="/"
                                key={num}
                                className="snap-start shrink-0"
                            >
                                <div
                                    className="
                                      w-[200px]
                                      px-2 text-center text-black
                                      hover:opacity-90 transition
                                    "
                                >
                                    <img
                                        src="https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/web/IMG_9462.JPG"
                                        alt={`예배 ${num}`}
                                        className="w-full h-auto rounded-lg"
                                    />
                                    <p className="mt-2 text-sm md:text-base">
                                        예배 제목 {num}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
