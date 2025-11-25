"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

export default function TipTapEditor({
                                         initial = "<p>내용을 입력하세요…</p>",
                                         onChange,
                                     }: {
    initial?: string;
    onChange?: (html: string) => void;
}) {
    const [mounted, setMounted] = useState(false);
    const [, forceUpdate] = useState(0);
    const refresh = () => forceUpdate(n => n + 1);

    useEffect(() => setMounted(true), []);

    const editor = useEditor(
        {
            extensions: [
                StarterKit.configure({ heading: { levels: [2, 3] } }),
                Link.configure({ openOnClick: true }),
            ],
            content: initial,
            autofocus: false,
            immediatelyRender: false,
            editable: true,
            editorProps: {
                attributes: {
                    class: [
                        "tiptap",
                        // 폰트 크기 / 타이포 반응형
                        "prose-sm md:prose-base lg:prose-lg",
                        "max-w-none",
                        // 패딩 반응형
                        "p-3 md:p-4 lg:p-5",
                        // 높이 / 스크롤 반응형
                        "min-h-[260px] md:min-h-[380px] lg:min-h-[480px]",
                        "max-h-[420px] md:max-h-[640px] lg:max-h-[720px]",
                        "overflow-y-auto",
                        // 배경/글자 (데스크탑에서 좀 더 또렷하게)
                        "bg-white text-gray-900",
                        // 모서리/포커스
                        "focus:outline-none",
                    ].join(" "),
                    spellcheck: "true",
                    tabindex: "0",
                },
                handleDOMEvents: {
                    mousedown: (_view, _event) => false,
                },
            },
            onUpdate({ editor }) {
                onChange?.(editor.getHTML());
            },
        },
        [mounted]
    );

    if (!mounted || !editor) return null;

    const btn = (active: boolean) =>
        [
            "px-2 py-1 md:px-3 md:py-1.5",
            "text-xs md:text-sm",
            "rounded-md",
            "border border-transparent",
            active
                ? "bg-gray-200 border-gray-300"
                : "hover:bg-gray-100",
        ].join(" ");

    return (
        <div
            className={[
                "w-full",
                // 넓은 화면에서 가운데 정렬 + 폭 제한
                "max-w-full md:max-w-3xl lg:max-w-4xl",
                "mx-auto",
                "rounded-2xl border border-gray-200 bg-white",
                "shadow-sm md:shadow",
            ].join(" ")}
        >
            {/* Toolbar */}
            <div
                className={[
                    "flex flex-wrap items-center",
                    "gap-1 md:gap-1.5 lg:gap-2",
                    "border-b border-gray-100",
                    "p-2 md:p-3",
                    // 모바일에서 버튼 많을 때 가로 스크롤 허용
                    "overflow-x-auto",
                ].join(" ")}
            >
                <button
                    type="button"
                    onClick={() => {
                        editor.chain().focus().toggleBold().run();
                        refresh();
                    }}
                    className={btn(editor.isActive("bold"))}
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={() => {
                        editor.chain().focus().toggleItalic().run();
                        refresh();
                    }}
                    className={btn(editor.isActive("italic"))}
                >
                    I
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={btn(editor.isActive("bulletList"))}
                >
                    • List
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={btn(editor.isActive("orderedList"))}
                >
                    1. List
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={btn(editor.isActive("heading", { level: 2 }))}
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    className={btn(editor.isActive("heading", { level: 3 }))}
                >
                    H3
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    className={[
                        "px-2 py-1 md:px-3 md:py-1.5",
                        "text-xs md:text-sm",
                        "rounded-md hover:bg-gray-100",
                    ].join(" ")}
                >
                    ↶
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    className={[
                        "px-2 py-1 md:px-3 md:py-1.5",
                        "text-xs md:text-sm",
                        "rounded-md hover:bg-gray-100",
                    ].join(" ")}
                >
                    ↷
                </button>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
