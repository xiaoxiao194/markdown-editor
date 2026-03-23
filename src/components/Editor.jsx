import { useRef } from 'react'

export default function Editor({ value, onChange, onInsertImage, wordCount }) {
  const textareaRef = useRef(null)

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
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#f6f8fa] border-b border-[#d0d7de] flex-shrink-0">
        <div className="flex items-center gap-2 text-[#656d76] text-sm font-medium">
          <span className="text-[#3b82f6]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </span>
          Markdown 编辑器
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#656d76]">{wordCount} 字</span>
          <span className="text-[#d0d7de]">·</span>
          <span className="text-[#656d76]">拖拽/粘贴图片</span>
          <label className="cursor-pointer px-2.5 py-1 rounded-md bg-[#3b82f6]/10 text-[#3b82f6] hover:bg-[#3b82f6]/15 transition-colors duration-150 font-medium">
            上传 .md
            <input type="file" accept=".md" className="hidden" onChange={handleFileInput} />
          </label>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        className="editor-textarea flex-1 w-full p-4 text-sm resize-none outline-none bg-white text-[#1f2328] leading-relaxed"
        placeholder="在这里输入 Markdown 内容，或拖拽 .md 文件到此处..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
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

    // execCommand 虽已废弃但仍是 textarea 保留原生撤销栈的唯一可靠方式
    // 现代替代方案 EditContext API 尚未在主流浏览器中普及
    textarea.focus()
    // eslint-disable-next-line no-restricted-globals
    document.execCommand('insertText', false, `\n${snippet}\n`)
  }
  reader.readAsDataURL(file)
}
