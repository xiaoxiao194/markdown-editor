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
  flattenListsForWechat(clone, container)
  await embedImagesAsDataUrls(clone)
  return writeToClipboard(clone.outerHTML, container)
}

/**
 * 把列表整体改写成 <section> 段落块，规避微信粘贴时列表项断行。
 *
 * 根因：微信编辑器的粘贴净化按标签结构处理 <ul>/<ol>/<li>，不看内联 CSS——
 * 会用它自己那套列表排版逻辑把「以行内元素（如加粗引导词）开头」的 <li> 在加粗后断成两行；
 * 而同文档里以加粗开头的 <p> 段落却不受影响。所以只改 <li> 的样式没用（实测无效），
 * 必须让剪贴板里根本不出现 <ul>/<ol>/<li>：每个列表项转成 <section>（微信原生块结构），
 * 符号作为行内文本注入；列表容器转成 <section> 包裹，天然保留嵌套与段间距。
 *
 * 只操作 clone；sourceContainer 用来读主题给 ::before 的计算色/字形，让符号与主题协调。
 */
function flattenListsForWechat(clone, sourceContainer) {
  // 源与克隆的 li 按文档顺序一一对应（含嵌套），用于还原主题符号色/字形
  const sourceLis = sourceContainer.querySelectorAll('li')
  const sourceByClone = new Map()
  clone.querySelectorAll('li').forEach((li, i) => sourceByClone.set(li, sourceLis[i]))

  // 只从最外层列表开始，内层列表由递归处理（避免重复处理）
  Array.from(clone.querySelectorAll('ul, ol'))
    .filter((el) => !el.closest('li'))
    .forEach((list) => convertList(list, 0, sourceByClone))
}

/** 递归把一个 <ul>/<ol> 及其 <li> 改写成一组 <section> 段落块 */
function convertList(list, depth, sourceByClone) {
  const ordered = list.tagName === 'OL'
  const start = ordered ? (parseInt(list.getAttribute('start') || '1', 10) || 1) : 1

  const items = Array.prototype.filter.call(list.children, (c) => c.tagName === 'LI')
  const out = items.map((li, idx) => {
    const marker = resolveMarker(sourceByClone.get(li), ordered, ordered ? `${start + idx}. ` : null)

    const item = document.createElement('section')
    // 保留 li 上已内联的文字相关样式（颜色/行高/字号），再叠加块级与外边距
    item.setAttribute('style', li.getAttribute('style') || '')
    appendStyle(item, 'display:block;list-style:none;margin:0.3em 0;padding-left:0;')

    // 迁移 li 的全部子节点到 item
    while (li.firstChild) item.appendChild(li.firstChild)

    // 递归改写 item 内的嵌套列表（此时它们是 item 的直接子级）
    Array.prototype.filter
      .call(item.children, (c) => c.tagName === 'UL' || c.tagName === 'OL')
      .forEach((sub) => convertList(sub, depth + 1, sourceByClone))

    // 符号注入到真正承载首行文字的容器：松散列表是内层 <p>，否则是 item 本身
    const host = item.firstElementChild && item.firstElementChild.tagName === 'P'
      ? item.firstElementChild
      : item
    const span = document.createElement('span')
    span.setAttribute('style', `color:${marker.color};`)
    span.textContent = marker.text
    host.insertBefore(span, host.firstChild)

    // 悬挂缩进作用在 host（含符号的那一行），随层级增加左缩进
    appendStyle(host, `padding-left:${(1.4 + depth * 1.2).toFixed(2)}em;text-indent:-1.4em;`)

    return item
  })

  // 直接用各项 <section> 替换整个列表，不再套外层 wrapper——
  // 外层块会被微信当作独立段落在列表前后加段间距，正是「前后多出空白」的来源。
  list.replaceWith(...out)
}

/** 决定某个列表项的符号字形与颜色（尽量忠实于源主题的 ::before 呈现） */
function resolveMarker(sourceLi, ordered, orderedText) {
  if (ordered) {
    // 序号自行生成，但颜色尽量沿用主题给 ::before 计数器设定的色（如微信系主题的主色）
    let color = pickTextColor(sourceLi)
    if (sourceLi) {
      try {
        const c = window.getComputedStyle(sourceLi, '::before').getPropertyValue('color')
        if (isVisibleColor(c)) color = c
      } catch { /* 读取失败：用正文色 */ }
    }
    return { text: orderedText, color }
  }
  if (sourceLi) {
    try {
      const before = window.getComputedStyle(sourceLi, '::before')
      const glyph = parsePseudoGlyph(before.getPropertyValue('content'))
      if (glyph) {
        const c = before.getPropertyValue('color')
        return { text: glyph, color: isVisibleColor(c) ? c : pickTextColor(sourceLi) }
      }
      // 用背景色画的圆点（如微信系主题）：符号用 •，颜色取该背景色
      const bg = before.getPropertyValue('background-color')
      if (isVisibleColor(bg)) return { text: '• ', color: bg }
    } catch { /* 伪元素读取失败：回退到默认圆点 */ }
  }
  return { text: '• ', color: pickTextColor(sourceLi) }
}

/** 把 ::before 的 content 计算值解析成可用的符号字形；counter()/空/none 返回 null */
function parsePseudoGlyph(content) {
  if (!content || content === 'none' || content === 'normal') return null
  if (content.includes('counter(') || content.includes('attr(')) return null
  const m = content.match(/^["'](.*)["']$/s)
  if (!m) return null
  const text = m[1]
  if (!text.trim()) return null
  return /\s$/.test(text) ? text : text + ' '
}

function pickTextColor(sourceLi) {
  if (sourceLi) {
    const c = window.getComputedStyle(sourceLi).color
    if (isVisibleColor(c)) return c
  }
  return 'inherit'
}

function isVisibleColor(color) {
  if (!color || color === 'transparent') return false
  const m = color.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const parts = m[1].split(',').map((s) => parseFloat(s.trim()))
    if (parts.length >= 4 && parts[3] === 0) return false
  }
  return true
}

function appendStyle(el, css) {
  const existing = el.getAttribute('style') || ''
  const sep = existing && !existing.trim().endsWith(';') ? ';' : ''
  el.setAttribute('style', existing + sep + css)
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
