'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type TabKey = 'announceMenu' | 'newsMenu';

// 백엔드 응답 아이템 타입(필요 시 필드명 맞춰 조정)
type NoticeItem = {
    id: string | number;
    title: string;
    createdAt: string; // ISO 문자열
};

type HomeLists = {
    notice: NoticeItem[];
    news: NoticeItem[];
};

export default function AnnounceMenu() {
    const [selectedMenu, setSelectedMenu] = useState<TabKey>('announceMenu');
    const [lists, setLists] = useState<HomeLists>({ notice: [], news: [] });
    const [loading, setLoading] = useState(true);

    const isActive = (key: TabKey) => selectedMenu === key;

    // 날짜 포맷: 'YY.MM.DD'
    const fmt = (iso?: string) => {
        if (!iso) return '';
        const d = new Date()
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yy}.${mm}.${dd}`;
        // 필요하면 한국시간 보정: new Date(new Date(iso).getTime() + 9*60*60*1000)
    };

    useEffect(() => {
        const ctrl = new AbortController();

        (async () => {
            try {
                setLoading(true);
                // 같은 도메인 라우트 핸들러(또는 Nest → 프록시)라면 상대 경로로 OK
                const res = await fetch('/server-api/notices/latest', {
                    signal: ctrl.signal,
                    cache: 'no-store', // 최신값 선호
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = (await res.json()) as HomeLists;

                // 방어적 가드 + 최대 5개 제한
                setLists({
                    notice: Array.isArray(data?.notice) ? data.notice.slice(0, 5) : [],
                    news: Array.isArray(data?.news) ? data.news.slice(0, 5) : [],
                });
            } catch (err) {
                // AbortError는 조용히 무시
                if ((err as any)?.name !== 'AbortError') {
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        })();

        // 언마운트 시 요청 취소
        return () => ctrl.abort();
    }, []);

    // 현재 탭에 맞는 데이터 선택
    const current =
        selectedMenu === 'announceMenu' ? lists.notice : lists.news;

    return (
        <section className="w-screen min-h-[30vh] bg-[#FDF2F0]">
            {/* 상단 타이틀/탭 */}
            <div className="text-black flex items-center justify-between px-6 md:px-12 pt-4">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedMenu('announceMenu')}
                        className={`text-base md:text-lg font-semibold pb-1 ${
                            isActive('announceMenu')
                                ? 'text-black border-b-2 border-black'
                                : 'text-gray-700'
                        } transition-colors`}
                    >
                        공지사항
                    </button>
                    <span className="px-2">|</span>
                    <button
                        type="button"
                        onClick={() => setSelectedMenu('newsMenu')}
                        className={`text-base md:text-lg font-semibold pb-1 ${
                            isActive('newsMenu')
                                ? 'text-black border-b-2 border-black'
                                : 'text-gray-700'
                        } transition-colors`}
                    >
                        교회소식
                    </button>
                </div>

                {/* 더보기: 라우트는 프로젝트에 맞게 조정 */}
                <div className="text-sm md:text-base">
                    <Link
                        href={selectedMenu === 'announceMenu' ? '/notice' : '/news'}
                        className="px-2 hover:underline"
                    >
                        더보기
                    </Link>
                </div>
            </div>

            {/* 리스트 */}
            <div className="mt-2 text-black divide-y divide-black/10">
                {loading ? (
                    <div className="px-6 md:px-12 py-6 text-sm text-gray-600">
                        불러오는 중…
                    </div>
                ) : current.length === 0 ? (
                    <div className="px-6 md:px-12 py-6 text-sm text-gray-600">
                        표시할 항목이 없습니다.
                    </div>
                ) : (
                    current.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between px-6 md:px-12 py-3"
                        >
                            <Link href={`/notice/${item.id}`}>
                                <p className="contentsTitle text-[0.9rem] md:text-base truncate pr-3">
                                    {item.title}
                                </p>
                            </Link>
                            <p className="contentsDate text-[0.7rem] md:text-sm shrink-0 text-gray-700">
                                {fmt(item.createdAt)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}