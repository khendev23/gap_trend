"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
// 한국어 설정이 필요하다면 아래 주석 해제 (단, 언어팩 추가 설치 필요할 수 있음)
// import "@toast-ui/editor/dist/i18n/ko-kr";

interface Props {
    initialValue?: string;
}

const ToastEditor = forwardRef((props: Props, ref) => {
    const editorRef = useRef<Editor>(null);

    // 부모 컴포넌트에서 에디터 인스턴스에 접근할 수 있도록 노출
    useImperativeHandle(ref, () => ({
        getInstance: () => editorRef.current?.getInstance(),
    }));

    return (
        <Editor
            ref={editorRef}
            initialValue={props.initialValue || " "}
            placeholder="내용을 입력해주세요."
            previewStyle="vertical"
            height="500px"
            initialEditType="wysiwyg" // 티스토리 스타일
            useCommandShortcut={true}
            language="ko-KR"
            toolbarItems={[
                ["heading", "bold", "italic", "strike"],
                ["hr", "quote"],
                ["ul", "ol", "task", "indent", "outdent"],
                ["table", "image", "link"],
            ]}
            // 이미지 업로드 로직은 나중에 백엔드와 연결 시 여기에 hooks 추가
            hooks={{
                addImageBlobHook: async (blob: Blob | File, callback: (url: string, alt: string) => void) => {
                    // 1. 업로드할 폼 데이터 생성
                    const formData = new FormData();
                    formData.append("file", blob);

                    try {
                        // 2. 백엔드 업로드 API 호출
                        // 주의: 실제 Spring Boot 백엔드 주소로 수정 필요 (예: http://localhost:8080/api/file/upload)
                        // Next.js rewrites 설정을 했다면 /api/file/upload 그대로 사용 가능
                        const response = await fetch('/server-api/file/upload/img', {
                            method: "POST",
                            body: formData,
                            // fetch가 자동으로 Content-Type: multipart/form-data를 설정하므로 헤더 수동 설정 금지
                        });

                        if (!response.ok) {
                            throw new Error("이미지 업로드 실패");
                        }

                        // 3. 백엔드에서 받은 URL 추출
                        // 백엔드가 { "url": "https://gap.synology.me/..." } 형태로 준다고 가정
                        const data = await response.json();
                        const imageUrl = data.url;

                        // 4. 에디터에 이미지 삽입
                        // callback(이미지URL, 대체텍스트)
                        callback(imageUrl, "image");

                    } catch (error) {
                        console.error("업로드 중 오류 발생:", error);
                        alert("이미지 업로드에 실패했습니다.");
                    }

                    // 5. false를 반환하여 TUI Editor의 기본 base64 인코딩 동작을 막음 (필수!)
                    return false;
                },
            }}
        />
    );
});

ToastEditor.displayName = "ToastEditor";
export default ToastEditor;