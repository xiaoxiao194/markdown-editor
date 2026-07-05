/**
 * 将预览区域的富文本复制到剪贴板（保留内联样式，可粘贴到微信等平台）
 *
 * 图片处理：外链图片在复制时取回并转成 base64 内嵌进剪贴板。
 * 微信编辑器的图片转存由腾讯服务器抓取外链，腾讯机房到 Cloudflare 的链路
 * 不稳定会导致「图片载入失败」；内嵌后微信直接从剪贴板拿图片数据上传素材库，
 * 不再依赖任何外部抓取。取回失败的图片保留原外链（不比现状更差）。
 */
export async function copyRichText(container) {
  const clone = container.cloneNode(true)
  inlineComputedStyles(container, clone)
  await embedImagesAsDataUrls(clone)
  return writeToClipboard(clone.outerHTML, container)
}

/**
 * 将 root 内所有 http(s) 外链 <img> 取回并替换为 base64 data URL。
 * - data: URL 跳过（已内嵌）
 * - 单图取回失败时保留原外链，不阻断整体复制
 */
async function embedImagesAsDataUrls(root) {
  const imgs = Array.from(root.querySelectorAll('img[src^="http"]'))
  await Promise.all(imgs.map(async (img) => {
    try {
      const resp = await fetchImageForEmbed(img.src)
      if (!resp.ok) return
      const blob = await resp.blob()
      if (!blob.type.startsWith('image/')) return
      img.src = await blobToDataUrl(blob)
    } catch {
      // CORS 未配置或网络失败：保留外链，由微信尝试转存
    }
  }))
}

/**
 * 取回图片用于内嵌。预览 <img> 的加载不带 Origin，浏览器/CDN 可能缓存了
 * 不含 CORS 头的副本，导致这里的跨域 fetch 命中脏缓存而失败；
 * 失败后追加查询参数换一个缓存键重试，绕开浏览器与边缘节点的全部缓存。
 */
async function fetchImageForEmbed(src) {
  try {
    const resp = await fetchWithTimeout(src, 15000)
    if (resp.ok) return resp
  } catch { /* fall through to cache-busted retry */ }
  const retryUrl = src + (src.includes('?') ? '&' : '?') + '_cors=1'
  return fetchWithTimeout(retryUrl, 15000)
}

function fetchWithTimeout(url, ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal, mode: 'cors' })
    .finally(() => clearTimeout(timer))
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('图片编码失败'))
    reader.readAsDataURL(blob)
  })
}

/**
 * 知乎专用复制 — 从 Markdown 原文生成干净语义 HTML
 * 绕过主题渲染的包装div，直接输出 h1/h2/p/strong/blockquote 等语义标签
 * 知乎富文本编辑器会自动套用自己的样式
 */
export async function copyForZhihu(container, renderCleanHtml) {
  const holder = document.createElement('div')
  holder.innerHTML = renderCleanHtml()
  await embedImagesAsDataUrls(holder)
  try {
    const blob = new Blob([holder.innerHTML], { type: 'text/html' })
    const item = new ClipboardItem({ 'text/html': blob })
    await navigator.clipboard.write([item])
    return true
  } catch {
    return fallbackCopy(container)
  }
}

async function writeToClipboard(html, fallbackContainer) {
  try {
    const blob = new Blob([html], { type: 'text/html' })
    const item = new ClipboardItem({ 'text/html': blob })
    await navigator.clipboard.write([item])
    return true
  } catch {
    return fallbackCopy(fallbackContainer)
  }
}

function fallbackCopy(container) {
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(container)
  selection.removeAllRanges()
  selection.addRange(range)
  const ok = document.execCommand('copy')
  selection.removeAllRanges()
  return ok
}

/**
 * 递归将 source 元素的计算样式写入 target 元素的 style 属性
 */
function inlineComputedStyles(source, target, aggressive = false) {
  if (source.nodeType !== Node.ELEMENT_NODE) return

  const computed = window.getComputedStyle(source)
  const props = [
    'font-size', 'font-weight', 'font-family', 'font-style',
    'line-height', 'color', 'background-color',
    'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
    'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
    'border', 'border-radius', 'border-left',
    'text-decoration', 'text-align',
    'display', 'width', 'max-width', 'overflow',
    'word-break', 'word-wrap', 'white-space',
  ]

  // 知乎需要额外内联的属性
  if (aggressive) {
    props.push(
      'list-style-type', 'list-style',
      'text-indent', 'letter-spacing',
      'border-bottom', 'border-top', 'border-right',
      'background', 'box-sizing',
    )
  }

  let style = ''
  for (const prop of props) {
    const val = computed.getPropertyValue(prop)
    if (val) style += `${prop}:${val};`
  }
  target.setAttribute('style', style)

  const sourceChildren = source.children
  const targetChildren = target.children
  for (let i = 0; i < sourceChildren.length; i++) {
    inlineComputedStyles(sourceChildren[i], targetChildren[i], aggressive)
  }
}
