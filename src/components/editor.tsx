"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Code,
    Quote
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-950/50 border-b border-zinc-800 rounded-t-lg">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-zinc-800' : ''}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-zinc-800' : ''}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-4 bg-zinc-800" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-zinc-800' : ''}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-zinc-800' : ''}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-4 bg-zinc-800" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-zinc-800' : ''}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-zinc-800' : ''}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-4 bg-zinc-800" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive('codeBlock') ? 'bg-zinc-800' : ''}
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-zinc-800' : ''}
            >
                <Quote className="h-4 w-4" />
            </Button>
        </div>
    )
}

export const TiptapEditor = ({
    content = '',
    onChange
}: {
    content?: string,
    onChange?: (html: string) => void
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 text-zinc-300',
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
    })

    return (
        <div className="border border-zinc-800 rounded-lg bg-zinc-900/30">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
