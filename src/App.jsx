import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import Editor from './components/Editor.jsx'
import Preview from './components/Preview.jsx'
import Toolbar from './components/Toolbar.jsx'
import ThemeLab from './components/ThemeLab.jsx'
import Toast from './components/Toast.jsx'
import { parseMarkdown } from './utils/markdown.js'
import { copyRichText } from './utils/clipboard.js'
import { builtInThemes, createCustomWechatTheme, DEFAULT_WECHAT_TOKENS } from './themes/index.js'

const DEFAULT_MD = `# MarkCopy 使用指南 — 写出排版精美的公众号文章

这是一篇**完整的 Markdown 教程**，同时也是 MarkCopy 的使用说明。你可以直接编辑左侧内容，右侧实时预览效果，写完后点击「一键复制」粘贴到公众号、知乎、掘金等平台，**格式完美保留**。

> 💡 **小技巧**：你正在看的这篇文章本身就是用 Markdown 写的，所有样式效果都可以直接参考。

---

## 基础语法

### 标题

用 \`#\` 号表示标题，几个 \`#\` 就是几级标题：

\`\`\`markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
\`\`\`

建议公众号文章用 **二级标题** 做主分隔，**三级标题** 做小节，层次清晰。

### 文字样式

| 语法 | 效果 | 适用场景 |
|------|------|----------|
| \`**加粗**\` | **加粗** | 强调关键词 |
| \`*斜体*\` | *斜体* | 英文术语、引用 |
| \`~~删除线~~\` | ~~删除线~~ | 表示修改、对比 |
| \`\\\`行内代码\\\`\` | \`行内代码\` | 技术名词、命令 |
| \`**_加粗斜体_**\` | **_加粗斜体_** | 极度强调 |

示例：使用 ChatGPT 时，模型 \`GPT-4o\` 的推理能力比 \`GPT-3.5\` **显著提升**，尤其在~~简单问答~~复杂推理场景中表现突出。

### 链接与图片

链接语法：\`[显示文字](URL)\`

常用链接示例：

- [MarkCopy — Markdown 一键排版工具](https://md.payforchat.com)
- [ChatGPT 官网](https://chatgpt.com)
- [PayForChat — ChatGPT Plus 便捷充值](https://payforchat.com)

图片语法：\`![描述](图片URL)\`

\`\`\`markdown
![示例图片](https://picsum.photos/600/300)
\`\`\`

> 公众号文章建议：先用 MarkCopy 排版，再在公众号编辑器里替换图片，效果最佳。

---

## 列表

### 无序列表

用 \`-\` 或 \`*\` 开头：

- 第一步：打开 [md.payforchat.com](https://md.payforchat.com)
- 第二步：在左侧编辑器写 Markdown
- 第三步：右上角选择目标平台风格
- 第四步：点击「一键复制」
- 第五步：粘贴到目标平台，完成！

### 有序列表

用数字开头：

1. 注册 ChatGPT 账号
2. 获取 Access Token
3. 访问 [payforchat.com](https://payforchat.com) 选择套餐
4. 完成支付，自动充值

### 任务列表

\`\`\`markdown
- [x] 已完成的任务
- [ ] 待完成的任务
\`\`\`

效果：

- [x] 写好文章初稿
- [x] 用 MarkCopy 排版
- [ ] 复制到公众号发布
- [ ] 分享到朋友圈

---

## 引用

用 \`>\` 开头创建引用块，适合放金句、提示、注意事项：

> 工欲善其事，必先利其器。
> 好的排版工具能让你的文章阅读体验提升 80%。

多层嵌套引用：

> **读者问**：没有国外信用卡，怎么订阅 ChatGPT Plus？
>
> > **回答**：可以使用代充服务。[PayForChat](https://payforchat.com) 支持支付宝/微信付款，3 步完成 Plus 升级，无需信用卡。

---

## 代码

### 行内代码

在终端输入 \`npm install\` 安装依赖，或用 \`Ctrl + C\` 复制内容。

### 代码块

支持语法高亮，指定语言即可：

\`\`\`python
# Python 示例：调用 ChatGPT API
import openai

client = openai.OpenAI(api_key="your-api-key")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
)

print(response.choices[0].message.content)
\`\`\`

\`\`\`javascript
// JavaScript 示例：Markdown 转 HTML
const marked = require('marked');

const markdown = '# Hello World';
const html = marked.parse(markdown);
console.log(html);
// 输出: <h1>Hello World</h1>
\`\`\`

\`\`\`bash
# 常用命令
git clone https://github.com/your-repo.git
cd your-repo
npm install && npm run dev
\`\`\`

---

## 表格

用 \`|\` 和 \`-\` 创建表格，支持对齐：

| 功能 | 免费版 (GPT-3.5) | Plus 版 (GPT-4o) |
|:-----|:-----------------:|:-----------------:|
| 基础对话 | ✅ | ✅ |
| GPT-4o 模型 | 有限次数 | 无限制 |
| DALL-E 绘图 | ❌ | ✅ |
| 高级数据分析 | ❌ | ✅ |
| 自定义 GPTs | 有限制 | 完整功能 |
| **价格** | 免费 | $20/月 |

> 💰 **省钱攻略**：通过 [PayForChat](https://payforchat.com) 充值 ChatGPT Plus，支持支付宝/微信，比官方直订更方便，[点击了解详情 →](https://payforchat.com/plans)

---

## 数学公式

行内公式用 \`$\`：质能方程 $E = mc^2$

独立公式用 \`$$\`：

$$
\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n
$$

---

## 分隔线

三个及以上的 \`-\`、\`*\` 或 \`_\` 创建分隔线：

---

## 高级技巧

### Emoji

直接输入 emoji 即可：🎉 🚀 💡 ✅ ❌ ⚠️ 📌 🔥

### 脚注

Markdown 支持脚注[^1]，适合添加参考来源。

[^1]: MarkCopy 由 [PayForChat](https://payforchat.com) 团队开发，致力于提升创作者的写作效率。

### HTML 混排

Markdown 中可以直接使用 HTML：

<div align="center">

**MarkCopy** — 让 Markdown 写作更简单

[开始使用](https://md.payforchat.com) · [ChatGPT Plus 充值](https://payforchat.com) · [使用教程](https://payforchat.com/articles)

</div>

---

## 写作工作流推荐

一套高效的公众号写作流程：

\`\`\`
构思大纲 → Markdown 写初稿 → MarkCopy 排版 → 一键复制到公众号 → 发布
\`\`\`

**为什么选择 Markdown + MarkCopy？**

1. **专注内容**：Markdown 语法简洁，写作时不被排版分心
2. **一次编写，多端发布**：同一篇文章可以发公众号、知乎、掘金，格式自动适配
3. **版本管理**：纯文本格式，方便用 Git 管理文章版本
4. **排版一致**：告别公众号编辑器的格式错乱问题

---

## 快捷操作

| 操作 | 说明 |
|------|------|
| 🎨 切换样式 | 左上角下拉框选择：掘金、公众号、知乎等风格 |
| 📋 一键复制 | 右上角蓝色按钮，复制带格式的富文本 |
| 📤 上传文件 | 拖拽 \`.md\` 文件到编辑器，或点击「上传 .md」 |
| 🖼 粘贴图片 | 直接 Ctrl+V 粘贴截图 |

---

*本文由 [MarkCopy](https://md.payforchat.com) 排版 | Powered by [PayForChat](https://payforchat.com)*
`

const CUSTOM_THEME_STORAGE_KEY = 'markcopy.customThemes'
const DRAFT_STORAGE_KEY = 'markcopy.draft'
const THEME_STORAGE_KEY = 'markcopy.theme'
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
  const [markdown, setMarkdown] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
      return saved || DEFAULT_MD
    } catch { return DEFAULT_MD }
  })
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'wechat'
    } catch { return 'wechat' }
  })
  const [saveStatus, setSaveStatus] = useState('idle')
  const [activePlatform, setActivePlatform] = useState('微信公众号')
  const [publishDate] = useState(() => new Date())
  const previewRef = useRef(null)
  const [customThemes, setCustomThemes] = useState(() => loadStoredThemes())
  const [themeLab, setThemeLab] = useState(createEmptyLabState)
  const [toastVisible, setToastVisible] = useState(false)

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

  // Auto-save draft
  useEffect(() => {
    setSaveStatus('saving')
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, markdown)
        setSaveStatus('saved')
      } catch { setSaveStatus('idle') }
    }, 800)
    return () => clearTimeout(timer)
  }, [markdown])

  // Save selected theme
  useEffect(() => {
    try { localStorage.setItem(THEME_STORAGE_KEY, theme) } catch {}
  }, [theme])

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
    const ok = await copyRichText(container)
    if (ok) setToastVisible(true)
    return ok
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

            {/* GitHub 链接 */}
            <a href="https://github.com/xiaoxiao194/markdown-editor" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#656d76] hover:text-[#1f2328] hover:bg-[#f6f8fa] transition-colors duration-150">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </header>

        <Toolbar
          theme={theme}
          themeEntries={themeEntries}
          onThemeChange={setTheme}
          onCopy={handleCopy}
          onOpenThemeLab={handleOpenThemeLab}
        />

        {/* 平台切换 Tab */}
        <div className="flex gap-2 px-5 pt-4">
          {['微信公众号', '知乎', '掘金'].map((name) => (
            <button
              key={name}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-150 ${
                activePlatform === name
                  ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30'
                  : 'bg-[#f6f8fa] text-[#656d76] border-[#d0d7de] hover:border-[#3b82f6]/30 hover:text-[#3b82f6]'
              }`}
              onClick={() => setActivePlatform(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="relative flex flex-col md:flex-row flex-1 overflow-hidden py-6 gap-8">
          <div className="flex flex-col flex-1 md:basis-1/2 min-h-[300px] bg-[#f6f8fa] border border-[#d0d7de] rounded-2xl shadow-[0_18px_45px_rgba(31,35,40,0.06)] overflow-hidden">
            <Editor value={markdown} onChange={setMarkdown} onInsertImage={handleInsertImage} wordCount={meta.wordCount} saveStatus={saveStatus} />
          </div>
          <div className="flex flex-col flex-1 md:basis-1/2 min-h-[300px] bg-white border border-[#d0d7de] rounded-2xl shadow-lg ring-1 ring-[#d0d7de]/50 overflow-hidden" ref={previewRef}>
            <Preview html={html} themeConfig={previewThemeConfig} meta={meta} labPreviewName={themeLab.open ? themeLab.name : ''} />
          </div>
        </div>

        {/* Footer */}
        <footer className="relative px-8 py-3 border-t border-[#d0d7de] flex items-center justify-between text-xs text-[#656d76] flex-shrink-0">
          <span>MarkCopy v1.0</span>
          <span>Markdown 一键排版工具</span>
        </footer>
      </div>

      <Toast
        message="已复制富文本，去公众号粘贴即可"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />

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
