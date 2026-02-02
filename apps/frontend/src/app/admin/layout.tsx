import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 사이드바 */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">관리자 모드</h1>
        </div>
        <nav className="mt-6">
          <Link href="/admin" className="block px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
            대시보드
          </Link>
          <Link href="/admin/users" className="block px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
            성도 관리
          </Link>
          <Link href="/admin/worship" className="block px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
            예배 관리
          </Link>
          <Link href="/admin/boards" className="block px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
            게시판 관리
          </Link>
          <div className="mt-10 px-6">
             <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">
               메인페이지로 돌아가기
             </Link>
          </div>
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 (모바일용 사이드바 토글 등 확장 가능) */}
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center md:hidden">
          <h1 className="text-xl font-bold text-indigo-600">관리자 모드</h1>
          {/* 모바일 메뉴 버튼 생략 (필요 시 추가) */}
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
