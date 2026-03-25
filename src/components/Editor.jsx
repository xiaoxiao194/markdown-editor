import { useRef, useEffect } from 'react'
import EditorToolbar from './EditorToolbar.jsx'

export default function Editor({ value, onChange, onInsertImage, onExportMd, wordCount, saveStatus, onScroll, editorRef }) {
  const textareaRef = useRef(null)

  // Sync the external ref to the textarea
  useEffect(() => {
    if (editorRef) editorRef.current = textareaRef.current
  }, [editorRef])

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

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) readTextFile(file, onChange)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col h-full" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      {/* 面板头部 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/60 backdrop-blur-sm border-b border-black/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2 text-[#656d76] text-sm font-medium">
          <span className="text-[#3b82f6]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </span>
          Markdown 编辑器
          <span className={`text-xs text-[#9ca3af] transition-opacity duration-500 ${saveStatus === 'saved' ? 'opacity-100' : 'opacity-0'}`}>
            ✓ 已自动保存
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <span className="text-[#656d76]">{wordCount} 字</span>
          <label className="cursor-pointer px-2 py-1 rounded-md bg-[#3b82f6]/8 text-[#3b82f6] hover:bg-[#3b82f6]/15 transition-colors duration-150 font-medium flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            上传 .md
            <input type="file" accept=".md" className="hidden" onChange={handleFileInput} />
          </label>
          <button
            onClick={onExportMd}
            className="px-2 py-1 rounded-md bg-[#3b82f6]/8 text-[#3b82f6] hover:bg-[#3b82f6]/15 transition-colors duration-150 font-medium flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导出 .md
          </button>
          <span className="text-[#d0d7de]">·</span>
          <span className="text-[#9ca3af]">拖拽/粘贴图片</span>
        </div>
      </div>

      <EditorToolbar textareaRef={textareaRef} onChange={onChange} />

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
