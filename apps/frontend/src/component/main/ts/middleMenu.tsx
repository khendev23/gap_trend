import Link from "next/link";

export default function MiddleMenu() {
    return (
        <section
            className="
            w-screen bg-[#f9f9f9]
            px-6 py-6 md:px-8 md:py-8
            flex items-center justify-center
            /* 원래 height:25vh → 모바일은 내용 높이에 맞추고 md부터 근사치 */
            min-h-[18vh] md:min-h-[25vh]
          "
        >
            <div className="w-full max-w-screen-md md:max-w-screen-lg">
                {/* 상단 문구 */}
                <div className="text-black text-sm md:text-base leading-6 md:leading-7">
                    <p>사도들이 전한 정통적 복음이 선포되고</p>
                    <p>사랑의 교제가 넘치는 은혜와평강교회 입니다.</p>
                </div>

                {/* 아이콘 메뉴 (모바일 2열, md 이상 4열) */}
                <div
                    className="
                mt-4 md:mt-6
                grid grid-cols-2 md:grid-cols-4
                gap-x-8 gap-y-6 md:gap-x-12 md:gap-y-8
                text-black
              "
                >
                    {/* 예배 */}
                    <div className="flex flex-col items-center justify-between">
                        <Link
                            href="/worship"
                            className="flex flex-col items-center justify-center text-center"
                        >
                            <svg
                                id="Prayer--Streamline-Atlas"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="-0.5 -0.5 16 16"
                                className="w-10 h-10"
                            >
                                <path d="M3.30625 9.89375V5.7a1.2 1.2 0 0 0 -1.19375 -1.19375 1.2 1.2 0 0 0 -1.2 1.19375v4.55625a2.36875 2.36875 0 0 0 0.525 1.49375l1.875 2.3375v0.625" fill="none" stroke="#000000" />
                                <path d="m4.50625 11.09375 -0.825 -0.825a1.25 1.25 0 0 1 -0.375 -0.89375 1.25 1.25 0 0 1 1.25 -1.25 1.25 1.25 0 0 1 0.9 0.36875l1.66875 1.63125a1.25 1.25 0 0 1 0.375 0.89375v3.66875" fill="none" stroke="#000000" />
                                <path d="M11.69375 9.89375V5.7a1.2 1.2 0 0 1 1.19375 -1.19375 1.2 1.2 0 0 1 1.19375 1.19375v4.55625a2.36875 2.36875 0 0 1 -0.525 1.49375l-1.875 2.3375v0.625" fill="none" stroke="#000000" />
                                <path d="m10.49375 11.09375 0.825 -0.825a1.25 1.25 0 0 0 0.375 -0.9 1.25 1.25 0 0 0 -1.25 -1.25 1.25 1.25 0 0 0 -0.9 0.36875L7.875 10.125a1.25 1.25 0 0 0 -0.375 0.89375v3.66875" fill="none" stroke="#000000" />
                                <path d="m7.5 0.3125 0 6.5875" fill="none" stroke="#000000" />
                                <path d="m5.10625 2.50625 4.7875 0" fill="none" stroke="#000000" />
                            </svg>
                            <p className="mt-2 text-[0.9rem] text-center">예배</p>
                        </Link>
                    </div>

                    {/* 정통신학 */}
                    <div className="flex flex-col items-center justify-between">
                        <Link
                            href="/gospel/theology"
                            className="flex flex-col items-center justify-center text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z"/>
                                <path d="M19 16h-12a2 2 0 0 0 -2 2"/>
                                <path d="M12 7v6"/>
                                <path d="M10 9h4"/>
                            </svg>
                            <p className="mt-2 text-[0.9rem] text-center">정통신학</p>
                        </Link>
                    </div>

                    {/* 신앙고백 */}
                    <div className="flex flex-col items-center justify-between">
                        <Link
                            href="/gospel/confession"
                            className="flex flex-col items-center justify-center text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                                <path d="M7 20h8l-4 -4v-7l4 3l2 -2"/>
                            </svg>
                            <p className="mt-2 text-[0.9rem] text-center">신앙고백</p>
                        </Link>
                    </div>

                    {/* 오시는길 */}
                    <div className="flex flex-col items-center justify-between">
                        <Link
                            href="/church/location"
                            className="flex flex-col items-center justify-center text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13"/>
                                <path d="M9 4v13"/>
                                <path d="M15 7v13"/>
                            </svg>
                            <p className="mt-2 text-[0.9rem] text-center">오시는길</p>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}