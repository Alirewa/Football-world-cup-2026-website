'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { cn } from '@/lib/utils'
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react'

interface TipTapEditorProps {
  content:    string
  onChange:   (html: string) => void
  placeholder?: string
  className?:   string
}

export function TipTapEditor({ content, onChange, className }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none min-h-[120px] px-4 py-3 focus:outline-none',
      },
    },
  })

  if (!editor) return null

  const tools = [
    { icon: Bold,        action: () => editor.chain().focus().toggleBold().run(),        active: () => editor.isActive('bold') },
    { icon: Italic,      action: () => editor.chain().focus().toggleItalic().run(),      active: () => editor.isActive('italic') },
    { icon: List,        action: () => editor.chain().focus().toggleBulletList().run(),  active: () => editor.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: () => editor.isActive('orderedList') },
  ]

  return (
    <div className={cn('glass rounded-xl border border-border overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border px-2 py-1.5">
        {tools.map(({ icon: Icon, action, active }, i) => (
          <button
            key={i}
            type="button"
            onMouseDown={e => { e.preventDefault(); action() }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              active() ? 'bg-[#0E7A43]/20 text-[#0E7A43]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
        <div className="mx-1.5 h-4 w-px bg-border" />
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); editor.chain().focus().undo().run() }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <Undo className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); editor.chain().focus().redo().run() }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <Redo className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
