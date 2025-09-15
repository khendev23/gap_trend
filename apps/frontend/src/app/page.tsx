export default async function Home() {
    let text = "loading...";
    try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
        const res = await fetch(`${base}/health`, { cache: "no-store" });
        text = res.ok ? (await res.json()).message ?? "ok" : `HTTP ${res.status}`;
    } catch {
        text = "백엔드 연결 실패";
    }
    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold">교회 홈페이지</h1>
            <p className="mt-2">백엔드 상태: {text}</p>
        </main>
    );
}