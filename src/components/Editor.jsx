import { useEffect, useRef } from 'react'
import { uploadImage, fileToBase64 } from '../utils/uploadImage.js'

export default function Editor({ value, onChange, onScroll, editorRef, textareaRef, onUploadStatus }) {
  const uploadIdRef = useRef(0)

  useEffect(() => {
    if (editorRef) editorRef.current = textareaRef.current
  }, [editorRef, textareaRef])

  /**
   * Insert a placeholder at cursor, upload the file, then replace with real URL.
   */
  const uploadAndInsert = async (file) => {
    const ta = textareaRef.current
    if (!ta) return

    uploadIdRef.current += 1
    const id = uploadIdRef.current
    const placeholder = `![上传中...(${id})]()`

    // Insert placeholder at cursor
    ta.focus()
    document.execCommand('insertText', false, `\n${placeholder}\n`)

    try {
      onUploadStatus?.('uploading')
      const url = await uploadImage(file)
      const name = file.name.replace(/\.[^.]+$/, '') || 'image'
      const realSnippet = `![${name}](${url})`

      // Replace placeholder in current value
      onChange((prev) => prev.replace(placeholder, realSnippet))
      onUploadStatus?.('success')
    } catch (err) {
      // Fallback to base64 inline so the image is not lost
      try {
        const base64 = await fileToBase64(file)
        const name = file.name.replace(/\.[^.]+$/, '') || 'image'
        onChange((prev) => prev.replace(placeholder, `![${name}](${base64})`))
        onUploadStatus?.('error', '上传失败，已使用本地图片')
      } catch {
        onChange((prev) => prev.replace(`\n${placeholder}\n`, ''))
        onUploadStatus?.('error', err.message)
      }
    }
  }

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

function readTextFile(file, callback) {
  const reader = new FileReader()
  reader.onload = (e) => callback(e.target.result)
  reader.readAsText(file)
}
