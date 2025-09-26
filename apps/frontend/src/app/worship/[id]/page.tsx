// app/worship/[id]/page.tsx (서버 컴포넌트 예시)
import WorshipDetail from "@/component/worship/ts/WorshipDetail";

export default async function Page({ params }: { params: { id: string } }) {
    // 실제 구현에서는 params.id로 DB/API 조회 후 아래에 주입
    const data = {
        id: params.id,
        youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        title: "주일 2부 예배",
        verse: "요한복음 3:16",
        preacher: "홍길동 목사",
        date: "2025-09-28",
        content: [
            "하나님은 사랑이시라.",
            "그 사랑 안에서 우리에게 주신 구원의 확신을 나눕니다.",
        ],
    };

    return <WorshipDetail {...data} />;
}
