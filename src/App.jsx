import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import Editor from './components/Editor.jsx'
import Preview from './components/Preview.jsx'
import Toolbar from './components/Toolbar.jsx'
import ThemeLab from './components/ThemeLab.jsx'
import { parseMarkdown } from './utils/markdown.js'
import { copyRichText } from './utils/clipboard.js'
import { builtInThemes, createCustomWechatTheme, DEFAULT_WECHAT_TOKENS } from './themes/index.js'

const DEFAULT_MD = `# 欢迎使用 Markdown 预览器

这是一个支持**一键复制**富文本的 Markdown 预览工具，粘贴到微信公众号、知乎等平台后可保留完整格式。

## 功能特性

- 实时预览 Markdown 渲染效果
- 支持多种主题风格切换
- 一键复制为富文本，粘贴即用
- 支持拖拽或上传 \`.md\` 文件

## 代码示例

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`)
}
hello('世界')
\`\`\`

## 引用块

> 简单而强大的 Markdown 工具，让内容发布更轻松。

## 表格

| 平台 | 是否支持富文本粘贴 |
|------|--------------|
| 微信公众号 | ✅ |
| 知乎 | ✅ |
| 掘金 | ✅ |
`

const CUSTOM_THEME_STORAGE_KEY = 'markcopy.customThemes'
const cloneTokens = (tokens) => JSON.parse(JSON.stringify(tokens))
const createEmptyLabState = () => ({
  open: false,
  name: '自定义主题',
  tokens: cloneTokens(DEFAULT_WECHAT_TOKENS),
  editingId: null,
  baseName: '微信风格',
  baseTokens: cloneTokens(DEFAULT_WECHAT_TOKENS),
})

const loadStoredThemes = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CUSTOM_THEME_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => item?.id && item?.tokens)
  } catch {
    return []
  }
}

export default function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MD)
  const [theme, setTheme] = useState('wechat')
  const [publishDate] = useState(() => new Date())
  const previewRef = useRef(null)
  const [customThemes, setCustomThemes] = useState(() => loadStoredThemes())
  const [themeLab, setThemeLab] = useState(createEmptyLabState)

  const imageStoreRef = useRef(new Map()) // img-1 → base64
  const imageCountRef = useRef(0)

  const handleInsertImage = useCallback((base64, name) => {
    imageCountRef.current += 1
    const id = `img-${imageCountRef.current}`
    imageStoreRef.current.set(id, base64)
    return `![${name}](${id})`
  }, [])

  const meta = useMemo(() => {
    const plain = markdown
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/!\[[^\]]*]\([^)]+\)/g, '')
      .replace(/\[[^\]]*]\([^)]+\)/g, '')
      .replace(/[#>*_`-]/g, '')
      .replace(/\s+/g, '')
    const titleMatch = markdown.match(/^#\s+(.+)/m)
    const title = titleMatch ? titleMatch[1].trim() : '未命名文章'
    const wordCount = plain.length || markdown.length
    const readMinutes = Math.max(1, Math.round(wordCount / 420))
    return { title, wordCount, readMinutes, publishDate }
  }, [markdown, publishDate])

  const html = parseMarkdown(markdown, imageStoreRef.current)

  const customThemeMap = useMemo(() => {
    const merged = {}
    for (const item of customThemes) {
      merged[item.id] = createCustomWechatTheme(item)
    }
    return merged
  }, [customThemes])

  const builtInEntries = useMemo(() => Object.entries(builtInThemes), [])
  const customEntries = useMemo(() => Object.entries(customThemeMap), [customThemeMap])
  const themeEntries = useMemo(() => [...builtInEntries, ...customEntries], [builtInEntries, customEntries])
  const themeOptions = useMemo(() => Object.fromEntries(themeEntries), [themeEntries])

  useEffect(() => {
    if (!themeOptions[theme]) {
      setTheme('wechat')
    }
  }, [themeOptions, theme])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customThemes))
  }, [customThemes])

  const activeThemeConfig = themeOptions[theme] ?? builtInThemes.wechat
  const labPreviewTheme = useMemo(() => {
    if (!themeLab.open) return null
    return createCustomWechatTheme({
      id: themeLab.editingId || '__lab_preview',
      name: themeLab.name || '自定义主题',
      tokens: themeLab.tokens,
    })
  }, [themeLab])
  const previewThemeConfig = labPreviewTheme ?? activeThemeConfig

  const handleCopy = useCallback(async () => {
    const container = previewRef.current?.querySelector('.preview-body')
    if (!container) return false
    return await copyRichText(container)
  }, [])

  const handleOpenThemeLab = () => {
    const base = themeOptions[theme] ?? builtInThemes.wechat
    const baseTokens = base?.tokens ? cloneTokens(base.tokens) : cloneTokens(DEFAULT_WECHAT_TOKENS)
    setThemeLab({
      open: true,
      name: base?.isCustom ? base.name : `${base?.name || '自定义主题'} · 变体`,
      tokens: baseTokens,
      editingId: base?.isCustom ? base.id : null,
      baseName: base?.name || '微信风格',
      baseTokens,
    })
  }

  const handleLabClose = () => {
    setThemeLab((prev) => ({ ...prev, open: false }))
  }

  const handleLabSave = () => {
    const targetId = themeLab.editingId || `custom-${Date.now()}`
    const entry = {
      id: targetId,
      name: (themeLab.name || '未命名主题').trim(),
      tokens: themeLab.tokens,
    }
    setCustomThemes((prev) => {
      const filtered = prev.filter((item) => item.id !== targetId)
      return [...filtered, entry]
    })
    setTheme(targetId)
    setThemeLab(createEmptyLabState())
  }

  const handleLabReset = () => {
    setThemeLab((prev) => ({
      ...prev,
      tokens: cloneTokens(prev.baseTokens || DEFAULT_WECHAT_TOKENS),
    }))
  }

  const handleLabDelete = () => {
    if (!themeLab.editingId) return
    setCustomThemes((prev) => prev.filter((item) => item.id !== themeLab.editingId))
    setTheme('wechat')
    setThemeLab(createEmptyLabState())
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] px-4 md:px-10 lg:px-16 xl:px-24 py-8">
      <div className="relative flex flex-col h-full w-full max-w-[1560px] mx-auto rounded-[36px] bg-white border border-[#d0d7de] shadow-[0_45px_120px_rgba(31,35,40,0.08)] overflow-hidden px-6 sm:px-10">
        {/* 顶部微光氛围 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-12 top-0 h-32 bg-gradient-to-br from-[#3b82f6]/8 to-transparent blur-3xl opacity-50" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/60 to-transparent" />
        </div>

        <header className="relative px-8 py-5 bg-transparent border-b border-[#d0d7de] flex-shrink-0">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#3b82f6] to-[#7c3aed]" />

          <div className="relative flex items-center justify-between">
            {/* Logo 区 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="13" x2="9" y2="17"/>
                  <line x1="9" y1="13" x2="12" y2="10"/>
                  <line x1="9" y1="17" x2="12" y2="20"/>
                  <line x1="15" y1="13" x2="15" y2="17"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[20px] font-bold tracking-tight leading-tight text-[#1f2328]">MarkCopy</h1>
                  <span className="text-xs text-[#3b82f6] font-semibold px-2 py-0.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/25">公众号特调</span>
                </div>
                <p className="text-xs text-[#656d76] leading-tight">Markdown 一键润色，粘贴即刻成文</p>
              </div>
            </div>

            {/* 平台徽章 */}
            <div className="hidden sm:flex gap-2 text-xs">
              <span className="px-3 py-1 bg-[#3b82f6]/10 rounded-full border border-[#3b82f6]/30 text-[#3b82f6] font-semibold">微信公众号</span>
              <span className="px-3 py-1 bg-[#f6f8fa] rounded-full border border-[#d0d7de] text-[#656d76]">知乎</span>
              <span className="px-3 py-1 bg-[#f6f8fa] rounded-full border border-[#d0d7de] text-[#656d76]">掘金</span>
            </div>
          </div>
        </header>

        <Toolbar
          theme={theme}
          themeEntries={themeEntries}
          onThemeChange={setTheme}
          onCopy={handleCopy}
          onOpenThemeLab={handleOpenThemeLab}
        />

        <div className="relative flex flex-col md:flex-row flex-1 overflow-hidden py-8 gap-8">
          <div className="flex flex-col flex-1 md:basis-1/2 min-h-[300px] bg-white border border-[#d0d7de] rounded-2xl shadow-[0_18px_45px_rgba(31,35,40,0.06)] overflow-hidden">
            <Editor value={markdown} onChange={setMarkdown} onInsertImage={handleInsertImage} wordCount={meta.wordCount} />
          </div>
          <div className="flex flex-col flex-1 md:basis-1/2 min-h-[300px] bg-white border border-[#d0d7de] rounded-2xl shadow-[0_20px_55px_rgba(31,35,40,0.06)] overflow-hidden" ref={previewRef}>
            <Preview html={html} themeConfig={previewThemeConfig} meta={meta} labPreviewName={themeLab.open ? themeLab.name : ''} />
          </div>
        </div>

        {/* Footer */}
        <footer className="relative px-8 py-3 border-t border-[#d0d7de] flex items-center justify-between text-xs text-[#656d76] flex-shrink-0">
          <span>MarkCopy v1.0</span>
          <span>Markdown 一键排版工具</span>
        </footer>
      </div>

      <ThemeLab
        open={themeLab.open}
        name={themeLab.name}
        tokens={themeLab.tokens}
        baseName={themeLab.baseName}
        isEditing={Boolean(themeLab.editingId)}
        onNameChange={(value) => setThemeLab((prev) => ({ ...prev, name: value }))}
        onTokensChange={(nextTokens) => setThemeLab((prev) => ({ ...prev, tokens: nextTokens }))}
        onClose={handleLabClose}
        onSave={handleLabSave}
        onReset={handleLabReset}
        onDelete={themeLab.editingId ? handleLabDelete : undefined}
      />
    </div>
  )
}
