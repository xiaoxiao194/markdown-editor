/**
 * Export a DOM element as a PNG image using Canvas + foreignObject.
 * No external dependencies needed.
 */
export async function exportAsImage(element, filename = 'markcopy-export.png') {
  if (!element) throw new Error('No element to export')

  // Collect all stylesheets
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
  let cssText = ''
  for (const el of styles) {
    if (el.tagName === 'STYLE') {
      cssText += el.innerHTML
    } else {
      try {
        const sheet = el.sheet
        if (sheet) {
          cssText += Array.from(sheet.cssRules).map((r) => r.cssText).join('\n')
        }
      } catch {
        // Cross-origin stylesheets can't be read
      }
    }
  }

  // Clone the element and inline computed styles for key elements
  const clone = element.cloneNode(true)
  const width = element.scrollWidth
  const height = element.scrollHeight

  // Build SVG foreignObject
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <style>${cssText}</style>
          ${clone.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  img.crossOrigin = 'anonymous'

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob((pngBlob) => {
        URL.revokeObjectURL(url)
        if (!pngBlob) {
          reject(new Error('Failed to generate image'))
          return
        }
        const link = document.createElement('a')
        link.download = filename
        link.href = URL.createObjectURL(pngBlob)
        link.click()
        setTimeout(() => URL.revokeObjectURL(link.href), 10000)
        resolve()
      }, 'image/png')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      // Fallback: open HTML in new tab for manual save
      const html = element.outerHTML
      const htmlBlob = new Blob(
        [`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cssText}</style></head><body style="margin:0;padding:20px;background:#fff">${html}</body></html>`],
        { type: 'text/html' }
      )
      const htmlUrl = URL.createObjectURL(htmlBlob)
      window.open(htmlUrl, '_blank')
      setTimeout(() => URL.revokeObjectURL(htmlUrl), 10000)
      resolve()
    }
    img.src = url
  })
}
