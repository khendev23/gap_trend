'use client';

import React, { useState } from 'react';

type Worship = {
  id: number;
  title: string;
  date: string;
  category: string;
  preacher: string;
  url?: string;
  verse?: string;
  content?: string;
  thumbnail?: string;
};

const initialWorships: Worship[] = [
  { 
    id: 1, 
    title: '2026-02-01 주일예배', 
    date: '2026-02-01', 
    category: 'sundayAM', 
    preacher: '홍길동 목사',
    url: 'https://youtube.com/watch?v=123',
    verse: '창세기 1:1',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop'
  },
  { 
    id: 2, 
    title: '2026-01-28 수요예배', 
    date: '2026-01-28', 
    category: 'wednesday', 
    preacher: '이순신 목사',
    url: 'https://youtube.com/watch?v=456',
    verse: '시편 23:1'
  },
  { 
    id: 3, 
    title: '2026-01-25 주일예배', 
    date: '2026-01-25', 
    category: 'sundayAM', 
    preacher: '김철수 목사',
    url: 'https://youtube.com/watch?v=789',
    verse: '요한복음 3:16'
  },
];

export default function WorshipManagementPage() {
  const [worships, setWorships] = useState<Worship[]>(initialWorships);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 폼 상태
  const [fDate, setFDate] = useState('');
  const [fCategory, setFCategory] = useState('sundayAM');
  const [fTitle, setFTitle] = useState('');
  const [fPreacher, setFPreacher] = useState('');
  const [fVerse, setFVerse] = useState('');
  const [fUrl, setFUrl] = useState('');
  const [fContent, setFContent] = useState('');
  const [fThumbFile, setFThumbFile] = useState<File | null>(null);

  const resetForm = () => {
    setFDate('');
    setFCategory('sundayAM');
    setFTitle('');
    setFPreacher('');
    setFVerse('');
    setFUrl('');
    setFContent('');
    setFThumbFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newWorship: Worship = {
      id: Date.now(),
      title: fTitle,
      date: fDate,
      category: fCategory,
      preacher: fPreacher,
      url: fUrl,
      verse: fVerse,
      content: fContent,
    };
    setWorships([newWorship, ...worships]);
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">예배 관리</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          새 예배 등록
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">분류</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설교자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유튜브 링크</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {worships.map((worship) => (
              <tr key={worship.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{worship.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {worship.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {worship.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {worship.preacher}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  {worship.url && (
                    <a href={worship.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      링크 보기
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">수정</button>
                  <button className="text-red-600 hover:text-red-900">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 새 예배 등록 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">새 예배 등록</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input 
                  type="date" 
                  value={fDate}
                  onChange={(e) => setFDate(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예배 종류</label>
                <select 
                  value={fCategory}
                  onChange={(e) => setFCategory(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="sundayAM">주일오전</option>
                  <option value="sundayPM">주일오후</option>
                  <option value="wednesday">수요예배</option>
                  <option value="friday">금요기도회</option>
                  <option value="youth">청년/학생</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input 
                  type="text" 
                  value={fTitle}
                  onChange={(e) => setFTitle(e.target.value)}
                  placeholder="예: 2026-02-01 주일예배"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL (YouTube)</label>
                <input 
                  type="url" 
                  value={fUrl}
                  onChange={(e) => setFUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">썸네일</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFThumbFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설교자</label>
                <input 
                  type="text" 
                  value={fPreacher}
                  onChange={(e) => setFPreacher(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">성경 본문</label>
                <input 
                  type="text" 
                  value={fVerse}
                  onChange={(e) => setFVerse(e.target.value)}
                  placeholder="예: 요한복음 3:16"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea 
                  value={fContent}
                  onChange={(e) => setFContent(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
