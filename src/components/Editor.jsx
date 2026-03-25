import { useEffect } from 'react'

export default function Editor({ value, onChange, onInsertImage, onScroll, editorRef, textareaRef }) {
  useEffect(() => {
    if (editorRef) editorRef.current = textareaRef.current
  }, [editorRef, textareaRef])

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)

    const mdFile = files.find((f) => f.name.endsWith('.md'))
    if (mdFile) {
      readTextFile(mdFile, onChange)
      return
    }

    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    imageFiles.forEach((f) => convertAndInsert(f, textareaRef.current, onInsertImage))
  }

  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find((item) => item.type.startsWith('image/'))
    if (!imageItem) return

    e.preventDefault()
    const file = imageItem.getAsFile()
    convertAndInsert(file, textareaRef.current, onInsertImage)
  }

  return (
    <div className="flex flex-col h-full" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <textarea
        ref={textareaRef}
        className="editor-textarea flex-1 w-full px-8 py-6 pb-20 text-[15px] resize-none outline-none bg-white text-[#111c2d]/90 leading-relaxed font-mono"
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

function readTextFile(file, callback) {
  const reader = new FileReader()
  reader.onload = (e) => callback(e.target.result)
  reader.readAsText(file)
}

function convertAndInsert(file, textarea, onInsertImage) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result
    const name = file.name.replace(/\.[^.]+$/, '') || 'image'
    const snippet = onInsertImage(base64, name)

    textarea.focus()
    // eslint-disable-next-line no-restricted-globals
    document.execCommand('insertText', false, `\n${snippet}\n`)
  }
  reader.readAsDataURL(file)
}
