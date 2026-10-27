import React, { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Swal from "sweetalert2"; // --- 1. IMPORT SWEETALERT2 ---
import withReactContent from "sweetalert2-react-content"; // Opsional, untuk integrasi lebih dalam dengan React
import "./TipTapEditor.css";

const MySwal = withReactContent(Swal);

// Komponen untuk Toolbar/MenuBar
const MenuBar = ({ editor }) => {
  // --- 2. MODIFIKASI FUNGSI SETLINK ---
  const setLink = useCallback(() => {
    if (!editor) {
      return;
    }
    const previousUrl = editor.getAttributes("link").href;

    // Tampilkan modal SweetAlert2 untuk meminta URL
    MySwal.fire({
      title: "Masukkan URL",
      input: "url",
      inputLabel: "Alamat URL",
      inputValue: previousUrl,
      showCancelButton: true,
      confirmButtonText: "Set Link",
      cancelButtonText: "Batal",
      confirmButtonColor: "#27ae60",
      inputValidator: (value) => {
        if (!value) {
          return "Anda perlu memasukkan URL!";
        }
      },
    }).then((result) => {
      // Jika pengguna menekan "Set Link" dan memasukkan URL
      if (result.isConfirmed && result.value) {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: result.value })
          .run();
      }
    });
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-menubar">
      {/* Tombol-tombol toolbar tetap sama */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "is-active" : ""}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "is-active" : ""}
      >
        Strike
      </button>

      {/* Tombol Set Link sekarang memanggil SweetAlert2 */}
      <button
        type="button"
        onClick={setLink}
        className={editor.isActive("link") ? "is-active" : ""}
      >
        Set Link
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
      >
        Unset Link
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive("paragraph") ? "is-active" : ""}
      >
        Paragraph
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "is-active" : ""}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "is-active" : ""}
      >
        Ordered List
      </button>
    </div>
  );
};

// Komponen Utama Editor
const TipTapEditor = ({ content, onContentChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        autolink: true,
        openOnClick: false,
        linkOnPaste: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-prose",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="tiptap-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
