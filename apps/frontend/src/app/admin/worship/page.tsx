'use client';

import React, { useState, useEffect } from 'react';

type Category = "sundayAM" | "sundayPM" | "wednesday" | "friday" | "youth" | "student" | "nurture" | "special";

type Worship = {
  id: number;
  title: string;
  date: string;
  category: Category;
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
  const [fCategory, setFCategory] = useState<Category>('sundayAM');
  const [fTitle, setFTitle] = useState('');
  const [fPreacher, setFPreacher] = useState('');
  const [fVerse, setFVerse] = useState('');
  const [fUrl, setFUrl] = useState('');
  const [fContent, setFContent] = useState('');
  const [fThumbFile, setFThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string>("");
  const [thumbSource, setThumbSource] = useState<"preset" | "file">("preset");
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // 예배 종류별 미리 정의된 썸네일 이미지
  const presetThumbnails: Partial<Record<Category, string>> = {
    sundayAM: "https://gap.synology.me/worship/주일오전예배.png",
    sundayPM: "https://gap.synology.me/worship/주일오후예배.png",
    wednesday: "https://gap.synology.me/worship/수요예배.png",
    friday: "https://gap.synology.me/worship/금요기도회.jpg",
    youth: "https://gap.synology.me/worship/청년부예배.png",
    student: "https://gap.synology.me/worship/학생부예배.png",
  };

  // 모달 열릴 때 기본 썸네일 설정
  useEffect(() => {
    if (isModalOpen) {
      const presetUrl = presetThumbnails[fCategory];
      if (presetUrl) {
        setSelectedPreset(presetUrl);
        setThumbSource("preset");
      } else {
        setSelectedPreset("");
        setThumbSource("file");
      }
    }
  }, [isModalOpen]);

  // 카테고리 변경 시 해당 카테고리의 썸네일로 자동 변경
  useEffect(() => {
    if (thumbSource === "preset") {
      const presetUrl = presetThumbnails[fCategory];
      if (presetUrl) {
        setSelectedPreset(presetUrl);
      }
    }
  }, [fCategory, thumbSource]);

  // 파일 미리보기
  useEffect(() => {
    if (thumbSource === "file" && fThumbFile) {
      const objectUrl = URL.createObjectURL(fThumbFile);
      setThumbPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (thumbSource === "preset" && selectedPreset) {
      setThumbPreview(selectedPreset);
    } else {
      setThumbPreview("");
    }
  }, [fThumbFile, thumbSource, selectedPreset]);

  const resetForm = () => {
    setFDate('');
    setFCategory('sundayAM');
    setFTitle('');
    setFPreacher('');
    setFVerse('');
    setFUrl('');
    setFContent('');
    setFThumbFile(null);
    setThumbPreview("");
    setThumbSource("preset");
    setSelectedPreset("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 썸네일 경로: 업로드(파일) 시 blob URL 미리보기 사용
    const thumb = thumbPreview || "";

    const newWorship: Worship = {
      id: Date.now(),
      title: fTitle,
      date: fDate,
      category: fCategory,
      preacher: fPreacher,
      url: fUrl,
      verse: fVerse,
      content: fContent,
      thumbnail: thumb,
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
          <div className="w-full max-w-md rounded-2xl bg-white flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0">
              <h2 className="text-lg font-bold">새 예배 등록</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
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
                    onChange={(e) => setFCategory(e.target.value as Category)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  >
                    <option value="sundayAM">주일오전</option>
                    <option value="sundayPM">주일오후</option>
                    <option value="wednesday">수요</option>
                    <option value="friday">금요</option>
                    <option value="youth">청년</option>
                    <option value="student">학생부</option>
                    <option value="nurture">양육</option>
                    <option value="special">특강</option>
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

                {/* 썸네일 (미리 정의된 이미지 또는 파일 선택) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">썸네일</label>

                  {/* 썸네일 소스 선택 탭 */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setThumbSource("preset");
                        setFThumbFile(null);
                      }}
                      className={[
                        "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                        thumbSource === "preset"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      ].join(" ")}
                    >
                      기본 이미지
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbSource("file")}
                      className={[
                        "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                        thumbSource === "file"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      ].join(" ")}
                    >
                      파일 선택
                    </button>
                  </div>

                  {/* 기본 이미지 선택 */}
                  {thumbSource === "preset" && (
                    <div className="space-y-3">
                      {/* 현재 선택된 예배의 썸네일만 표시 */}
                      {presetThumbnails[fCategory] && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-indigo-600 ring-2 ring-indigo-600">
                          <img
                            src={presetThumbnails[fCategory]}
                            alt="선택된 예배 썸네일"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-sm py-2 text-center">
                            {fCategory === "sundayAM" && "주일오전예배"}
                            {fCategory === "sundayPM" && "주일오후예배"}
                            {fCategory === "wednesday" && "수요예배"}
                            {fCategory === "friday" && "금요기도회"}
                            {fCategory === "youth" && "청년부예배"}
                            {fCategory === "student" && "학생부예배"}
                          </div>
                        </div>
                      )}
                      {!presetThumbnails[fCategory] && (
                        <p className="text-sm text-gray-500 py-3 text-center">
                          이 예배는 기본 이미지가 없습니다. 파일을 직접 선택해주세요.
                        </p>
                      )}
                    </div>
                  )}

                  {/* 파일 선택 */}
                  {thumbSource === "file" && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFThumbFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm"
                      />
                    </div>
                  )}

                  {/* 미리보기 */}
                  {thumbPreview && (
                    <div className="mt-3 rounded-xl overflow-hidden bg-gray-100">
                      <div className="relative w-full aspect-video">
                        <img
                          src={thumbPreview}
                          alt="미리보기"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
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
                    placeholder="설교 요약 또는 안내 내용을 입력하세요."
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 제출/취소 - 하단 고정 */}
              <div className="flex gap-3 px-6 py-4 border-t bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
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
