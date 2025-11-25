'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type TabKey = 'announceMenu' | 'newsMenu';

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
    // 추천: UTC 기준
    const fmt = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        const yy = String(d.getUTCFullYear()).slice(-2);
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        return `${yy}.${mm}.${dd}`;
    };


    useEffect(() => {
        const ctrl = new AbortController();

        (async () => {
            try {
                setLoading(true);
                const res = await fetch('/server-api/notices/latest', {
                    signal: ctrl.signal,
                    cache: 'no-store',
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = (await res.json()) as HomeLists;

                setLists({
                    notice: Array.isArray(data?.notice) ? data.notice.slice(0, 5) : [],
                    news: Array.isArray(data?.news) ? data.news.slice(0, 5) : [],
                });

                console.log(data);
            } catch (err) {
                if ((err as any)?.name !== 'AbortError') {
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => ctrl.abort();
    }, []);

    // 모바일에서 탭에 맞는 데이터
    const current =
        selectedMenu === 'announceMenu' ? lists.notice : lists.news;

    return (
        <section className="w-screen min-h-[30vh] bg-[#FFF7F5]">
            <div className="w-full max-w-5xl mx-auto md:px-0">
                {/* =================== 모바일 버전: 탭 전환 =================== */}
                <div className="md:hidden">
                    {/* 상단 타이틀/탭 */}
                    <div className="text-black flex items-center justify-between px-6 pt-4">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedMenu('announceMenu')}
                                className={`text-base font-semibold pb-1 ${
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
                                className={`text-base font-semibold pb-1 ${
                                    isActive('newsMenu')
                                        ? 'text-black border-b-2 border-black'
                                        : 'text-gray-700'
                                } transition-colors`}
                            >
                                교회소식
                            </button>
                        </div>

                        <div className="text-sm">
                            <Link
                                href={
                                    selectedMenu === 'announceMenu'
                                        ? '/notice'
                                        : '/news'
                                }
                                className="px-2 hover:underline"
                            >
                                더보기
                            </Link>
                        </div>
                    </div>

                    {/* 리스트 */}
                    <div className="mt-2 text-black divide-y divide-black/10">
                        {loading ? (
                            <div className="px-6 py-6 text-sm text-gray-600">
                                불러오는 중…
                            </div>
                        ) : current.length === 0 ? (
                            <div className="px-6 py-6 text-sm text-gray-600">
                                표시할 항목이 없습니다.
                            </div>
                        ) : (
                            current.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between px-6 py-3"
                                >
                                    <Link
                                        href={
                                            selectedMenu === 'announceMenu'
                                                ? `/notice/${item.id}`
                                                : `/news/${item.id}`
                                        }
                                        className="flex-1 text-black"
                                    >
                                        <p className="contentsTitle text-[0.9rem] truncate pr-3 text-black">
                                            {item.title}
                                        </p>
                                    </Link>
                                    <p className="contentsDate text-[0.7rem] shrink-0 text-gray-700">
                                        {fmt(item.createdAt)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* =================== 데스크탑 버전: 두 그룹 나란히 =================== */}
                <div className="hidden md:grid grid-cols-2 gap-8 py-8">
                    {loading ? (
                        <div className="col-span-2 text-sm text-gray-600">
                            불러오는 중…
                        </div>
                    ) : (
                        <>
                            {/* 공지사항 컬럼 */}
                            <div className="rounded-2xl bg-[#FDF2F0] px-6 py-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-black">
                                        공지사항
                                    </h2>
                                    <Link
                                        href="/notice"
                                        className="text-sm text-gray-700 hover:underline"
                                    >
                                        더보기
                                    </Link>
                                </div>
                                <div className="divide-y divide-black/10">
                                    {lists.notice.length === 0 ? (
                                        <div className="py-4 text-sm text-gray-600">
                                            표시할 공지사항이 없습니다.
                                        </div>
                                    ) : (
                                        lists.notice.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between py-2"
                                            >
                                                <Link
                                                    href={`/notice/${item.id}`}
                                                    className="flex-1"
                                                >
                                                    <p className="contentsTitle text-sm md:text-base truncate pr-3 text-black">
                                                        {item.title}
                                                    </p>
                                                </Link>
                                                <p className="contentsDate text-xs md:text-sm shrink-0 text-gray-700">
                                                    {fmt(item.createdAt)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* 교회소식 컬럼 */}
                            <div className="rounded-2xl bg-[#FBE4DE] px-6 py-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-black">
                                        교회소식
                                    </h2>
                                    <Link
                                        href="/news"
                                        className="text-sm text-gray-700 hover:underline"
                                    >
                                        더보기
                                    </Link>
                                </div>
                                <div className="divide-y divide-black/10">
                                    {lists.news.length === 0 ? (
                                        <div className="py-4 text-sm text-gray-600">
                                            표시할 교회소식이 없습니다.
                                        </div>
                                    ) : (
                                        lists.news.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between py-2"
                                            >
                                                <Link
                                                    href={`/news/${item.id}`}
                                                    className="flex-1"
                                                >
                                                    <p className="contentsTitle text-sm md:text-base truncate pr-3">
                                                        {item.title}
                                                    </p>
                                                </Link>
                                                <p className="contentsDate text-xs md:text-sm shrink-0 text-gray-700">
                                                    {fmt(item.createdAt)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
