const AI_ENDPOINT_KEY = 'markcopy.ai.endpoint'
const AI_KEY_KEY = 'markcopy.ai.key'
const AI_MODEL_KEY = 'markcopy.ai.model'

export function getAIConfig() {
  return {
    endpoint: localStorage.getItem(AI_ENDPOINT_KEY) || '',
    apiKey: localStorage.getItem(AI_KEY_KEY) || '',
    model: localStorage.getItem(AI_MODEL_KEY) || 'gpt-3.5-turbo',
  }
}

export function saveAIConfig({ endpoint, apiKey, model }) {
  if (endpoint !== undefined) localStorage.setItem(AI_ENDPOINT_KEY, endpoint)
  if (apiKey !== undefined) localStorage.setItem(AI_KEY_KEY, apiKey)
  if (model !== undefined) localStorage.setItem(AI_MODEL_KEY, model)
}

export async function aiRequest(systemPrompt, userContent) {
  const { endpoint, apiKey, model } = getAIConfig()
  if (!endpoint) throw new Error('请先配置 AI API 地址')

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export const AI_ACTIONS = [
  {
    id: 'title',
    name: '标题优化',
    icon: '✏️',
    description: '生成 3-5 个优化后的标题',
    prompt: '你是一个公众号标题优化专家。请根据用户提供的文章内容，生成 3-5 个吸引人的标题建议。每个标题独占一行，用数字编号。要求标题简洁有力，适合微信公众号传播。',
  },
  {
    id: 'summary',
    name: '摘要生成',
    icon: '📝',
    description: '生成 100 字以内的文章摘要',
    prompt: '你是一个内容摘要专家。请为用户提供的文章生成一段 100 字以内的摘要，适合作为微信公众号文章的摘要/副标题。要求简洁精炼，抓住核心要点。只输出摘要内容，不要其他说明。',
  },
  {
    id: 'format',
    name: '格式建议',
    icon: '📐',
    description: '分析文章结构并给出排版建议',
    prompt: '你是一个 Markdown 排版专家。请分析用户提供的 Markdown 文章，给出 3-5 条具体的格式优化建议（如：添加小标题、拆分长段落、使用列表、添加引用块等）。每条建议独占一行，用数字编号，要具体指出文章哪个部分需要改善。',
  },
  {
    id: 'polish',
    name: '润色全文',
    icon: '✨',
    description: '优化文章表达，保持原意',
    prompt: '你是一个中文写作润色专家。请对用户提供的 Markdown 文章进行润色，优化表达方式，使文章更流畅、更有感染力，但保持原意不变。保留 Markdown 格式。直接输出润色后的完整文章，不要其他说明。',
  },
]
