import { useRef, useEffect, useState } from 'react'

const DEVICES = [
  { id: 'desktop', label: '电脑' },
  { id: 'phone', label: '手机' },
  { id: 'ipad', label: 'iPad' },
]

function StatusBarIOS() {
  return (
    <div className="relative flex items-center justify-between px-6 h-[44px] bg-white text-black text-[14px] font-semibold flex-shrink-0">
      <span>16:40</span>
      {/* Dynamic Island */}
      <div className="absolute left-1/2 top-[10px] -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full" />
      <div className="flex items-center gap-1">
        {/* Signal */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="7" rx="0.5"/>
          <rect x="9" y="2" width="3" height="10" rx="0.5"/>
          <rect x="13" y="0" width="3" height="12" rx="0.5" opacity="0.3"/>
        </svg>
        {/* WiFi */}
        <svg width="14" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 8.5a18 18 0 0 1 21 0"/>
          <path d="M5.5 12.5a12 12 0 0 1 13 0"/>
          <path d="M9 16.5a6 6 0 0 1 6 0"/>
          <circle cx="12" cy="20" r="1" fill="currentColor"/>
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0" y="0.5" width="21" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
          <rect x="1.5" y="2" width="16" height="8" rx="1" fill="#34c759"/>
          <path d="M22 4v4a1.5 1.5 0 0 0 0-4z" fill="currentColor" opacity="0.4"/>
        </svg>
      </div>
    </div>
  )
}

function HomeIndicator() {
  return (
    <div className="flex justify-center py-2 bg-white flex-shrink-0">
      <div className="w-[120px] h-[4px] bg-black/20 rounded-full" />
    </div>
  )
}

function PhoneShell({ children, onCopy }) {
  const wrapperRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!wrapperRef.current) return
    const observer = new ResizeObserver(() => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const parentH = wrapper.clientHeight
      const parentW = wrapper.clientWidth
      const shellH = 780
      const shellW = 380
      const s = Math.min(1, (parentH - 80) / shellH, (parentW - 40) / shellW)
      setScale(Math.max(0.5, s))
    })
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} className="flex-1 flex flex-col items-center justify-center bg-[#f0f0f3] overflow-hidden">
      <div
        className="relative flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: 380,
          height: 780,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Outer shell */}
        <div className="absolute inset-0 rounded-[44px] bg-gradient-to-b from-[#2c2c2e] to-[#1c1c1e] shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_30px_80px_rgba(0,0,0,0.35),0_4px_20px_rgba(0,0,0,0.25)]" />
        {/* Glass reflection */}
        <div className="absolute inset-0 rounded-[44px] pointer-events-none overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/[0.07] to-transparent" />
          <div className="absolute right-4 top-8 w-[40%] h-[15%] bg-gradient-to-br from-white/[0.04] to-transparent rounded-full blur-2xl" />
        </div>
        {/* Screen area — 375px content width */}
        <div className="absolute inset-[12px] rounded-[34px] bg-white overflow-hidden flex flex-col z-10">
          <StatusBarIOS />
          <div className="flex-1 overflow-y-auto overflow-x-hidden phone-scroll-hide">
            {children}
          </div>
          <HomeIndicator />
        </div>
      </div>
      <button
        onClick={onCopy}
        className="mt-4 px-8 py-3 rounded-full text-sm font-bold transition-all duration-200 select-none bg-[#07c160] text-white hover:bg-[#06ad56] hover:shadow-lg hover:shadow-[#07c160]/30 active:scale-95"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
      >
        一键复制，直接去发公众号
      </button>
    </div>
  )
}

function IPadShell({ children, onCopy }) {
  const wrapperRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!wrapperRef.current) return
    const observer = new ResizeObserver(() => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const parentH = wrapper.clientHeight
      const parentW = wrapper.clientWidth
      const shellH = 1024
      const shellW = 790
      const s = Math.min(1, (parentH - 80) / shellH, (parentW - 40) / shellW)
      setScale(Math.max(0.35, s))
    })
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} className="flex-1 flex flex-col items-center justify-center bg-[#f0f0f3] overflow-hidden">
      <div
        className="relative flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: 790,
          height: 1024,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Outer shell — slightly smaller radius than phone */}
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-[#2c2c2e] to-[#1c1c1e] shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_30px_80px_rgba(0,0,0,0.35),0_4px_20px_rgba(0,0,0,0.25)]" />
        {/* Glass reflection */}
        <div className="absolute inset-0 rounded-[28px] pointer-events-none overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/[0.07] to-transparent" />
        </div>
        {/* Screen area — 768px content width, no notch, just a thin status bar */}
        <div className="absolute inset-[11px] rounded-[18px] bg-white overflow-hidden flex flex-col z-10">
          {/* Simple status bar (no Dynamic Island on iPad) */}
          <div className="flex items-center justify-between px-6 h-[28px] bg-white text-black text-[12px] font-medium flex-shrink-0">
            <span>16:40</span>
            <div className="flex items-center gap-1">
              <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor">
                <rect x="0" y="8" width="3" height="4" rx="0.5"/>
                <rect x="4.5" y="5" width="3" height="7" rx="0.5"/>
                <rect x="9" y="2" width="3" height="10" rx="0.5"/>
                <rect x="13" y="0" width="3" height="12" rx="0.5" opacity="0.3"/>
              </svg>
              <svg width="12" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 8.5a18 18 0 0 1 21 0"/>
                <path d="M5.5 12.5a12 12 0 0 1 13 0"/>
                <path d="M9 16.5a6 6 0 0 1 6 0"/>
                <circle cx="12" cy="20" r="1" fill="currentColor"/>
              </svg>
              <svg width="22" height="10" viewBox="0 0 25 12" fill="currentColor">
                <rect x="0" y="0.5" width="21" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
                <rect x="1.5" y="2" width="16" height="8" rx="1" fill="#34c759"/>
                <path d="M22 4v4a1.5 1.5 0 0 0 0-4z" fill="currentColor" opacity="0.4"/>
              </svg>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden phone-scroll-hide">
            {children}
          </div>
          <HomeIndicator />
        </div>
      </div>
      <button
        onClick={onCopy}
        className="mt-4 px-8 py-3 rounded-full text-sm font-bold transition-all duration-200 select-none bg-[#07c160] text-white hover:bg-[#06ad56] hover:shadow-lg hover:shadow-[#07c160]/30 active:scale-95"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
      >
        一键复制，直接去发公众号
      </button>
    </div>
  )
}

export default function DevicePreview({ device, onDeviceChange, children, onCopy }) {
  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-4 h-10 bg-[#f6f8fa] border-b border-black/[0.06] flex-shrink-0">
        {DEVICES.map((d) => (
          <button
            key={d.id}
            onClick={() => onDeviceChange(d.id)}
            className={`relative px-4 h-full text-[13px] font-medium transition-colors duration-150 ${
              device === d.id
                ? 'text-[#1f2328]'
                : 'text-[#656d76] hover:text-[#1f2328]'
            }`}
          >
            {d.label}
            {device === d.id && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#1f2328] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {device === 'desktop' ? (
        <div className="flex-1 overflow-hidden">{children}</div>
      ) : device === 'phone' ? (
        <PhoneShell onCopy={onCopy}>{children}</PhoneShell>
      ) : (
        <IPadShell onCopy={onCopy}>{children}</IPadShell>
      )}
    </div>
  )
}
