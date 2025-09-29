import MiddleMenu from "@/component/main/ts/middleMenu";
import KellyMenu from "@/component/main/ts/kellyMenu";
import AnnounceMenu from "@/component/main/ts/announceMenu";
import WorshipMenu from "@/component/main/ts/worshipMenu";

export default function Home() {
    return (
        <main
            className={`
                w-screen relative
                /* 고정 헤더 높이만큼 패딩 (모바일/데스크톱) */
                pt-[calc(env(safe-area-inset-top)+3.5rem)] md:pt-[calc(env(safe-area-inset-top)+4rem)]
                bg-white
            `}
        >
            {/* 히어로 섹션 */}
            <section className="w-screen h-[70vh]">
                {/* 인사 텍스트 */}
                <div className="w-screen relative text-black pt-4 pl-12">
                    <h6 className="text-[0.8rem] leading-5">000님</h6>
                    <h6 className="text-[0.8rem] leading-5">사랑하고 축복합니다.</h6>
                </div>

                {/* 메인 이미지 */}
                <div className="w-screen flex justify-center mt-2">
                    <img
                        src="https://cdn.jsdelivr.net/gh/khendev23/gapCdn-assets@main/web/homePic.jpg"
                        alt=""
                        className="w-[85vw] max-w-[900px] rounded-md"
                    />
                </div>
            </section>

            {/* 하위 섹션들 */}
            <MiddleMenu />
            <AnnounceMenu />
            <WorshipMenu />
            <KellyMenu />
        </main>
    );
}