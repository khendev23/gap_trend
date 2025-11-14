"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useSwipeable } from "react-swipeable";

// const images = [
//     "https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/kelly/kelly240603.jpg",
//     "https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/kelly/kelly240701.jpg",
//     "https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/kelly/IMG_9459.jpeg",
//     "https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/kelly/IMG_9460.jpeg",
//     "https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/kelly/IMG_9461.jpeg",
// ];

type KellyItem = { id: string; publicUrl: string; alt?: string };

type Dir = "prev" | "next";

export default function KellyMenu() {
    const [items, setItems] = useState<KellyItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const last = Math.max(items.length - 1, 0);

    const moveToSlide = (dir: Dir) => {
        setCurrentIndex((prev) =>
            dir === "next" ? (prev < last ? prev + 1 : 0) : prev > 0 ? prev - 1 : last
        );
    };

    // 데이터 로딩
    useEffect(() => {
        const ctrl = new AbortController();
        const base = process.env.NEXT_PUBLIC_API_BASE_URL; // 예: https://api.gapchurch.kr
        const url = `/server-api/kelly/latest`;

        (async () => {
            try {
                const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: KellyItem[] = await res.json();
                if (Array.isArray(data) && data.length) setItems(data);
            } catch {

            }
        })();

        return () => ctrl.abort();
    }, []);

    const handlers = useSwipeable({
        onSwipedLeft: () => moveToSlide("next"),
        onSwipedRight: () => moveToSlide("prev"),
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    // 접근성: 현재 슬라이드 x/총 n
    const ariaLabel = useMemo(
        () => `현재 슬라이드 ${currentIndex + 1} / 총 ${items.length}`,
        [currentIndex, items.length]
    );

    return (
        <section className="w-screen min-h-[60vh] bg-[#f9f9f9]">
            <div className="w-full max-w-5xl mx-auto">
                {/* 타이틀 */}
                <div className="flex items-center justify-between text-black px-6 md:px-0 pt-4">
                    <h3 className="text-lg md:text-xl font-semibold">말씀 켈리</h3>
                    <Link href="/kelly" className="text-sm md:text-base hover:underline">
                        더보기
                    </Link>
                </div>

                {/* 슬라이더 */}
                <div className="w-full flex items-center justify-between mt-4 md:mt-6 px-2 md:px-0">
                    {/* 이전 버튼 */}
                    <button
                        type="button"
                        onClick={() => moveToSlide("prev")}
                        aria-label="이전 이미지"
                        className="w-10 h-10 md:w-12 md:h-12 text-2xl text-black/80 hover:text-black transition flex items-center justify-center"
                    >
                        {"<"}
                    </button>

                    {/* 뷰포트 */}
                    <div
                        {...handlers}
                        className="
                            relative overflow-hidden
                            w-[86vw] md:w-[60vw]
                            max-w-3xl
                            mx-auto
                            pt-4
                            /* 세로 이미지가 많은 경우, 보기 좋은 최대 높이 */
                            h-[48vh] md:h-[54vh]
                          "
                        role="region"
                        aria-roledescription="carousel"
                        aria-label="말씀 켈리 슬라이더"
                    >
                        {/* 트랙 */}
                        <div
                            className="flex transition-transform duration-400 ease-in-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                            aria-live="polite"
                        >
                            {(items).map((it, idx) => (
                                <div key={it.id ?? idx} className="min-w-full flex justify-center items-center">
                                    <img
                                        src={it.publicUrl}
                                        alt={it.alt ?? `말씀 켈리 이미지 ${idx + 1}`}
                                        className="max-h-full w-auto object-contain rounded-md shadow-sm"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* 인디케이터(점) */}
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 md:-bottom-4 flex gap-2">
                            {items.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    aria-label={`슬라이드 ${i + 1}로 이동`}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`h-2.5 w-2.5 rounded-full transition
                                        ${i === currentIndex ? "bg-black" : "bg-black/30"}`
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    {/* 다음 버튼 */}
                    <button
                        type="button"
                        onClick={() => moveToSlide("next")}
                        aria-label="다음 이미지"
                        className="w-10 h-10 md:w-12 md:h-12 text-2xl text-black/80 hover:text-black transition flex items-center justify-center"
                    >
                        {">"}
                    </button>
                </div>

                {/* 화면리더 안내 */}
                <p className="sr-only">{ariaLabel}</p>
            </div>
        </section>
    );
}