export default function Footer() {
    return (
        <footer
            className="
        w-screen bg-[#3a4148] text-[#ccc]
        /* 원래 height:25vh는 모바일에서 과할 수 있어 min-h로 완화 */
        min-h-[20vh] md:min-h-[25vh]
      "
        >
            {/* 약관/정책 */}
            <div
                className="
          w-screen border-b border-[rgb(85,93,101)]
          mx-auto text-center
          py-4
          /* 모바일: 세로 스택, md부터 가로 정렬 */
          flex flex-col md:flex-row md:justify-between
          gap-2 md:gap-0
        "
            >
                <div
                    className="
            /* 원래 width:50vw → md에서 절반, 모바일은 자동 */
            md:w-[50vw]
            text-sm
            /* 좌/우 보더 */
            md:border-x md:border-[rgb(85,93,101)]
            px-4 md:px-0
          "
                >
                    개인정보취급방침
                </div>
                <div
                    className="
            md:w-[50vw]
            text-sm
            md:border-x md:border-[rgb(85,93,101)]
            px-4 md:px-0
          "
                >
                    이용약관
                </div>
            </div>

            {/* 주소 */}
            <div
                className="
          w-screen text-[0.6rem] text-[#888]
          px-4 py-8 pt-8
        "
            >
                (21310) 인천광역시 부평구 평천로 149(청천동)
            </div>

            {/* 저작권 */}
            <div
                className="
          w-screen text-[0.6rem] text-[#888]
          px-4 pb-2
        "
            >
                @ 2025 은혜와평강교회 ALL RIGHTS RESERVED.
            </div>

            {/* SNS */}
            <div
                className="
          w-screen text-[0.6rem] text-[#888]
          px-4 py-8 flex items-center
        "
            >
                <span className="sr-only">SNS</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor"
                     className="icon icon-tabler icons-tabler-outline icon-tabler-brand-youtube ml-0 mr-2">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z"/>
                    <path d="M10 9l5 3l-5 3z"/>
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor"
                     className="icon icon-tabler icons-tabler-outline icon-tabler-brand-instagram mr-2">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z"/>
                    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>
                    <path d="M16.5 7.5v.01"/>
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor"
                     className="icon icon-tabler icons-tabler-outline icon-tabler-brand-blogger">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M8 21h8a5 5 0 0 0 5 -5v-3a3 3 0 0 0 -3 -3h-1v-2a5 5 0 0 0 -5 -5h-4a5 5 0 0 0 -5 5v8a5 5 0 0 0 5 5z"/>
                    <path d="M7 7m0 1.5a1.5 1.5 0 0 1 1.5 -1.5h3a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1 -1.5 1.5h-3a1.5 1.5 0 0 1 -1.5 -1.5z"/>
                    <path d="M7 14m0 1.5a1.5 1.5 0 0 1 1.5 -1.5h7a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1 -1.5 1.5h-7a1.5 1.5 0 0 1 -1.5 -1.5z"/>
                </svg>
            </div>
        </footer>
    );
}