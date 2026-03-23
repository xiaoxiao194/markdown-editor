const SectionTitle = ({ children }) => (
  <h4 className="text-xs font-semibold text-gray-500 tracking-wide uppercase">{children}</h4>
)

export default function ThemeLab({
  open,
  name,
  tokens,
  onNameChange,
  onTokensChange,
  onClose,
  onSave,
  onReset,
  onDelete,
  isEditing = false,
  baseName = '微信风格',
}) {
  if (!open) return null

  const handlePalette = (field, value) => {
    onTokensChange({
      ...tokens,
      palette: {
        ...tokens.palette,
        [field]: value,
      },
    })
  }

  const handleTypography = (field, value) => {
    onTokensChange({
      ...tokens,
      typography: {
        ...tokens.typography,
        [field]: value,
      },
    })
  }

  const handleLayout = (field, value) => {
    onTokensChange({
      ...tokens,
      layout: {
        ...tokens.layout,
        [field]: value,
      },
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-full max-w-md h-full bg-white border-l border-gray-100 shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Theme Lab</p>
            <h3 className="text-lg font-semibold text-gray-900">自定义主题</h3>
          </div>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5 space-y-6 text-sm text-gray-700">
          <div className="space-y-2">
            <SectionTitle>基础信息</SectionTitle>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="主题名称"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
            />
            <p className="text-xs text-gray-400">
              当前以「{baseName}」为基准，自由调整主色、字体与排版参数。
            </p>
          </div>

          <div className="space-y-3">
            <SectionTitle>主色调</SectionTitle>
            <ColorInput label="主色" value={tokens.palette.primary} onChange={(val) => handlePalette('primary', val)} />
            <ColorInput label="强调色" value={tokens.palette.accent} onChange={(val) => handlePalette('accent', val)} />
            <ColorInput label="标题色" value={tokens.palette.heading} onChange={(val) => handlePalette('heading', val)} />
            <ColorInput label="正文色" value={tokens.palette.body} onChange={(val) => handlePalette('body', val)} />
          </div>

          <div className="space-y-4">
            <SectionTitle>排版</SectionTitle>
            <RangeInput
              label="内容宽度"
              min={560}
              max={780}
              step={5}
              value={tokens.layout.contentWidth}
              unit="px"
              onChange={(val) => handleLayout('contentWidth', val)}
            />
            <RangeInput
              label="圆角"
              min={8}
              max={32}
              value={tokens.layout.radius}
              unit="px"
              onChange={(val) => handleLayout('radius', val)}
            />
            <RangeInput
              label="正文字号"
              min={14}
              max={18}
              value={tokens.typography.bodySize}
              unit="px"
              onChange={(val) => handleTypography('bodySize', val)}
            />
          </div>

          <div className="space-y-3">
            <SectionTitle>字体</SectionTitle>
            <select
              value={tokens.typography.fontFamily}
              onChange={(e) => handleTypography('fontFamily', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            >
              <option value='-apple-system, "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'>HarmonyOS / 苹果系统</option>
              <option value='"Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'>思源黑体</option>
              <option value='"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif'>霞鹜文楷</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-3">
          {isEditing && (
            <button
              onClick={onDelete}
              className="text-red-500 text-sm font-medium hover:text-red-600 mr-auto"
              type="button"
            >
              删除主题
            </button>
          )}
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
            type="button"
          >
            重置
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
            type="button"
          >
            取消
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-[#3b82f6] text-white text-sm font-semibold shadow-sm hover:bg-[#2563eb]"
            type="button"
          >
            保存主题
          </button>
        </div>
      </div>
    </div>
  )
}

function ColorInput({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm font-medium text-gray-600">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-gray-200 bg-white cursor-pointer"
      />
    </label>
  )
}

function RangeInput({ label, min, max, value, step = 1, unit = '', onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-gray-400 text-xs">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-[#3b82f6]"
      />
    </label>
  )
}
