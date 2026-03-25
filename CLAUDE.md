# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MarkCopy — a Markdown editor with live preview, designed for publishing to WeChat Official Accounts. Users write Markdown on the left, see styled preview on the right, and copy rich text to paste into the WeChat editor.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build

## Tech Stack

React 19 + Vite 5 + Tailwind CSS 3. No TypeScript, no router, no state management library — single-page app with useState/useRef. Markdown parsing via `markdown-it` with `highlight.js` for syntax highlighting.

## Architecture

Single-page app centered on `App.jsx` which owns all state and layout. No routing.

**Layout (single nav bar):** `App.jsx` renders one top bar containing: Logo | EditorToolbar | word count | upload/export | ThemeBar | copy button. Below that, editor (left 45%) and preview (right 55%) fill the remaining viewport height.

**Data flow:** `App.jsx` holds markdown string → `parseMarkdown()` converts to HTML → `Preview` component renders HTML with theme CSS injected via `<style>`.

**Theme system** (`src/themes/index.js`):
- Built-in themes are plain CSS strings (GitHub, Notion, Juejin, etc.)
- WeChat-family themes use a **token system**: a `tokens` object (palette, typography, layout, effects) is compiled into CSS via `buildWechatCss()`. This enables the ThemeLab UI for user customization.
- `createCustomWechatTheme()` builds a theme from user-saved tokens. Custom themes persist in localStorage.
- All themes target `.preview-body` class selectors.
- Theme selection UI: 4 popular themes shown as flat pill buttons, remaining themes in a "更多" dropdown rendered via `createPortal` to `document.body` (to escape `backdrop-filter` containing blocks).

**Key components:**
- `Editor` — textarea only (no header/toolbar, those are in App.jsx). Handles drag-drop and paste for .md files and images.
- `EditorToolbar` — inline formatting buttons (B/I/H1-H3/lists/link/image/code/quote/hr). Rendered inside the nav bar in App.jsx.
- `Preview` — renders parsed HTML with theme CSS. Contains `Preview.ThemeBar` static component for theme selection.
- `ThemeLab` — slide-out panel for editing wechat-based theme tokens (colors, sizes, radii)
- `AIPanel` — AI-powered features (title optimization, summary, polish) via configurable OpenAI-compatible API endpoint
- `Toast` — notification component

**Scroll sync:** Editor textarea and preview scroll area are linked via proportional ratio calculation in App.jsx, with a `scrollSyncSource` ref guard to prevent ping-pong loops.

**Utilities (`src/utils/`):**
- `markdown.js` — markdown-it instance with highlight.js; resolves in-editor image IDs (e.g., `img-1`) to base64 data URLs
- `clipboard.js` — rich text copy (copies styled HTML to clipboard for pasting into WeChat editor)
- `exportImage.js` — export preview as image
- `ai.js` — AI config (endpoint/key/model in localStorage) and request helper; defines AI action prompts

**Image handling:** Pasted/uploaded images are stored as base64 in a `Map` (ref in App), referenced in markdown as `![name](img-N)`, resolved at render time.

**Persistence:** Draft content, selected theme, and custom themes all saved to localStorage with debounced auto-save (3s).

## Branches

- `main` — production version, single nav bar layout
- `feat/atelier-redesign` — alternative design with floating toolbar, monospace editor font, warm color palette
