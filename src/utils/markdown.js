import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
      } catch (_) {}
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`
  },
})

// 将编辑器中的短 ID（如 img-1）替换为实际的 base64 URL
function resolveImageIds(text, imageStore) {
  if (!imageStore || imageStore.size === 0) return text
  return text.replace(/\(img-(\d+)\)/g, (match, id) => {
    const src = imageStore.get(`img-${id}`)
    return src ? `(${src})` : match
  })
}

export function parseMarkdown(text, imageStore) {
  const resolved = resolveImageIds(text, imageStore)
  return md.render(resolved)
}
