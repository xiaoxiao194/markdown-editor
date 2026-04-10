/**
 * Collect all CSS rules from loaded stylesheets that match a predicate.
 */
function collectCssRules(predicate) {
  const rules = []
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (predicate(rule.cssText)) {
          rules.push(rule.cssText)
        }
      }
    } catch {
      // cross-origin sheets will throw — skip them
    }
  }
  return rules.join('\n')
}

/**
 * Open the browser print dialog with the rendered preview content.
 * Collects theme CSS, KaTeX CSS, and highlight.js CSS into a hidden iframe.
 */
export function printPreview({ html, themeCss }) {
  const katexCss = collectCssRules((text) => text.includes('.katex') || text.includes('@font-face'))
  const hljsCss = collectCssRules((text) => text.includes('.hljs'))

  const printCss = `
* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
@media print {
  body { margin: 0; padding: 20mm; }
  pre, code, blockquote, table, img { page-break-inside: avoid; }
  h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
  img { max-width: 100% !important; height: auto !important; }
}
`

  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>${katexCss}</style>
<style>${hljsCss}</style>
<style>${themeCss || ''}</style>
<style>${printCss}</style>
</head>
<body>
<div class="preview-body">${html}</div>
</body>
</html>`

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;width:0;height:0;border:none;left:-9999px'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  doc.open()
  doc.write(fullHtml)
  doc.close()

  // Wait for fonts/images to load before printing
  iframe.contentWindow.addEventListener('afterprint', () => {
    iframe.remove()
  })

  // Delay slightly to allow styles to be parsed
  setTimeout(() => {
    iframe.contentWindow.print()
    // Fallback cleanup if afterprint never fires (e.g. user cancels)
    setTimeout(() => {
      if (iframe.parentNode) iframe.remove()
    }, 60000)
  }, 300)
}
