import { useEffect } from 'react'
import { uploadAndInsertImage } from '../utils/uploadImage.js'
import { readTextFile } from '../utils/file.js'

export default function Editor({ value, onChange, onScroll, editorRef, textareaRef, onUploadStatus }) {
  useEffect(() => {
    if (editorRef) editorRef.current = textareaRef.current
  }, [editorRef, textareaRef])

  const uploadAndInsert = (file) =>
    uploadAndInsertImage(file, textareaRef.current, onChange, onUploadStatus)

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)

    const mdFile = files.find((f) => f.name.endsWith('.md'))
    if (mdFile) {
      readTextFile(mdFile, onChange)
      return
    }

    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    imageFiles.forEach((f) => uploadAndInsert(f))
  }

  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter((item) => item.type.startsWith('image/'))

    // If clipboard has image files (e.g. screenshot), upload them
    if (imageItems.length > 0) {
      e.preventDefault()
      imageItems.forEach((item) => {
        const file = item.getAsFile()
        if (file) uploadAndInsert(file)
      })
      return
    }

    // If clipboard has a text URL that looks like an image, insert as markdown image
    const text = e.clipboardData.getData('text/plain')?.trim()
    if (text && /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg|bmp|ico)(\?[^\s]*)?$/i.test(text)) {
      e.preventDefault()
      const ta = textareaRef.current
      if (ta) {
        ta.focus()
        document.execCommand('insertText', false, `![image](${text})`)
      }
    }
  }

  return (
    <div className="flex flex-col h-full" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <textarea
        ref={textareaRef}
        className="editor-textarea flex-1 w-full p-4 text-sm resize-none outline-none bg-white text-[#1f2328] leading-relaxed"
        placeholder="在这里输入 Markdown 内容，或拖拽 .md 文件到此处..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        onScroll={onScroll}
        spellCheck={false}
      />
    </div>
  )
}
