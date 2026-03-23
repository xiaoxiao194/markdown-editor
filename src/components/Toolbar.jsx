import { useState } from 'react'

export default function Toolbar({ theme, themeEntries = [], onThemeChange, onCopy, onOpenThemeLab }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const ok = await onCopy()
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-2.5 bg-[#f6f8fa] border-b border-[#d0d7de] shadow-sm flex-shrink-0">
      {/* 主题选择区 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] flex-shrink-0" />
          <span className="text-[#656d76] text-xs font-medium tracking-wide">样式</span>
        </div>
        <div className="relative">
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-[#d0d7de] bg-white text-sm text-[#1f2328] outline-none cursor-pointer hover:border-[#3b82f6] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15 transition-all duration-150 font-medium"
          >
            {themeEntries.map(([key, t]) => (
              <option key={key} value={key}>
                {t.name}{t.isCustom ? ' · 自定义' : ''}
              </option>
            ))}
          </select>
          {/* 下拉箭头图标 */}
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#656d76]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        <button
          onClick={onOpenThemeLab}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#3b82f6]/50 text-[#3b82f6] text-xs font-semibold hover:bg-[#3b82f6]/8 transition-colors duration-150"
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.36 0 .71.13.99.36A1.65 1.65 0 0 0 21.91 9H22a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
          </svg>
          主题实验室
        </button>
      </div>

      {/* 复制按钮 */}
      <button
        onClick={handleCopy}
        className={`
          flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 select-none
          ${copied
            ? 'bg-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/20'
            : 'bg-[#3b82f6] text-white hover:bg-[#2563eb] hover:shadow-lg hover:shadow-[#3b82f6]/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0'
          }
        `}
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            已复制！
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            一键复制
          </>
        )}
      </button>
    </div>
  )
}
