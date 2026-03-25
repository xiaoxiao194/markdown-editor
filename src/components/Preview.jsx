import { useEffect, useRef, useState } from 'react'

const POPULAR_THEMES = ['wechat', 'github', 'juejin', 'minimalist']

export default function Preview({ html, themeConfig, meta = {}, labPreviewName = '', platformName = '公众号预览', theme, themeEntries = [], onThemeChange, onCopy, onOpenThemeLab, onScroll, scrollRef }) {
  const containerRef = useRef(null)
  const styleRef = useRef(null)
  const [showMore, setShowMore] = useState(false)
  const moreRef = useRef(null)
  const scrollableRef = useRef(null)

  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      document.head.appendChild(styleRef.current)
    }
    styleRef.current.textContent = themeConfig?.css || ''
  }, [themeConfig])

  // Sync external scroll ref to the scrollable container
  useEffect(() => {
    if (scrollRef) scrollRef.current = scrollableRef.current
  }, [scrollRef])

  // Close dropdown on click outside
  useEffect(() => {
    if (!showMore) return
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMore])

  const isWechatTheme = themeConfig?.meta?.base === 'wechat'

  const popularEntries = POPULAR_THEMES
    .map((key) => themeEntries.find(([k]) => k === key))
    .filter(Boolean)
  const moreEntries = themeEntries.filter(([key]) => !POPULAR_THEMES.includes(key))
  const isMoreActive = !POPULAR_THEMES.includes(theme) && themeEntries.some(([k]) => k === theme)

  return (
    <div className="flex flex-col h-full">
      {/* 面板头部 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/60 backdrop-blur-sm border-b border-black/[0.06] flex-shrink-0">
        <div className="flex items-center gap-1">
          {/* 平铺主题按钮 */}
          {popularEntries.map(([key, t]) => (
            <button
              key={key}
              onClick={() => onThemeChange?.(key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 ${
                theme === key
                  ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
                  : 'text-[#656d76] hover:text-[#1f2328] hover:bg-black/[0.04]'
              }`}
            >
              {t.name}
            </button>
          ))}
          {/* 更多按钮 */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setShowMore((v) => !v)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 flex items-center gap-1 ${
                isMoreActive
                  ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
                  : 'text-[#656d76] hover:text-[#1f2328] hover:bg-black/[0.04]'
              }`}
            >
              {isMoreActive ? moreEntries.find(([k]) => k === theme)?.[1]?.name : '更多'}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-150 ${showMore ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {showMore && (
              <div className="absolute left-0 top-full mt-1 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-black/[0.06] py-1.5 z-50 min-w-[140px]">
                {moreEntries.map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => { onThemeChange?.(key); setShowMore(false) }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors duration-100 ${
                      theme === key
                        ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-medium'
                        : 'text-[#1f2328] hover:bg-black/[0.04]'
                    }`}
                  >
                    {t.name}{t.isCustom ? ' · 自定义' : ''}
                  </button>
                ))}
                <div className="border-t border-black/[0.06] my-1" />
                <button
                  onClick={() => { onOpenThemeLab?.(); setShowMore(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#656d76] hover:bg-black/[0.04] transition-colors duration-100"
                >
                  ⚙ 主题实验室...
                </button>
              </div>
            )}
          </div>
        </div>
        {/* 一键复制按钮 */}
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 select-none bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white shadow-sm hover:shadow-lg hover:shadow-[#3b82f6]/25 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          一键复制
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {isWechatTheme ? (
          <div ref={scrollableRef} onScroll={onScroll} className="h-full overflow-auto px-6 py-6 bg-[#f0f2f5]">
            <div className="w-full max-w-[760px] mx-auto flex flex-col gap-6 pb-8">
              <div className="relative rounded-2xl bg-white border border-black/[0.06] shadow-[0_2px_24px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="px-8 md:px-12 pt-10 pb-6 border-b border-black/[0.04] flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
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
          <div ref={scrollableRef} onScroll={onScroll} className="h-full overflow-auto">
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
