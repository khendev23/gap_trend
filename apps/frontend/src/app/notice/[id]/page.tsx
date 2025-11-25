import NoticeDetail from "@/component/notice/ts/NoticeDetail";

export default async function NoticePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;  // ★ 반드시 await 필요
    return <NoticeDetail id={id} />;
}


