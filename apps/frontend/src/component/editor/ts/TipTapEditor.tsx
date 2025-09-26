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
    // 컴포넌트 상단
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
            immediatelyRender: false,     // ✅ SSR 경고/비편집 상태 방지
            editable: true,               // ✅ 편집 허용 강제
            editorProps: {
                attributes: {
                    class:
                        "tiptap prose-sm max-w-none p-3 min-h-[380px] max-h-[640px] overflow-y-auto",
                    spellcheck: "true",
                    tabindex: "0",
                },
                handleDOMEvents: {
                    // 드물게 부모 엘리먼트의 이벤트가 포커스를 빼앗는 경우 보호
                    mousedown: (_view, _event) => {
                        // false를 반환해야 기본 동작 허용(=에디터 포커스)
                        return false;
                    },
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
        `px-2 py-1 text-sm rounded ${active ? "bg-gray-200" : "hover:bg-gray-100"}`;

    return (
        <div className="rounded-2xl border">
            {/* Toolbar (모두 type=button 유지) */}
            <div className="flex flex-wrap gap-1 border-b p-2">
                <button
                    type="button"
                    onClick={() => {
                        editor.chain().focus().toggleBold().run();
                        refresh(); // ✅ 클릭 즉시 버튼 활성(음영) 반영
                    }}
                    className={btn(editor.isActive("bold"))}
                > B
                </button>
                <button
                    type="button"
                    onClick={() => {
                        editor.chain().focus().toggleItalic().run();
                        refresh(); // ✅
                    }}
                    className={btn(editor.isActive("italic"))}
                >I
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>• List</button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>1. List</button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>
                <button type="button" onClick={() => editor.chain().focus().undo().run()} className="px-2 py-1 text-sm rounded hover:bg-gray-100">↶</button>
                <button type="button" onClick={() => editor.chain().focus().redo().run()} className="px-2 py-1 text-sm rounded hover:bg-gray-100">↷</button>
            </div>

            {/* Editor (class는 editorProps.attributes에서 지정) */}
            <EditorContent editor={editor} />
        </div>
    );
}