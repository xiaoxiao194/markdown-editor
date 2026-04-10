import { AwsClient } from 'aws4fetch'

const ALLOWED_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://md.payforchat.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(body, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS })
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (request.method !== 'POST') {
      return jsonResponse({ success: false, message: '仅支持 POST 请求' }, 405)
    }

    try {
      const formData = await request.formData()
      const file = formData.get('file')

      if (!file || typeof file === 'string') {
        return jsonResponse({ success: false, message: '缺少 file 字段' }, 400)
      }

      // 校验文件类型
      const ext = ALLOWED_TYPES[file.type]
      if (!ext) {
        return jsonResponse({ success: false, message: '仅支持 png/jpg/gif/webp 格式' }, 400)
      }

      // 校验文件大小
      if (file.size > MAX_SIZE) {
        return jsonResponse({ success: false, message: '文件大小不能超过 10MB' }, 400)
      }

      const buffer = await file.arrayBuffer()

      // 计算文件内容 hash 作为文件名（SHA-256 前 32 位 hex，等同 MD5 长度）
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashHex = [...new Uint8Array(hashBuffer)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 32)

      // 生成上传路径: markcopy/year/month/hash.ext
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const key = `markcopy/${year}/${month}/${hashHex}.${ext}`

      // 使用 AWS S3 兼容 API 上传到 R2
      const client = new AwsClient({
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        region: 'auto',
        service: 's3',
      })

      const uploadUrl = `${env.R2_ENDPOINT}/${env.R2_BUCKET}/${key}`
      const uploadResp = await client.fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: buffer,
      })

      if (!uploadResp.ok) {
        const errText = await uploadResp.text()
        return jsonResponse(
          { success: false, message: `R2 上传失败: ${uploadResp.status} ${errText}` },
          502
        )
      }

      const publicUrl = `${env.R2_URL_PREFIX}/${key}`
      return jsonResponse({ success: true, url: publicUrl })
    } catch (err) {
      return jsonResponse({ success: false, message: err.message || '服务器内部错误' }, 500)
    }
  },
}
