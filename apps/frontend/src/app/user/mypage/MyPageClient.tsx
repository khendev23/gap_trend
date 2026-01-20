'use client';

import React, { useState } from 'react';
import { User, Bookmark, Heart, Image as ImageIcon, PlayCircle, Calendar, CheckCircle2 } from 'lucide-react';

// --- 타입 정의 (DB 구조 반영) ---
export interface GroupInfo {
    id: number;
    name: string;   // 예: "1교구 사랑목장" or "할렐루야 성가대"
    role: string;   // 예: "목원" or "테너"
    isMain: boolean; // 대표 소속 여부
}

export interface UserData {
    name: string;
    position: string;      // 직분 (집사, 권사 등)
    groups: GroupInfo[];   // 👈 핵심 변경: 소속이 배열로 들어옴
    baptizedDate: string;
    profileImage?: string;
}

// --- 더미 데이터 (콘텐츠 탭용) ---
const SAVED_SERMONS = [
    { id: 1, title: "고난을 넘어서는 믿음", preacher: "이목사", date: "2026.01.12", thumbnail: "bg-slate-200" },
    { id: 2, title: "새해 첫 축복", preacher: "이목사", date: "2026.01.05", thumbnail: "bg-slate-200" },
];

const PRAYER_REQUESTS = [
    { id: 1, content: "이번 프로젝트 잘 마무리하게 해주세요.", date: "2026.01.15", status: "prayer" },
    { id: 2, content: "가족들의 건강을 위해 기도합니다.", date: "2025.12.30", status: "answered" },
];

const MEMORIES = [1, 2, 3, 4, 5, 6];

// --- 컴포넌트 시작 ---
export default function MyPageClient({ user }: { user: UserData }) {
    const [activeTab, setActiveTab] = useState('sermon');

    return (
        <div className="bg-white">
            <div className="max-w-2xl mx-auto min-h-screen bg-gray-50 pb-20">

                {/* 1. 상단 프로필 영역 */}
                <div className="bg-white p-6 shadow-sm rounded-b-3xl">
                    <div className="flex items-start space-x-4"> {/* items-center -> items-start로 변경 (소속이 많아질 수 있어서) */}

                        {/* 프로필 이미지 */}
                        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-md flex-shrink-0">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt="프로필" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-indigo-400" />
                            )}
                        </div>

                        {/* 이름 및 정보 */}
                        <div className="flex-1 min-w-0"> {/* min-w-0: 텍스트 말줄임 등을 위해 필요 */}
                            <div className="flex items-center space-x-2">
                                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium border border-gray-200">
                                    {user.position}
                                </span>
                            </div>

                            <p className="text-xs text-gray-400 mt-1 mb-2">세례일: {user.baptizedDate}</p>

                            {/* ⭐ 소속 그룹 리스트 (Badge UI) ⭐ */}
                            <div className="flex flex-wrap gap-1.5">
                                {user.groups && user.groups.length > 0 ? (
                                    user.groups.map((group) => (
                                        <div
                                            key={group.id}
                                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border
                                                ${group.isMain
                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200' // 대표 소속 디자인
                                                : 'bg-white text-gray-500 border-gray-200'        // 일반 소속 디자인
                                            }`}
                                        >
                                            {/* 소속 이름 */}
                                            <span>{group.name}</span>
                                            {/* 구분선 */}
                                            <span className="mx-1.5 opacity-30">|</span>
                                            {/* 역할 */}
                                            <span className={group.isMain ? 'font-semibold' : ''}>{group.role}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-400">소속 정보가 없습니다.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. 탭 메뉴 (Sticky) */}
                <div className="flex border-b border-gray-200 bg-white mt-2 sticky top-0 z-20">
                    {[
                        { id: 'sermon', label: '설교 보관', icon: Bookmark },
                        { id: 'prayer', label: '기도제목', icon: Heart },
                        { id: 'photo', label: '추억 사진', icon: ImageIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 flex items-center justify-center space-x-1.5 text-sm font-medium transition-colors relative
                            ${activeTab === tab.id
                                ? 'text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {/* 활성 탭 하단 바 애니메이션 효과 */}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />
                            )}
                        </button>
                    ))}
                </div>

                {/* 3. 콘텐츠 영역 */}
                <div className="p-4">
                    {/* 설교 탭 */}
                    {activeTab === 'sermon' && (
                        <div className="space-y-4">
                            {SAVED_SERMONS.map((sermon) => (
                                <div key={sermon.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex space-x-4">
                                    <div className={`w-24 h-16 rounded-lg ${sermon.thumbnail} flex-shrink-0 bg-gray-200`} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-800 line-clamp-1">{sermon.title}</h3>
                                        <div className="flex justify-between items-end mt-2">
                                            <span className="text-xs text-gray-500">{sermon.preacher} · {sermon.date}</span>
                                            <button className="text-indigo-600 flex items-center text-xs font-medium hover:bg-indigo-50 px-2 py-1 rounded transition">
                                                <PlayCircle className="w-3 h-3 mr-1" /> 재생
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 기도제목 탭 */}
                    {activeTab === 'prayer' && (
                        <div className="space-y-3">
                            <button className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-50 transition flex justify-center items-center">
                                + 새 기도제목 작성
                            </button>
                            {PRAYER_REQUESTS.map((prayer) => (
                                <div key={prayer.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center border
                                            ${prayer.status === 'answered'
                                            ? 'bg-green-50 text-green-600 border-green-200'
                                            : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                            {prayer.status === 'answered' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Calendar className="w-3 h-3 mr-1" />}
                                            {prayer.status === 'answered' ? '응답받음' : '기도중'}
                                        </span>
                                        <span className="text-xs text-gray-400">{prayer.date}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{prayer.content}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 사진 탭 */}
                    {activeTab === 'photo' && (
                        <div className="grid grid-cols-3 gap-0.5 rounded-xl overflow-hidden border border-gray-200">
                            {MEMORIES.map((id) => (
                                <div key={id} className="aspect-square bg-gray-100 relative group cursor-pointer hover:opacity-90 transition">
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}