/**
 * 将预览区域的富文本复制到剪贴板（保留内联样式，可粘贴到微信等平台）
 */
export async function copyRichText(container) {
  const clone = container.cloneNode(true)
  inlineComputedStyles(container, clone)
  return writeToClipboard(clone.outerHTML, container)
}

/**
 * 知乎专用复制 — 复制干净的语义HTML（无class/无inline style）
 * 知乎编辑器会保留语义标签（h1-h4, strong, em, blockquote, ul, ol, a, code, pre, img, table等）
 * 并自动套用知乎自己的样式
 * 注意：需要在知乎的富文本模式（非Markdown模式）下粘贴
 */
export async function copyForZhihu(container) {
  const clone = container.cloneNode(true)
  cleanForZhihu(clone)
  return writeToClipboard(clone.outerHTML, container)
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

/**
 * 清理知乎不兼容的元素/属性
 */
function cleanForZhihu(root) {
  root.querySelectorAll('*').forEach((el) => {
    // 移除所有 class 和 style（知乎用自己的样式）
    el.removeAttribute('class')
    el.removeAttribute('style')
    // 移除 data-* 属性
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-')) el.removeAttribute(attr.name)
    })
  })

  root.querySelectorAll('img').forEach((img) => {
    img.removeAttribute('srcset')
    img.removeAttribute('loading')
  })
}
