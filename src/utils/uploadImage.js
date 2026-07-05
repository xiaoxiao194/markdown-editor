const UPLOAD_URL = 'https://upload.payforchat.com'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const COMPRESS_THRESHOLD = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

/**
 * Compress an image file using canvas.
 * Returns the original file if it's already small enough or is a gif.
 */
async function compressImage(file) {
  if (file.size <= COMPRESS_THRESHOLD) return file
  // GIF cannot be reliably compressed via canvas (loses animation)
  if (file.type === 'image/gif') return file

  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  // PNG/WebP may carry an alpha channel — compress to WebP (keeps transparency).
  // JPEG has no alpha, so re-encoding to JPEG is safe and better supported.
  const outputType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp'

  // Iteratively lower quality until under threshold
  let quality = 0.85
  let blob = await canvas.convertToBlob({ type: outputType, quality })

  while (blob.size > COMPRESS_THRESHOLD && quality > 0.3) {
    quality -= 0.1
    blob = await canvas.convertToBlob({ type: outputType, quality })
  }

  // If still too large, scale down
  if (blob.size > COMPRESS_THRESHOLD) {
    const scale = Math.sqrt(COMPRESS_THRESHOLD / blob.size)
    const newW = Math.round(width * scale)
    const newH = Math.round(height * scale)
    const smallCanvas = new OffscreenCanvas(newW, newH)
    const sCtx = smallCanvas.getContext('2d')
    sCtx.drawImage(canvas, 0, 0, newW, newH)
    blob = await smallCanvas.convertToBlob({ type: outputType, quality: 0.8 })
  }

  return new File([blob], file.name, { type: blob.type })
}

/**
 * Upload a single image file to the R2 image hosting service.
 * Returns the public URL on success.
 */
/**
 * Convert a File/Blob to a base64 data URL.
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

/**
 * Upload a single image file to the R2 image hosting service.
 * Returns the public URL on success.
 */
export async function uploadImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('仅支持 png/jpg/gif/webp 格式')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('图片太大，最大支持 10MB')
  }

  const compressed = await compressImage(file)

  const formData = new FormData()
  formData.append('file', compressed)

  const resp = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  })

  const data = await resp.json()

  if (!data.success) {
    throw new Error(data.message || '上传失败')
  }

  return data.url
}

let uploadSeq = 0

/**
 * Insert a placeholder at the textarea cursor, upload the file, then replace
 * the placeholder with the real URL (or base64 fallback if upload fails).
 * Shared by Editor paste/drop and the toolbar image button.
 *
 * onStatus(status, message): status is 'uploading' | 'success' | 'error'.
 */
export async function uploadAndInsertImage(file, textarea, onChange, onStatus) {
  if (!textarea) return

  uploadSeq += 1
  const placeholder = `![上传中...(${uploadSeq})]()`

  // Insert placeholder at cursor (execCommand preserves the undo stack)
  textarea.focus()
  document.execCommand('insertText', false, `\n${placeholder}\n`)

  const name = file.name.replace(/\.[^.]+$/, '') || 'image'
  try {
    onStatus?.('uploading')
    const url = await uploadImage(file)
    onChange((prev) => prev.replace(placeholder, `![${name}](${url})`))
    onStatus?.('success')
  } catch (err) {
    // Fallback to base64 inline so the image is not lost in the editor.
    // Copy-to-WeChat embeds all images as base64 anyway, so pasting still works;
    // the downside is a bloated document/draft, hence the re-upload suggestion.
    try {
      const base64 = await fileToBase64(file)
      onChange((prev) => prev.replace(placeholder, `![${name}](${base64})`))
      onStatus?.('error', '上传失败，图片已内嵌到文档（体积较大，建议网络恢复后删除重传）')
    } catch {
      onChange((prev) => prev.replace(`\n${placeholder}\n`, ''))
      onStatus?.('error', err.message)
    }
  }
}
