import { useEffect } from 'react'

export default function Toast({ message, visible, onDismiss }) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, 2500)
    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white border border-[#d0d7de] shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
    >
      <div className="w-6 h-6 rounded-full bg-[#22c55e]/15 flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <span className="text-sm text-[#1f2328] font-medium">{message}</span>
    </div>
  )
}
