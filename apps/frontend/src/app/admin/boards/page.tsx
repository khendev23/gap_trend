'use client';

import React, { useState } from 'react';

type Board = {
  id: number;
  name: string;
  type: string;
  postCount: number;
  status: 'active' | 'private';
};

const initialBoards: Board[] = [
  { id: 1, name: '공지사항', type: '공지', postCount: 45, status: 'active' },
  { id: 2, name: '교회소식', type: '뉴스', postCount: 128, status: 'active' },
  { id: 3, name: '예배 영상', type: '영상', postCount: 567, status: 'active' },
  { id: 4, name: '소그룹(목장)', type: '커뮤니티', postCount: 234, status: 'active' },
  { id: 5, name: '사역/훈련', type: '일반', postCount: 12, status: 'active' },
  { id: 6, name: '갤러리', type: '사진', postCount: 89, status: 'private' },
];

export default function BoardManagementPage() {
  const [boards] = useState<Board[]>(initialBoards);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">게시판 관리</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          새 게시판 생성
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {boards.map((board) => (
          <div key={board.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">{board.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  board.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {board.status === 'active' ? '운영중' : '비공개'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">타입: {board.type} | 게시글 수: {board.postCount}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-indigo-600">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-indigo-50 p-6 rounded-xl border border-indigo-100 text-indigo-800">
        <h4 className="font-bold mb-2">💡 팁</h4>
        <p className="text-sm opacity-90">게시판 이름을 클릭하면 해당 게시판의 글 목록 관리 페이지로 이동합니다.</p>
      </div>
    </div>
  );
}
