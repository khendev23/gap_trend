"use client";

import { useRouter, useSearchParams } from "next/navigation"; // 👈 추가
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/app/lib/useAuthStore";

const Editor = dynamic(() => import("@/component/editor/ts/ToastEditor"), {
    ssr: false,
    loading: () => <div className="h-[500px] bg-gray-50 animate-pulse rounded-xl" />,
});

export default function NoticeWritePage() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id"); // URL에서 id 추출

    const editorRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // 👈 파일 인풋 Ref

    const [title, setTitle] = useState("");
    const [initialContent, setInitialContent] = useState(""); // 👈 수정용 데이터 상태
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // 👈 선택된 파일들 상태
    const [isLoading, setIsLoading] = useState(!!editId); // 👈 수정 모드일 때만 로딩 활성화
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [existingFiles, setExistingFiles] = useState<any[]>([]); // 서버에서 온 NoticeAttachment 목록
    const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]); // 삭제할 파일 ID들

    // 기존 데이터 가져오기 로직(게시판 수정)
    useEffect(() => {
        if (!editId) return;

        const fetchNotice = async () => {
            try {
                const res = await fetch(`/server-api/notices/getNoticePost/${editId}`);
                if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
                const data = await res.json();

                setTitle(data.title);
                setInitialContent(data.content); // 서버에서 온 HTML

                // 👈 서버 엔티티 구조에 맞춰 기존 첨부파일 세팅
                if (data.attachments) {
                    setExistingFiles(data.attachments);
                }
            } catch (err) {
                alert("기존 글을 불러오는 중 오류가 발생했습니다.");
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotice();
    }, [editId, router]);

    // 파일 선택 핸들러
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...filesArray]);
        }
    };

    // 파일 삭제 핸들러
    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingFile = (id: number) => {
        // 1. 화면에서 제거
        setExistingFiles(prev => prev.filter(file => file.id !== id));
        // 2. 삭제 목록에 추가 (제출 시 서버에 전달)
        setDeletedFileIds(prev => [...prev, id]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const contentHtml = editorRef.current?.getInstance().getHTML();

        if (!title.trim() || contentHtml === "<p><br></p>") {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // 👈 FormData 생성 (파일 전송을 위해 필수)
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", contentHtml);
            formData.append("category", "1");
            if (user?.id) {
                formData.append("author", user.id);
            }

            // 삭제할 파일 ID 리스트를 문자열 배열 형태로 추가 (서버에서 파싱 필요)
            if (deletedFileIds.length > 0) {
                formData.append("deletedFileIds", JSON.stringify(deletedFileIds));
            }

            // 파일 배열 추가 (백엔드에서 List<MultipartFile> files로 받게 됨)
            selectedFiles.forEach((file) => {
                formData.append("files", file);
            });

            // 수정일 때는 PUT(혹은 별도 업데이트 엔드포인트), 신규일 때는 POST
            const url = editId ? `/server-api/notices/update/${editId}` : '/server-api/notices/register';
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                // headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: formData,
            });

            const data = Object.fromEntries(formData.entries());
            console.log(data);

            if (!res.ok) throw new Error("저장에 실패했습니다.");

            router.push('/notice');
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 로딩 중일 때는 에디터를 그리지 않음 (기존 데이터 세팅 보장)
    if (isLoading) return <div className="h-screen bg-white" />;

    return (
        <div className="min-h-screen bg-gray-50 [color-scheme:light] text-gray-900">
            <header className="sticky top-0 z-10 border-b bg-white px-4 py-3">
                <div className="mx-auto flex max-w-3xl items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-gray-600">
                        뒤로가기
                    </button>
                    <h1 className="text-lg font-bold">{editId ? "공지사항 수정" : "공지사항 작성"}</h1>
                    <div className="w-20" />
                </div>
            </header>

            <main className="mx-auto max-w-3xl p-4 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500">공지 제목</label>
                        <input
                            className="w-full text-xl font-bold outline-none border-b-2 border-gray-100 focus:border-gray-900 pb-2 bg-white text-black"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500">내용 작성</label>
                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                            {/* initialValue에 기존 content 전달 */}
                            <Editor ref={editorRef} initialValue={initialContent} />
                        </div>
                    </div>

                    {/* 첨부파일 영역 추가 */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500">첨부파일</label>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-fit px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                📎 파일 추가하기
                            </button>

                            <ul className="divide-y divide-gray-100 border rounded-xl overflow-hidden">
                                {/* 1. 기존 서버에 저장된 파일 목록 (NoticeAttachment) */}
                                {existingFiles.map((file) => (
                                    <li key={file.id} className="flex items-center justify-between bg-blue-50 px-4 py-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-400">기존파일</span>
                                            <span className="font-medium text-gray-700 truncate">{file.fileName}</span>
                                            <span className="text-gray-400 text-xs">({(file.fileSize / 1024 / 1024).toFixed(2)}MB)</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeExistingFile(file.id)}
                                            className="text-red-500 hover:text-red-700 font-bold"
                                        >
                                            삭제
                                        </button>
                                    </li>
                                ))}

                                {/* 2. 새로 추가하려는 파일 목록 (File 객체) */}
                                {selectedFiles.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between bg-white px-4 py-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-500">신규</span>
                                            <span className="font-medium text-gray-700 truncate">{file.name}</span>
                                        </div>
                                        <button type="button" onClick={() => removeFile(index)} className="text-red-400 font-bold p-1">
                                            삭제
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border rounded-xl">취소</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl">
                            {editId ? "수정 완료" : "공지사항 등록"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}