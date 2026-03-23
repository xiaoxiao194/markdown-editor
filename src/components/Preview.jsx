import { useEffect, useRef } from 'react'

export default function Preview({ html, themeConfig, meta = {}, labPreviewName = '' }) {
  const containerRef = useRef(null)
  const styleRef = useRef(null)

  // 注入主题样式
  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      document.head.appendChild(styleRef.current)
    }
    styleRef.current.textContent = themeConfig?.css || ''
  }, [themeConfig])

  const themeName = themeConfig?.name || 'GitHub'
  const isWechatTheme = themeConfig?.meta?.base === 'wechat'
  const formattedDate = meta?.publishDate
    ? new Date(meta.publishDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  const badgeClass = isWechatTheme
    ? 'px-3 py-1 text-xs rounded-full bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/25 font-semibold'
    : 'px-2.5 py-0.5 text-xs rounded-full bg-[#f6f8fa] text-[#656d76] border border-[#d0d7de] font-medium'

  return (
    <div className="flex flex-col h-full">
      {/* 面板头部 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#f6f8fa] border-b border-[#d0d7de] flex-shrink-0">
        <div className="flex items-center gap-2 text-[#656d76] text-sm font-medium">
          <span className="text-[#3b82f6]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </span>
          {isWechatTheme ? '公众号预览' : '预览'}
          {labPreviewName && (
            <span className="text-xs text-[#3b82f6] font-semibold px-2 py-0.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/25">
              预览：{labPreviewName}
            </span>
          )}
        </div>
        <span className={badgeClass}>
          {isWechatTheme ? `${themeName} · 粘贴即用` : themeName}
        </span>
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

export { }
