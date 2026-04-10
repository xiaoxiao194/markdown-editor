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

  // Iteratively lower quality until under threshold
  let quality = 0.85
  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  let blob = await canvas.convertToBlob({ type: outputType, quality })

  while (blob.size > COMPRESS_THRESHOLD && quality > 0.3) {
    quality -= 0.1
    blob = await canvas.convertToBlob({ type: 'image/jpeg', quality })
  }

  // If still too large, scale down
  if (blob.size > COMPRESS_THRESHOLD) {
    const scale = Math.sqrt(COMPRESS_THRESHOLD / blob.size)
    const newW = Math.round(width * scale)
    const newH = Math.round(height * scale)
    const smallCanvas = new OffscreenCanvas(newW, newH)
    const sCtx = smallCanvas.getContext('2d')
    sCtx.drawImage(canvas, 0, 0, newW, newH)
    blob = await smallCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 })
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
