import { useEffect, useRef } from 'react'

export default function Preview({ html, themeConfig, meta = {}, labPreviewName = '', platformName = '公众号预览', theme, themeEntries = [], onThemeChange, onCopy, onOpenThemeLab }) {
  const containerRef = useRef(null)
  const styleRef = useRef(null)

  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      document.head.appendChild(styleRef.current)
    }
    styleRef.current.textContent = themeConfig?.css || ''
  }, [themeConfig])

  const isWechatTheme = themeConfig?.meta?.base === 'wechat'
  const formattedDate = meta?.publishDate
    ? new Date(meta.publishDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return (
    <div className="flex flex-col h-full">
      {/* 面板头部 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f6f8fa] border-b border-[#e5e7eb] flex-shrink-0">
        <div className="flex items-center gap-2 text-[#656d76] text-sm font-medium">
          <span className="text-[#3b82f6]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </span>
          {platformName}
          {labPreviewName && (
            <span className="text-xs text-[#3b82f6] font-semibold px-2 py-0.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/25">
              预览：{labPreviewName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 样式选择器 */}
          <div className="relative">
            <select
              value={theme}
              onChange={(e) => {
                if (e.target.value === '__theme_lab__') {
                  onOpenThemeLab?.()
                  // Reset select to current theme
                  e.target.value = theme
                } else {
                  onThemeChange?.(e.target.value)
                }
              }}
              className="appearance-none pl-2.5 pr-7 py-1 rounded-md border border-[#d0d7de] bg-white text-xs text-[#1f2328] outline-none cursor-pointer hover:border-[#3b82f6] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15 transition-all duration-150 font-medium"
            >
              {themeEntries.map(([key, t]) => (
                <option key={key} value={key}>
                  {t.name}{t.isCustom ? ' · 自定义' : ''}
                </option>
              ))}
              <option disabled>──────────</option>
              <option value="__theme_lab__">⚙ 主题实验室...</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#656d76]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
          {/* 一键复制按钮 */}
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 select-none bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white hover:shadow-lg hover:shadow-[#3b82f6]/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            一键复制
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {isWechatTheme ? (
          <div className="h-full overflow-auto px-6 py-6 bg-[#f0f2f5]">
            <div className="w-full max-w-[760px] mx-auto flex flex-col gap-6 pb-8">
              <div className="relative rounded-[32px] bg-white/95 border border-[#d0d7de] shadow-[0_35px_80px_rgba(31,35,40,0.08)] overflow-hidden">
                <div className="px-8 md:px-12 pt-10 pb-6 border-b border-[#eef2ef] flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2 font-semibold text-[#07c160]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#07c160]" />
                    公众号排版预览
                  </span>
                  <span>预计 {meta?.readMinutes ?? 1} 分钟</span>
                  <span>{meta?.wordCount ?? 0} 字</span>
                </div>
                <div className="px-6 md:px-10 py-10 bg-white">
                  <div
                    ref={containerRef}
                    className="preview-body"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <div
              ref={containerRef}
              className="preview-body"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
