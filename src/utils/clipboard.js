/**
 * 将预览区域的富文本复制到剪贴板（保留内联样式，可粘贴到微信/知乎等平台）
 */
export async function copyRichText(container) {
  // 克隆节点，注入计算后的内联样式
  const clone = container.cloneNode(true)
  inlineComputedStyles(container, clone)

  const html = clone.outerHTML

  try {
    // 优先使用现代 Clipboard API
    const blob = new Blob([html], { type: 'text/html' })
    const item = new ClipboardItem({ 'text/html': blob })
    await navigator.clipboard.write([item])
    return true
  } catch {
    // 降级：使用 execCommand
    return fallbackCopy(container)
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
function inlineComputedStyles(source, target) {
  if (source.nodeType !== Node.ELEMENT_NODE) return

  const computed = window.getComputedStyle(source)
  const important = [
    'font-size', 'font-weight', 'font-family', 'font-style',
    'line-height', 'color', 'background-color',
    'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
    'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
    'border', 'border-radius', 'border-left',
    'text-decoration', 'text-align',
    'display', 'width', 'max-width', 'overflow',
    'word-break', 'word-wrap', 'white-space',
  ]

  let style = ''
  for (const prop of important) {
    const val = computed.getPropertyValue(prop)
    if (val) style += `${prop}:${val};`
  }
  target.setAttribute('style', style)

  const sourceChildren = source.children
  const targetChildren = target.children
  for (let i = 0; i < sourceChildren.length; i++) {
    inlineComputedStyles(sourceChildren[i], targetChildren[i])
  }
}
