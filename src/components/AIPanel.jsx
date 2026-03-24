import { useState, useEffect } from 'react'
import { getAIConfig, saveAIConfig, aiRequest, AI_ACTIONS } from '../utils/ai.js'

export default function AIPanel({ open, onClose, markdown, onApply }) {
  const [config, setConfig] = useState(() => getAIConfig())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [activeAction, setActiveAction] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) setConfig(getAIConfig())
  }, [open])

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    saveAIConfig({ [key]: value })
  }

  const handleAction = async (action) => {
    setActiveAction(action.id)
    setError('')
    setResult('')
    setLoading(true)
    try {
      const res = await aiRequest(action.prompt, markdown)
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (result && activeAction === 'polish') {
      onApply(result)
      setResult('')
      setActiveAction(null)
    }
  }

  if (!open) return null

  const hasConfig = config.endpoint && config.apiKey

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d0d7de]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h2 className="text-lg font-bold text-[#1f2328]">AI 润色</h2>
            </div>
            <p className="text-xs text-[#656d76] mt-0.5">智能优化你的文章</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f6f8fa] text-[#656d76] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* API 配置 */}
          <div className="space-y-3">
            <SectionTitle>API 配置</SectionTitle>
            <div className="space-y-2">
              <label className="block">
                <span className="text-xs text-[#656d76] font-medium">API 端点</span>
                <input
                  type="url"
                  value={config.endpoint}
                  onChange={(e) => handleConfigChange('endpoint', e.target.value)}
                  placeholder="https://api.openai.com/v1/chat/completions"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[#d0d7de] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15 transition-all"
                />
              </label>
              <label className="block">
                <span className="text-xs text-[#656d76] font-medium">API 密钥</span>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  placeholder="sk-..."
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[#d0d7de] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15 transition-all"
                />
              </label>
              <label className="block">
                <span className="text-xs text-[#656d76] font-medium">模型</span>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => handleConfigChange('model', e.target.value)}
                  placeholder="gpt-3.5-turbo"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[#d0d7de] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15 transition-all"
                />
              </label>
            </div>
          </div>

          {/* AI 功能 */}
          <div className="space-y-3">
            <SectionTitle>功能</SectionTitle>
            {!hasConfig && (
              <div className="text-xs text-[#d97706] bg-[#fffbeb] border border-[#fcd34d]/30 rounded-lg px-3 py-2">
                请先配置 API 端点和密钥，支持 OpenAI 兼容接口（如 OpenAI、DeepSeek、通义千问等）
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {AI_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  disabled={!hasConfig || loading}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-150 ${
                    activeAction === action.id
                      ? 'border-[#a855f7]/40 bg-[#a855f7]/5'
                      : 'border-[#d0d7de] hover:border-[#a855f7]/30 hover:bg-[#f6f8fa]'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium text-[#1f2328]">{action.name}</span>
                  <span className="text-[10px] text-[#656d76] leading-tight">{action.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 结果区域 */}
          {(loading || result || error) && (
            <div className="space-y-2">
              <SectionTitle>结果</SectionTitle>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-[#656d76] py-4">
                  <div className="w-4 h-4 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
                  AI 正在处理中...
                </div>
              )}
              {error && (
                <div className="text-sm text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              {result && (
                <div className="relative">
                  <pre className="text-sm text-[#1f2328] bg-[#f6f8fa] border border-[#d0d7de] rounded-lg p-3 whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto leading-relaxed">
                    {result}
                  </pre>
                  {activeAction === 'polish' && (
                    <button
                      onClick={handleApply}
                      className="mt-2 w-full px-4 py-2 rounded-lg text-sm font-medium bg-[#a855f7] text-white hover:bg-[#9333ea] transition-colors"
                    >
                      应用到编辑器
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result)
                    }}
                    className="mt-2 w-full px-4 py-2 rounded-lg text-sm font-medium border border-[#d0d7de] text-[#656d76] hover:bg-[#f6f8fa] transition-colors"
                  >
                    复制结果
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold text-[#656d76] uppercase tracking-wider">{children}</h3>
  )
}
