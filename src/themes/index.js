// 主题定义：每个主题提供一套注入到预览区域的 CSS 字符串

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val)

const hexToRgba = (hex, alpha = 1) => {
  let sanitized = hex.replace('#', '')
  if (sanitized.length === 3) {
    sanitized = sanitized.split('').map((c) => c + c).join('')
  }
  const num = parseInt(sanitized, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const deepMerge = (base, updates = {}) => {
  const clone = Array.isArray(base) ? [...base] : { ...base }
  for (const key of Object.keys(updates || {})) {
    const value = updates[key]
    if (isObject(value) && isObject(base?.[key])) {
      clone[key] = deepMerge(base[key], value)
    } else {
      clone[key] = value
    }
  }
  return clone
}

export const DEFAULT_WECHAT_TOKENS = {
  palette: {
    primary: '#07c160',
    accent: '#0bb58b',
    heading: '#101110',
    body: '#2b2d33',
    strong: '#0c8d4b',
    background: '#ffffff',
    codeBg: '#111111',
    codeText: '#f0fff2',
  },
  typography: {
    fontFamily: '-apple-system, "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    bodySize: 16,
    heading1Size: 2,
    heading2Size: 1.35,
    heading3Size: 1.15,
    lineHeight: 1.9,
  },
  layout: {
    contentWidth: 660,
    radius: 22,
    imageRadius: 22,
    codeRadius: 18,
  },
  effects: {
    imageShadow: '0 25px 45px rgba(11,28,18,0.18)',
    codeShadow: '0 25px 40px rgba(5,10,5,0.35)',
  },
}

const buildWechatCss = (rawTokens = DEFAULT_WECHAT_TOKENS) => {
  const tokens = deepMerge(DEFAULT_WECHAT_TOKENS, rawTokens)
  const { palette, typography, layout, effects } = tokens
  const contentWidth = clamp(layout.contentWidth ?? 660, 560, 780)
  const radius = clamp(layout.radius ?? 22, 8, 32)
  const bodySize = clamp(typography.bodySize ?? 16, 14, 18)
  const lineHeight = clamp(typography.lineHeight ?? 1.9, 1.6, 2.1)
  const h1 = clamp(typography.heading1Size ?? 2, 1.6, 2.6)
  const h2 = clamp(typography.heading2Size ?? 1.35, 1.1, 2)
  const h3 = clamp(typography.heading3Size ?? 1.15, 1, 1.6)
  const fontFamily = typography.fontFamily || DEFAULT_WECHAT_TOKENS.typography.fontFamily

  const subtleBg = hexToRgba(palette.primary, 0.08)
  const gradientBg = `linear-gradient(90deg, ${hexToRgba(palette.primary, 0.14)}, transparent)`
  const dotGlow = `0 0 0 4px ${hexToRgba(palette.primary, 0.15)}`

  return `
      .preview-body { font-family: ${fontFamily}; font-size: ${bodySize}px; line-height: ${lineHeight}; color: ${palette.body}; background: transparent; padding: 0; width: 100%; }
      .preview-body > * { max-width: ${contentWidth}px; margin-left: auto; margin-right: auto; }
      .preview-body h1 { font-size: ${h1}em; font-weight: 800; margin: 0 0 0.8em; text-align: center; color: ${palette.heading}; letter-spacing: 0.02em; line-height: 1.35; }
      .preview-body h2 { font-size: ${h2}em; font-weight: 700; margin: 1.6em auto 0.8em; color: ${palette.heading}; padding-left: 14px; border-left: 4px solid ${palette.primary}; background: ${gradientBg}; border-radius: 0 ${radius / 2}px ${radius / 2}px 0; }
      .preview-body h3 { font-size: ${h3}em; font-weight: 600; margin: 1.25em auto 0.6em; color: ${palette.heading}; position: relative; padding-left: 16px; }
      .preview-body h3::before { content: \"\"; width: 8px; height: 8px; border-radius: 50%; background: ${palette.primary}; position: absolute; left: 0; top: 0.5em; box-shadow: ${dotGlow}; }
      .preview-body p { margin: 0 auto 1.15em; text-align: justify; color: ${palette.body}; line-height: ${lineHeight}; }
      .preview-body strong { color: ${palette.strong}; }
      .preview-body em { color: ${hexToRgba(palette.primary, 0.75)}; font-style: normal; border-bottom: 1px dashed ${hexToRgba(palette.primary, 0.4)}; }
      .preview-body a { color: ${palette.primary}; text-decoration: none; border-bottom: 1px solid ${hexToRgba(palette.primary, 0.4)}; transition: color 0.2s ease; }
      .preview-body a:hover { color: ${palette.accent}; }
      .preview-body code { font-family: "JetBrains Mono", Consolas, monospace; font-size: 90%; background: ${hexToRgba(palette.primary, 0.08)}; padding: 0.25em 0.45em; border-radius: 6px; color: #c7254e; border: 1px solid ${hexToRgba(palette.primary, 0.1)}; }
      .preview-body pre { background: ${palette.codeBg}; color: ${palette.codeText}; padding: 18px 20px; border-radius: ${layout.codeRadius ?? 18}px; margin: 0 auto 1.4em; box-shadow: ${effects.codeShadow}; }
      .preview-body pre code { background: none; border: none; padding: 0; color: inherit; font-size: 95%; }
      .preview-body blockquote { margin: 0 auto 1.2em; padding: 16px 18px; border-left: 4px solid ${palette.primary}; background: ${subtleBg}; border-radius: 0 ${radius}px ${radius}px 0; color: #4e5d52; font-style: normal; }
      .preview-body ul, .preview-body ol { margin: 0 auto 1.1em; padding-left: 0; }
      .preview-body ul { list-style: none; }
      .preview-body ul li { margin: 0.6em 0; padding-left: 1.4em; position: relative; }
      .preview-body ul li::before { content: \"\"; width: 8px; height: 8px; border-radius: 50%; background: ${palette.primary}; position: absolute; left: 0; top: 0.6em; box-shadow: ${dotGlow}; }
      .preview-body ol { counter-reset: wechat-ol; list-style: none; }
      .preview-body ol li { margin: 0.65em 0; padding-left: 1.4em; position: relative; counter-increment: wechat-ol; }
      .preview-body ol li::before { content: counter(wechat-ol) "."; position: absolute; left: 0; top: 0; color: ${palette.primary}; font-weight: 600; }
      .preview-body table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 0 auto 1.2em; border: 1px solid ${hexToRgba(palette.primary, 0.15)}; border-radius: ${radius}px; overflow: hidden; box-shadow: inset 0 0 0 1px ${hexToRgba(palette.primary, 0.05)}; }
      .preview-body th, .preview-body td { padding: 12px 16px; border-bottom: 1px solid ${hexToRgba(palette.primary, 0.08)}; background: ${palette.background}; }
      .preview-body th { background: ${hexToRgba(palette.primary, 0.12)}; font-weight: 600; color: ${palette.heading}; }
      .preview-body tr:last-child td { border-bottom: none; }
      .preview-body img { max-width: 100%; border-radius: ${layout.imageRadius ?? 22}px; display: block; margin: 1.2em auto; box-shadow: ${effects.imageShadow}; }
      .preview-body hr { border: none; height: 1px; margin: 2em auto; width: 60%; background: linear-gradient(90deg, transparent, ${hexToRgba(palette.primary, 0.5)}, transparent); }
    `
}

const buildWechatTheme = (overrides = {}) => {
  const tokens = deepMerge(DEFAULT_WECHAT_TOKENS, overrides.tokens || {})
  return {
    ...overrides,
    tokens,
    css: buildWechatCss(tokens),
    meta: { base: 'wechat', customizable: true },
  }
}

export const createCustomWechatTheme = ({ id, name, tokens }) => {
  return {
    id,
    name,
    ...buildWechatTheme({ tokens }),
    isCustom: true,
  }
}

export const builtInThemes = {
  github: {
    id: 'github',
    name: 'GitHub',
    css: `
      .preview-body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.75; color: #1f2328; background: #fff; padding: 24px; }
      .preview-body h1 { font-size: 2em; font-weight: 600; margin: 0 0 16px; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
      .preview-body h2 { font-size: 1.5em; font-weight: 600; margin: 24px 0 16px; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
      .preview-body h3 { font-size: 1.25em; font-weight: 600; margin: 24px 0 16px; }
      .preview-body h4, .preview-body h5, .preview-body h6 { font-weight: 600; margin: 24px 0 16px; }
      .preview-body p { margin: 0 0 16px; }
      .preview-body a { color: #0969da; text-decoration: none; }
      .preview-body a:hover { text-decoration: underline; }
      .preview-body strong { font-weight: 600; color: #1f2328; }
      .preview-body code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 85%; background: rgba(175,184,193,0.2); padding: 0.2em 0.4em; border-radius: 6px; }
      .preview-body pre { background: #161b22; border-radius: 6px; padding: 16px; overflow: auto; margin: 0 0 16px; }
      .preview-body pre code { background: none; padding: 0; font-size: 85%; color: #e6edf3; }
      .preview-body blockquote { margin: 0 0 16px; padding: 0 1em; color: #656d76; border-left: 3px solid #d1d9e0; }
      .preview-body ul, .preview-body ol { padding-left: 2em; margin: 0 0 16px; }
      .preview-body li { margin: 4px 0; }
      .preview-body li + li { margin-top: 4px; }
      .preview-body table { border-collapse: collapse; width: 100%; margin: 0 0 16px; }
      .preview-body th, .preview-body td { border: 1px solid #d1d9e0; padding: 6px 13px; }
      .preview-body th { background: #f6f8fa; font-weight: 600; }
      .preview-body tr:nth-child(even) { background: #f6f8fa; }
      .preview-body img { max-width: 100%; border-radius: 6px; }
      .preview-body hr { border: none; height: 4px; background: #d1d9e0; border-radius: 2px; margin: 24px 0; }
    `,
  },
  wechat: buildWechatTheme({ id: 'wechat', name: '微信风格' }),
  wechat_fresh: buildWechatTheme({
    id: 'wechat_fresh',
    name: '微信清新',
    tokens: {
      palette: {
        primary: '#00b894',
        accent: '#47e0bd',
        heading: '#00916e',
        body: '#2d3436',
        strong: '#00916e',
        background: '#ffffff',
        codeBg: '#10261f',
        codeText: '#befae3',
      },
      typography: {
        bodySize: 15.5,
        heading1Size: 1.7,
        heading2Size: 1.35,
        heading3Size: 1.12,
        lineHeight: 1.88,
        fontFamily: '-apple-system, "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      },
      layout: {
        contentWidth: 640,
        radius: 20,
        imageRadius: 26,
        codeRadius: 20,
      },
      effects: {
        imageShadow: '0 20px 35px rgba(0,184,148,0.18)',
        codeShadow: '0 22px 40px rgba(16,38,31,0.55)',
      },
    },
  }),
  wechat_business: buildWechatTheme({
    id: 'wechat_business',
    name: '微信商务',
    tokens: {
      palette: {
        primary: '#1a4480',
        accent: '#c9a227',
        heading: '#1a202c',
        body: '#1f2933',
        strong: '#1a4480',
        background: '#f7f8fb',
        codeBg: '#1a202c',
        codeText: '#a0aec0',
      },
      typography: {
        bodySize: 15.2,
        heading1Size: 1.8,
        heading2Size: 1.3,
        heading3Size: 1.12,
        lineHeight: 1.88,
        fontFamily: '-apple-system, "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      },
      layout: {
        contentWidth: 680,
        radius: 18,
        imageRadius: 20,
        codeRadius: 16,
      },
      effects: {
        imageShadow: '0 25px 45px rgba(26,68,128,0.18)',
        codeShadow: '0 25px 45px rgba(0,0,0,0.35)',
      },
    },
  }),
  notion: {
    name: 'Notion 风格',
    css: `
      .preview-body { font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 16px; line-height: 1.65; color: #37352f; background: #fff; padding: 24px; max-width: 720px; margin: 0 auto; }
      .preview-body h1 { font-size: 1.875em; font-weight: 700; margin: 1.4em 0 0.4em; }
      .preview-body h2 { font-size: 1.5em; font-weight: 600; margin: 1.2em 0 0.4em; }
      .preview-body h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0 0.4em; }
      .preview-body p { margin: 0 0 0.8em; }
      .preview-body a { color: #2eaadc; text-decoration: underline; }
      .preview-body code { font-family: "SFMono-Regular", monospace; font-size: 85%; background: #f1f1ef; padding: 0.2em 0.4em; border-radius: 3px; color: #eb5757; }
      .preview-body pre { background: #f7f6f3; border-radius: 4px; padding: 16px; overflow: auto; margin: 0 0 1em; }
      .preview-body pre code { background: none; color: #37352f; padding: 0; }
      .preview-body blockquote { margin: 0 0 1em; padding: 4px 16px; border-left: 3px solid #37352f; color: #6b6b6b; }
      .preview-body ul { list-style: disc; padding-left: 1.5em; margin: 0 0 0.8em; }
      .preview-body ol { padding-left: 1.5em; margin: 0 0 0.8em; }
      .preview-body li { margin: 4px 0; }
      .preview-body table { border-collapse: collapse; width: 100%; margin: 0 0 1em; }
      .preview-body th, .preview-body td { border: 1px solid #e9e9e7; padding: 8px 12px; }
      .preview-body th { background: #f7f6f3; font-weight: 600; }
      .preview-body img { max-width: 100%; border-radius: 4px; }
      .preview-body hr { border: none; border-top: 1px solid #e9e9e7; margin: 20px 0; }
    `,
  },
  juejin: {
    name: '掘金风格',
    css: `
      .preview-body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; font-size: 16px; line-height: 1.75; color: #252933; background: #fff; padding: 24px; }
      .preview-body h1 { font-size: 1.8em; font-weight: 700; margin: 0 0 1em; color: #1d2129; border-bottom: 1px solid #e5e6eb; padding-bottom: 0.4em; }
      .preview-body h2 { font-size: 1.4em; font-weight: 700; margin: 1.4em 0 0.6em; color: #1d2129; border-bottom: 1px solid #e5e6eb; padding-bottom: 0.3em; }
      .preview-body h3 { font-size: 1.15em; font-weight: 600; margin: 1.2em 0 0.5em; color: #1d2129; }
      .preview-body h4, .preview-body h5, .preview-body h6 { margin: 1em 0 0.5em; color: #1d2129; }
      .preview-body p { margin: 0 0 1em; }
      .preview-body a { color: #1e80ff; text-decoration: none; }
      .preview-body a:hover { text-decoration: underline; }
      .preview-body strong { color: #1d2129; }
      .preview-body code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 85%; background: #f2f3f5; padding: 0.2em 0.4em; border-radius: 4px; color: #e3614f; }
      .preview-body pre { background: #1e2330; border-radius: 8px; padding: 16px; overflow: auto; margin: 0 0 1em; }
      .preview-body pre code { background: none; padding: 0; color: #abb2bf; font-size: 90%; }
      .preview-body blockquote { margin: 0 0 1em; padding: 12px 16px; background: #f2f8ff; border-left: 4px solid #1e80ff; border-radius: 0 6px 6px 0; color: #4e5969; }
      .preview-body ul, .preview-body ol { padding-left: 1.5em; margin: 0 0 1em; }
      .preview-body li { margin: 6px 0; }
      .preview-body table { border-collapse: collapse; width: 100%; margin: 0 0 1em; }
      .preview-body th, .preview-body td { border: 1px solid #e5e6eb; padding: 8px 13px; }
      .preview-body th { background: #f2f3f5; font-weight: 600; color: #1d2129; }
      .preview-body tr:nth-child(even) { background: #f9f9fa; }
      .preview-body img { max-width: 100%; border-radius: 6px; }
      .preview-body hr { border: none; border-top: 1px solid #e5e6eb; margin: 24px 0; }
    `,
  },
  dark: {
    name: '暗色主题',
    css: `
      .preview-body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 16px; line-height: 1.7; color: #cdd6f4; background: #1e1e2e; padding: 24px; }
      .preview-body h1 { font-size: 1.8em; font-weight: 700; margin: 0 0 0.8em; color: #cba6f7; border-bottom: 1px solid #313244; padding-bottom: 0.3em; }
      .preview-body h2 { font-size: 1.4em; font-weight: 600; margin: 1.4em 0 0.6em; color: #89b4fa; border-bottom: 1px solid #313244; padding-bottom: 0.2em; }
      .preview-body h3 { font-size: 1.15em; font-weight: 600; margin: 1.2em 0 0.5em; color: #89dceb; }
      .preview-body h4, .preview-body h5, .preview-body h6 { margin: 1em 0 0.5em; color: #a6e3a1; }
      .preview-body p { margin: 0 0 1em; }
      .preview-body a { color: #89b4fa; text-decoration: none; }
      .preview-body a:hover { text-decoration: underline; }
      .preview-body strong { color: #f38ba8; }
      .preview-body em { color: #f9e2af; font-style: italic; }
      .preview-body code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 85%; background: #313244; padding: 0.2em 0.4em; border-radius: 4px; color: #f38ba8; }
      .preview-body pre { background: #181825; border-radius: 8px; padding: 16px; overflow: auto; margin: 0 0 1em; border: 1px solid #313244; }
      .preview-body pre code { background: none; padding: 0; color: #cdd6f4; font-size: 90%; }
      .preview-body blockquote { margin: 0 0 1em; padding: 12px 16px; background: #181825; border-left: 4px solid #cba6f7; color: #a6adc8; border-radius: 0 6px 6px 0; }
      .preview-body ul, .preview-body ol { padding-left: 1.5em; margin: 0 0 1em; }
      .preview-body li { margin: 6px 0; }
      .preview-body table { border-collapse: collapse; width: 100%; margin: 0 0 1em; }
      .preview-body th, .preview-body td { border: 1px solid #313244; padding: 8px 13px; }
      .preview-body th { background: #181825; font-weight: 600; color: #cba6f7; }
      .preview-body tr:nth-child(even) { background: #181825; }
      .preview-body img { max-width: 100%; border-radius: 6px; border: 1px solid #313244; }
      .preview-body hr { border: none; border-top: 1px solid #313244; margin: 24px 0; }
    `,
  },
  xiaohongshu: {
    name: '小红书风格',
    css: `
      .preview-body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; font-size: 15px; line-height: 1.8; color: #333; background: #fff; padding: 24px; }
      .preview-body h1 { font-size: 1.5em; font-weight: 700; margin: 0 0 0.8em; color: #fff; background: linear-gradient(135deg, #ff2442, #ff6b81); padding: 12px 18px; border-radius: 12px; text-align: center; }
      .preview-body h2 { font-size: 1.2em; font-weight: 700; margin: 1.4em 0 0.6em; color: #ff2442; display: flex; align-items: center; gap: 6px; }
      .preview-body h2::before { content: "✦"; font-size: 0.9em; }
      .preview-body h3 { font-size: 1.05em; font-weight: 600; margin: 1em 0 0.5em; color: #ff6b81; }
      .preview-body p { margin: 0 0 0.9em; }
      .preview-body a { color: #ff2442; text-decoration: none; }
      .preview-body strong { color: #ff2442; font-weight: 700; }
      .preview-body em { color: #ff6b81; font-style: normal; font-weight: 600; }
      .preview-body code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 85%; background: #fff0f3; padding: 0.2em 0.5em; border-radius: 6px; color: #ff2442; border: 1px solid #ffccd5; }
      .preview-body pre { background: #fff0f3; border-radius: 12px; padding: 16px; overflow: auto; margin: 0 0 1em; border: 1px solid #ffccd5; }
      .preview-body pre code { background: none; border: none; padding: 0; color: #c0392b; }
      .preview-body blockquote { margin: 0 0 1em; padding: 12px 16px; background: #fff0f3; border-left: 4px solid #ff2442; border-radius: 0 12px 12px 0; color: #666; font-style: italic; }
      .preview-body ul { list-style: none; padding-left: 0; margin: 0 0 1em; }
      .preview-body ul li::before { content: "🌸 "; }
      .preview-body ol { padding-left: 1.5em; margin: 0 0 1em; }
      .preview-body li { margin: 6px 0; }
      .preview-body table { border-collapse: collapse; width: 100%; margin: 0 0 1em; border-radius: 8px; overflow: hidden; }
      .preview-body th, .preview-body td { border: 1px solid #ffccd5; padding: 8px 13px; }
      .preview-body th { background: #ff2442; color: #fff; font-weight: 600; }
      .preview-body tr:nth-child(even) { background: #fff8f9; }
      .preview-body img { max-width: 100%; border-radius: 12px; box-shadow: 0 4px 16px rgba(255,36,66,0.15); }
      .preview-body hr { border: none; border-top: 2px dashed #ffccd5; margin: 20px 0; }
    `,
  },
  minimalist: {
    name: '极简',
    css: `
      .preview-body { font-family: -apple-system, "PingFang SC", "Helvetica Neue", sans-serif; font-size: 16px; line-height: 1.9; color: #3a3a3a; background: #fff; padding: 32px; max-width: 680px; margin: 0 auto; }
      .preview-body h1 { font-size: 1.8em; font-weight: 600; margin: 0 0 1em; color: #1a1a1a; letter-spacing: -0.01em; }
      .preview-body h2 { font-size: 1.35em; font-weight: 600; margin: 2em 0 0.8em; color: #1a1a1a; }
      .preview-body h3 { font-size: 1.1em; font-weight: 600; margin: 1.6em 0 0.6em; color: #1a1a1a; }
      .preview-body p { margin: 0 0 1.2em; }
      .preview-body a { color: #3a3a3a; text-decoration: underline; text-underline-offset: 3px; }
      .preview-body strong { color: #1a1a1a; font-weight: 600; }
      .preview-body code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 85%; background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; color: #555; }
      .preview-body pre { background: #f8f8f8; border: 1px solid #eee; border-radius: 4px; padding: 16px; overflow: auto; margin: 0 0 1.4em; }
      .preview-body pre code { background: none; border: none; padding: 0; color: #3a3a3a; }
      .preview-body blockquote { margin: 0 0 1.2em; padding: 0 0 0 16px; border-left: 2px solid #ddd; color: #888; }
      .preview-body ul, .preview-body ol { padding-left: 1.5em; margin: 0 0 1.2em; }
      .preview-body li { margin: 6px 0; }
      .preview-body table { border-collapse: collapse; width: 100%; margin: 0 0 1.4em; }
      .preview-body th, .preview-body td { border-bottom: 1px solid #eee; padding: 10px 12px; text-align: left; }
      .preview-body th { font-weight: 600; color: #1a1a1a; }
      .preview-body img { max-width: 100%; border-radius: 2px; }
      .preview-body hr { border: none; border-top: 1px solid #eee; margin: 2.5em 0; }
    `,
  },
  techblog: buildWechatTheme({
    id: 'techblog',
    name: '技术博客',
    tokens: {
      palette: {
        primary: '#2563eb',
        accent: '#3b82f6',
        heading: '#111827',
        body: '#374151',
        strong: '#1e40af',
        background: '#ffffff',
        codeBg: '#1e293b',
        codeText: '#e2e8f0',
      },
      typography: {
        bodySize: 15.5,
        heading1Size: 1.9,
        heading2Size: 1.4,
        heading3Size: 1.15,
        lineHeight: 1.8,
        fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      },
      layout: {
        contentWidth: 700,
        radius: 12,
        imageRadius: 10,
        codeRadius: 10,
      },
      effects: {
        imageShadow: '0 10px 30px rgba(37,99,235,0.12)',
        codeShadow: '0 15px 35px rgba(15,23,42,0.4)',
      },
    },
  }),
  literary: buildWechatTheme({
    id: 'literary',
    name: '文艺清新',
    tokens: {
      palette: {
        primary: '#d4a574',
        accent: '#c17f59',
        heading: '#5c4033',
        body: '#4a4a4a',
        strong: '#8b5e3c',
        background: '#faf8f5',
        codeBg: '#3c2f24',
        codeText: '#e8d5c4',
      },
      typography: {
        bodySize: 16,
        heading1Size: 1.8,
        heading2Size: 1.35,
        heading3Size: 1.12,
        lineHeight: 2,
        fontFamily: '"Noto Serif SC", Georgia, "Times New Roman", serif',
      },
      layout: {
        contentWidth: 640,
        radius: 24,
        imageRadius: 20,
        codeRadius: 16,
      },
      effects: {
        imageShadow: '0 20px 40px rgba(92,64,51,0.15)',
        codeShadow: '0 20px 40px rgba(60,47,36,0.4)',
      },
    },
  }),
  print: {
    name: '印刷/书籍',
    css: `
      .preview-body { font-family: "Georgia", "Times New Roman", "Noto Serif SC", serif; font-size: 17px; line-height: 1.9; color: #1a1a1a; background: #fdfaf5; padding: 40px 48px; max-width: 700px; margin: 0 auto; }
      .preview-body h1 { font-size: 2em; font-weight: 700; margin: 0 0 0.6em; color: #111; text-align: center; letter-spacing: 0.05em; border-bottom: 2px solid #1a1a1a; padding-bottom: 0.4em; }
      .preview-body h2 { font-size: 1.4em; font-weight: 700; margin: 1.8em 0 0.6em; color: #111; letter-spacing: 0.03em; }
      .preview-body h3 { font-size: 1.15em; font-weight: 700; margin: 1.4em 0 0.5em; color: #111; font-style: italic; }
      .preview-body p { margin: 0 0 1.1em; text-align: justify; text-indent: 2em; }
      .preview-body a { color: #1a1a1a; text-decoration: underline; }
      .preview-body strong { font-weight: 700; }
      .preview-body em { font-style: italic; }
      .preview-body code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 82%; background: #f0ebe0; padding: 0.15em 0.4em; border-radius: 2px; }
      .preview-body pre { background: #f0ebe0; border-left: 3px solid #1a1a1a; padding: 16px 20px; overflow: auto; margin: 0 0 1.2em; border-radius: 0; }
      .preview-body pre code { background: none; padding: 0; font-size: 88%; }
      .preview-body blockquote { margin: 1em 2em; padding: 0 0 0 1.2em; border-left: 3px solid #999; color: #555; font-style: italic; }
      .preview-body ul, .preview-body ol { padding-left: 2em; margin: 0 0 1em; }
      .preview-body li { margin: 4px 0; }
      .preview-body table { border-collapse: collapse; width: 100%; margin: 0 0 1.2em; font-size: 15px; }
      .preview-body th, .preview-body td { border: 1px solid #ccc; padding: 8px 14px; }
      .preview-body th { background: #f0ebe0; font-weight: 700; text-align: left; }
      .preview-body img { max-width: 100%; display: block; margin: 1em auto; }
      .preview-body hr { border: none; border-top: 1px solid #aaa; margin: 32px 0; }
    `,
  },
  hongfei: {
    id: 'hongfei',
    name: '红绯丹彩',
    css: `
      .preview-body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; font-size: 16px; line-height: 1.8; color: #333; background: #fff; padding: 24px; }
      .preview-body h1 { font-size: 1.6em; font-weight: 700; margin: 0 0 1em; color: #000; text-align: center; }
      .preview-body h2 { font-size: 1.3em; font-weight: 700; margin: 1.6em 0 0.8em; color: #000; padding-left: 12px; border-left: 4px solid #e64a19; }
      .preview-body h3 { font-size: 1.1em; font-weight: 700; margin: 1.4em 0 0.6em; color: #000; padding-left: 12px; border-left: 4px solid #e64a19; }
      .preview-body h4 { font-size: 1em; font-weight: 700; margin: 1.2em 0 0.5em; color: #000; }
      .preview-body p { margin: 0 0 1em; text-align: justify; }
      .preview-body a { color: #e64a19; text-decoration: none; border-bottom: 1px solid #e64a19; }
      .preview-body a:hover { color: #bf360c; }
      .preview-body strong { color: #e64a19; font-weight: 700; }
      .preview-body em { font-style: italic; color: #555; }
      .preview-body code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 85%; background: #fff5f0; padding: 0.2em 0.4em; border-radius: 3px; color: #e64a19; }
      .preview-body pre { background: #2b2b2b; border-radius: 6px; padding: 16px; overflow: auto; margin: 0 0 1em; }
      .preview-body pre code { background: none; padding: 0; color: #a9b7c6; font-size: 90%; }
      .preview-body blockquote { margin: 0 0 1em; padding: 12px 16px; border-left: 4px solid #e64a19; background: #fff5f0; border-radius: 0 4px 4px 0; color: #666; }
      .preview-body ul, .preview-body ol { padding-left: 1.5em; margin: 0 0 1em; }
      .preview-body li { margin: 6px 0; }
      .preview-body table { border-collapse: collapse; width: 100%; margin: 0 0 1em; }
      .preview-body th, .preview-body td { border: 1px solid #e0e0e0; padding: 8px 13px; }
      .preview-body th { background: #fff5f0; font-weight: 600; color: #333; }
      .preview-body tr:nth-child(even) { background: #fafafa; }
      .preview-body img { max-width: 100%; border-radius: 4px; display: block; margin: 1em auto; }
      .preview-body hr { border: none; border-top: 1px solid #e0e0e0; margin: 24px 0; }
    `,
  },
}

export const themes = builtInThemes
export const themeList = Object.keys(builtInThemes)
