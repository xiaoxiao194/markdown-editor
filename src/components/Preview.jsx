import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import DevicePreview from './DevicePreview.jsx'

const POPULAR_THEMES = ['wechat', 'hongfei', 'github', 'literary']

// ThemeBar: exported as Preview.ThemeBar for use in the unified action bar
function ThemeBar({ theme, themeEntries = [], onThemeChange, onOpenThemeLab }) {
  const [showMore, setShowMore] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const moreRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!showMore) return
    const handler = (e) => {
      if (moreRef.current?.contains(e.target)) return
      if (btnRef.current?.contains(e.target)) return
      setShowMore(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMore])

  const popularEntries = POPULAR_THEMES
    .map((key) => themeEntries.find(([k]) => k === key))
    .filter(Boolean)
  const moreEntries = themeEntries.filter(([key]) => !POPULAR_THEMES.includes(key))
  const isMoreActive = !POPULAR_THEMES.includes(theme) && themeEntries.some(([k]) => k === theme)

  return (
    <div className="flex items-center gap-0.5">
      {popularEntries.map(([key, t]) => (
        <button
          key={key}
          onClick={() => onThemeChange?.(key)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
            theme === key
              ? 'bg-[#1f2328] text-white shadow-sm'
              : 'text-[#656d76] hover:text-[#1f2328] hover:bg-black/[0.05]'
          }`}
        >
          {t.name}
        </button>
      ))}
      <div ref={moreRef}>
        <button
          ref={btnRef}
          onClick={() => {
            if (!showMore && btnRef.current) {
              const rect = btnRef.current.getBoundingClientRect()
              setDropPos({ top: rect.bottom + 6, left: Math.min(rect.left, window.innerWidth - 160) })
            }
            setShowMore((v) => !v)
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1 ${
            isMoreActive
              ? 'bg-[#1f2328] text-white shadow-sm'
              : 'text-[#656d76] hover:text-[#1f2328] hover:bg-black/[0.05]'
          }`}
        >
          {isMoreActive ? moreEntries.find(([k]) => k === theme)?.[1]?.name : '更多'}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-150 ${showMore ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {showMore && createPortal(
          <div ref={moreRef} className="fixed w-[150px] bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/[0.06] py-1.5 z-[999]" style={{ top: dropPos.top, left: dropPos.left }}>
            {moreEntries.map(([key, t]) => (
              <button
                key={key}
                onClick={() => { onThemeChange?.(key); setShowMore(false) }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors duration-100 ${
                  theme === key
                    ? 'bg-[#1f2328]/8 text-[#1f2328] font-semibold'
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
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}

export default function Preview({ html, themeConfig, meta = {}, onScroll, scrollRef, device, onDeviceChange, onCopy }) {
  const containerRef = useRef(null)
  const styleRef = useRef(null)
  const scrollableRef = useRef(null)

  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      document.head.appendChild(styleRef.current)
    }
    styleRef.current.textContent = themeConfig?.css || ''
  }, [themeConfig])

  useEffect(() => {
    if (scrollRef) scrollRef.current = scrollableRef.current
  }, [scrollRef])

  const isWechatTheme = themeConfig?.meta?.base === 'wechat'
  const isMobile = device === 'phone' || device === 'ipad'

  const previewContent = isWechatTheme ? (
    <div ref={isMobile ? undefined : scrollableRef} onScroll={isMobile ? undefined : onScroll} className={isMobile ? 'h-full overflow-auto' : 'h-full overflow-auto px-6 py-6 bg-[#f0f2f5]'}>
      {isMobile ? (
        <div className="px-4 py-4 bg-white">
          <div
            ref={containerRef}
            className="preview-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      ) : (
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
      )}
    </div>
  ) : (
    <div ref={isMobile ? undefined : scrollableRef} onScroll={isMobile ? undefined : onScroll} className="h-full overflow-auto">
      <div
        ref={containerRef}
        className="preview-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <DevicePreview device={device} onDeviceChange={onDeviceChange} onCopy={onCopy}>
        {previewContent}
      </DevicePreview>
    </div>
  )
}

Preview.ThemeBar = ThemeBar
