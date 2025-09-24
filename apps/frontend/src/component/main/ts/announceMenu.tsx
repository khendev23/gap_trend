'use client'

import { useState } from "react";
import Link from "next/link";

type TabKey = 'announceMenu' | 'newsMenu';

const DATA: Record<TabKey, { title: string; date: string }[]> = {
    announceMenu: [
        { title: '공지사항 샘플1', date: '25.05.08' },
        { title: '공지사항 샘플2', date: '25.05.08' },
        { title: '공지사항 샘플3', date: '25.05.08' },
        { title: '공지사항 샘플4', date: '25.05.08' },
        { title: '공지사항 샘플5', date: '25.05.08' },
    ],
    newsMenu: [
        { title: '소식 샘플1', date: '25.05.08' },
        { title: '소식 샘플2', date: '25.05.08' },
        { title: '소식 샘플3', date: '25.05.08' },
        { title: '소식 샘플4', date: '25.05.08' },
        { title: '소식 샘플5', date: '25.05.08' },
    ],
};

export default function AnnounceMenu() {
    const [selectedMenu, setSelectedMenu] = useState<TabKey>('announceMenu');

    const isActive = (key: TabKey) => selectedMenu === key;

    return (
        <section className="w-screen min-h-[30vh] bg-[#FDF2F0]">
            {/* 상단 타이틀/탭 */}
            <div className="text-black flex items-center justify-between px-6 md:px-12 pt-4">
                {/* 탭 */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedMenu('announceMenu')}
                        className={`text-base md:text-lg font-semibold pb-1
              ${isActive('announceMenu') ? 'text-black border-b-2 border-black' : 'text-gray-700'}
              transition-colors`}
                    >
                        공지사항
                    </button>
                    <span className="px-2">|</span>
                    <button
                        type="button"
                        onClick={() => setSelectedMenu('newsMenu')}
                        className={`text-base md:text-lg font-semibold pb-1
              ${isActive('newsMenu') ? 'text-black border-b-2 border-black' : 'text-gray-700'}
              transition-colors`}
                    >
                        교회소식
                    </button>
                </div>

                {/* 더보기 */}
                <div className="text-sm md:text-base">
                    {/* 링크 경로는 필요에 맞게 변경하세요 */}
                    <Link href={selectedMenu === 'announceMenu' ? '/notice' : '/news'} className="px-2 hover:underline">
                        더보기
                    </Link>
                </div>
            </div>

            {/* 리스트 */}
            <div className="mt-2 text-black divide-y divide-black/10">
                {DATA[selectedMenu].map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between px-6 md:px-12 py-3"
                    >
                        <p className="contentsTitle text-[0.9rem] md:text-base truncate pr-3">
                            {item.title}
                        </p>
                        <p className="contentsDate text-[0.7rem] md:text-sm shrink-0 text-gray-700">
                            {item.date}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}