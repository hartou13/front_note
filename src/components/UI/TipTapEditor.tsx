'use client';

import CodeBlock from '@tiptap/extension-code-block';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    CheckSquare,
    Code,
    Code2,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo,
} from 'lucide-react';
import { useEffect } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/30" onClick={(e) => e.stopPropagation()}>
      {/* Texte */}
      <div className="flex items-center gap-1 border-r border-border pr-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleBold().run();
          }}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('bold') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Gras"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleItalic().run();
          }}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('italic') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Italique"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleUnderline().run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('underline') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Souligné"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleStrike().run();
          }}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('strike') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Barré"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleHighlight().run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('highlight') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Surligné"
        >
          <Highlighter className="w-4 h-4" />
        </button>
      </div>

      {/* Titres */}
      <div className="flex items-center gap-1 border-r border-border pr-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Titre 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Titre 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Titre 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      {/* Listes */}
      <div className="flex items-center gap-1 border-r border-border pr-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Liste numérotée"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleTaskList().run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('taskList') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Liste de tâches"
        >
          <CheckSquare className="w-4 h-4" />
        </button>
      </div>

      {/* Alignement */}
      <div className="flex items-center gap-1 border-r border-border pr-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().setTextAlign('left').run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Aligner à gauche"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().setTextAlign('center').run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Centrer"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().setTextAlign('right').run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Aligner à droite"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().setTextAlign('justify').run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Justifier"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      {/* Code et citations */}
      <div className="flex items-center gap-1 border-r border-border pr-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleCode().run();
          }}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('code') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Code en ligne"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleCodeBlock().run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('codeBlock') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Bloc de code"
        >
          <Code2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().toggleBlockquote().run();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('blockquote') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Citation"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            addLink();
          }}
          className={`p-2 rounded hover:bg-accent transition-colors ${
            editor.isActive('link') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          title="Ajouter un lien"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Annuler/Rétablir */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().undo().run();
          }}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-accent transition-colors text-muted-foreground disabled:opacity-50"
          title="Annuler"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editor.chain().focus().redo().run();
          }}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-accent transition-colors text-muted-foreground disabled:opacity-50"
          title="Rétablir"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const TipTapEditor = ({ content, onChange, placeholder = "Écrivez le contenu de votre note...", readOnly = false, className = "" }: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-lg font-mono text-sm',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Forcer la mise à jour du contenu quand la prop content change
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={`border border-input rounded-lg bg-background ${className}`} onClick={(e) => e.stopPropagation()}>
      {!readOnly && <MenuBar editor={editor} />}
      <EditorContent 
        editor={editor} 
        className={`prose prose-sm max-w-none p-4 min-h-[200px] ${
          readOnly ? 'cursor-default' : ''
        }`}
      />
    </div>
  );
}; 