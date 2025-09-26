import NoticeDetail from "@/component/notice/ts/NoticeDetail";

export default function NewsPage({ params }: { params: { id: string } }) {
    return <NoticeDetail id={params.id} />;
}

