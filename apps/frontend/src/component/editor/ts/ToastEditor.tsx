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
                ["code", "codeblock"],
            ]}
            // 이미지 업로드 로직은 나중에 백엔드와 연결 시 여기에 hooks 추가
        />
    );
});

ToastEditor.displayName = "ToastEditor";
export default ToastEditor;