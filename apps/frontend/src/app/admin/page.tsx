import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { name: '승인 대기 성도', value: '5', link: '/admin/users' },
    { name: '금주 예배 게시글', value: '3', link: '/admin/worship' },
    { name: '최근 게시글', value: '12', link: '/admin/boards' },
    { name: '전체 성도', value: '120', link: '/admin/users' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">관리자 대시보드</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.link}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="mt-2 text-3xl font-semibold text-indigo-600">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">최근 승인 요청</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-700">홍길동 {i}</p>
                  <p className="text-sm text-gray-500">2026-02-0{i} 신청</p>
                </div>
                <button className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200">
                  확인하기
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">예배 관리 바로가기</h3>
          <div className="space-y-4">
             <button className="w-full py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-left px-4 font-medium">
               신규 예배 영상 업로드
             </button>
             <button className="w-full py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-left px-4 font-medium">
               게시판 공지사항 작성
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
