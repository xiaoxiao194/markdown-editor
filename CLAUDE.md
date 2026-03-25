# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MarkCopy — a Markdown editor with live preview, designed for publishing to Chinese content platforms (WeChat Official Accounts, Zhihu, Juejin). Users write Markdown on the left, see styled preview on the right, and copy rich text to paste into platform editors.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build

## Tech Stack

React 19 + Vite 5 + Tailwind CSS 3. No TypeScript, no router, no state management library — single-page app with useState/useRef. Markdown parsing via `markdown-it` with `highlight.js` for syntax highlighting.

## Architecture

Single-page app centered on `App.jsx` which owns all state (markdown text, theme selection, custom themes, ThemeLab state). No routing.

**Data flow:** `App.jsx` holds markdown string → `parseMarkdown()` converts to HTML → `Preview` component renders HTML with theme CSS injected via `<style>`.

**Theme system** (`src/themes/index.js`):
- Built-in themes are plain CSS strings (GitHub, Notion, Juejin, etc.)
- WeChat-family themes use a **token system**: a `tokens` object (palette, typography, layout, effects) is compiled into CSS via `buildWechatCss()`. This enables the ThemeLab UI for user customization.
- `createCustomWechatTheme()` builds a theme from user-saved tokens. Custom themes persist in localStorage.
- All themes target `.preview-body` class selectors.

**Key components:**
- `Editor` — textarea with toolbar (bold, heading, list insertions), file upload, word count
- `Preview` — renders parsed HTML, theme selector dropdown, copy button
- `ThemeLab` — slide-out panel for editing wechat-based theme tokens (colors, sizes, radii)
- `AIPanel` — AI-powered features (title optimization, summary, polish) via configurable OpenAI-compatible API endpoint
- `Toast` — notification component

**Utilities (`src/utils/`):**
- `markdown.js` — markdown-it instance with highlight.js; resolves in-editor image IDs (e.g., `img-1`) to base64 data URLs
- `clipboard.js` — rich text copy (copies styled HTML to clipboard for pasting into WeChat editor)
- `exportImage.js` — export preview as image
- `ai.js` — AI config (endpoint/key/model in localStorage) and request helper; defines AI action prompts

**Image handling:** Pasted/uploaded images are stored as base64 in a `Map` (ref in App), referenced in markdown as `![name](img-N)`, resolved at render time.

**Persistence:** Draft content, selected theme, and custom themes all saved to localStorage with debounced auto-save.
