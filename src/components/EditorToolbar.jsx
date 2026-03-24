const insertions = {
  bold:      { before: '**', after: '**', placeholder: '粗体文本' },
  italic:    { before: '*', after: '*', placeholder: '斜体文本' },
  h1:        { before: '# ', after: '', placeholder: '一级标题', lineStart: true },
  h2:        { before: '## ', after: '', placeholder: '二级标题', lineStart: true },
  h3:        { before: '### ', after: '', placeholder: '三级标题', lineStart: true },
  ul:        { before: '- ', after: '', placeholder: '列表项', lineStart: true },
  ol:        { before: '1. ', after: '', placeholder: '列表项', lineStart: true },
  link:      { before: '[', after: '](url)', placeholder: '链接文本' },
  image:     { before: '![', after: '](url)', placeholder: '图片描述' },
  code:      { before: '`', after: '`', placeholder: '代码' },
  codeblock: { before: '```\n', after: '\n```', placeholder: '代码块', lineStart: true },
  quote:     { before: '> ', after: '', placeholder: '引用文本', lineStart: true },
  hr:        { before: '\n---\n', after: '', placeholder: '', lineStart: true },
}

const buttons = [
  [
    { type: 'bold', label: 'B', title: '加粗', style: 'font-bold' },
    { type: 'italic', label: 'I', title: '斜体', style: 'italic' },
  ],
  [
    { type: 'h1', label: 'H1', title: '一级标题', style: 'text-[10px] font-bold' },
    { type: 'h2', label: 'H2', title: '二级标题', style: 'text-[10px] font-bold' },
    { type: 'h3', label: 'H3', title: '三级标题', style: 'text-[10px] font-bold' },
  ],
  [
    { type: 'ul', title: '无序列表', icon: 'ul' },
    { type: 'ol', title: '有序列表', icon: 'ol' },
  ],
  [
    { type: 'link', title: '链接', icon: 'link' },
    { type: 'image', title: '图片', icon: 'image' },
  ],
  [
    { type: 'code', title: '行内代码', icon: 'code' },
    { type: 'codeblock', title: '代码块', icon: 'codeblock' },
  ],
  [
    { type: 'quote', title: '引用', icon: 'quote' },
    { type: 'hr', title: '分割线', icon: 'hr' },
  ],
]

const icons = {
  ul: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>
    </svg>
  ),
  ol: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
      <text x="2" y="8" fontSize="8" fill="currentColor" stroke="none" fontFamily="monospace">1</text>
      <text x="2" y="14" fontSize="8" fill="currentColor" stroke="none" fontFamily="monospace">2</text>
      <text x="2" y="20" fontSize="8" fill="currentColor" stroke="none" fontFamily="monospace">3</text>
    </svg>
  ),
  link: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  image: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  code: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  codeblock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <polyline points="14 15 18 12 14 9"/><polyline points="10 9 6 12 10 15"/>
    </svg>
  ),
  quote: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
    </svg>
  ),
  hr: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
    </svg>
  ),
}

export function insertMarkdown(textarea, type, onChange) {
  const config = insertions[type]
  if (!config || !textarea) return

  textarea.focus()
  const { selectionStart, selectionEnd, value } = textarea
  const selectedText = value.substring(selectionStart, selectionEnd)

  let textToInsert
  if (config.lineStart) {
    // For line-start insertions, add newline prefix if not at start of line
    const beforeCursor = value.substring(0, selectionStart)
    const needsNewline = beforeCursor.length > 0 && !beforeCursor.endsWith('\n')
    const prefix = needsNewline ? '\n' : ''
    const content = selectedText || config.placeholder
    textToInsert = `${prefix}${config.before}${content}${config.after}`
  } else {
    const content = selectedText || config.placeholder
    textToInsert = `${config.before}${content}${config.after}`
  }

  // Use execCommand to preserve undo stack
  document.execCommand('insertText', false, textToInsert)

  // Position cursor: select the placeholder text for easy replacement
  if (!selectedText && config.placeholder) {
    const cursorStart = selectionStart + textToInsert.indexOf(config.placeholder)
    const cursorEnd = cursorStart + config.placeholder.length
    requestAnimationFrame(() => {
      textarea.setSelectionRange(cursorStart, cursorEnd)
    })
  }
}

export default function EditorToolbar({ textareaRef, onChange }) {
  const handleClick = (type) => {
    insertMarkdown(textareaRef.current, type, onChange)
  }

  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 bg-[#f6f8fa] border-b border-[#d0d7de] flex-shrink-0 overflow-x-auto">
      {buttons.map((group, gi) => (
        <div key={gi} className="flex items-center">
          {gi > 0 && <div className="w-px h-4 bg-[#d0d7de] mx-1.5" />}
          {group.map((btn) => (
            <button
              key={btn.type}
              type="button"
              title={btn.title}
              onClick={() => handleClick(btn.type)}
              className="w-7 h-7 flex items-center justify-center rounded text-[#656d76] hover:text-[#1f2328] hover:bg-[#e1e4e8] transition-colors duration-100"
            >
              {btn.icon ? icons[btn.icon] : <span className={`text-xs ${btn.style || ''}`}>{btn.label}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
