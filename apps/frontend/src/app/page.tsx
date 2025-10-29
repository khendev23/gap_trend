import { headers, cookies } from 'next/headers';

import MiddleMenu from "@/component/main/ts/middleMenu";
import KellyMenu from "@/component/main/ts/kellyMenu";
import AnnounceMenu from "@/component/main/ts/announceMenu";
import WorshipMenu from "@/component/main/ts/worshipMenu";

// 서버에서 로그인 정보 불러오기
async function getUser() {
    try {
        const h = await headers();
        const host = h.get('x-forwarded-host') || h.get('host');
        const proto = h.get('x-forwarded-proto') || 'http';
        const base = `${proto}://${host}`;
        const c = await cookies();
        const cookieHeader = c.getAll().map(({ name, value }) => `${name}=${value}`).join('; ');

        console.log('[SSR] cookie header =>', cookieHeader);

        // 3) 서버에서 서버로 호출할 때 쿠키를 명시적으로 전달
        const res = await fetch(`${base}/api/auth/me`, {
            cache: 'no-store',
            headers: cookieHeader ? { cookie: cookieHeader } : {},
        });
        if (!res.ok) return null;
        const data = await res.json();
        console.log(data);
        return data.user; // { userId, username, role, approval } 형태라고 했죠
    } catch {
        return null;
    }
}

export default async function Home() {
    const user = await getUser();

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
                    <h6 className="text-[0.8rem] leading-5">
                        {user ? `${user.sub}님` : '방문자님'}
                    </h6>
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