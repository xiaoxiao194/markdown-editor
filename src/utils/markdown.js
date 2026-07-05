import MarkdownIt from 'markdown-it'
// 只导入常用语言子集（~40 种），全量导入会让打包体积增加约 700KB
import hljs from 'highlight.js/lib/common'
import mdKatex from '@vscode/markdown-it-katex'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
      } catch { /* fall through to plain rendering */ }
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`
  },
}).use(mdKatex, {
  throwOnError: false,
  errorColor: '#cc0000',
})

export function parseMarkdown(text) {
  return md.render(text)
}
