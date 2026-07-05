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

React 19 + Vite 5 + Tailwind CSS 3. No TypeScript, no router, no state management library — single-page app with useState/useRef. Markdown parsing via `markdown-it` with `highlight.js` for syntax highlighting and `@vscode/markdown-it-katex` for math.

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
- `DevicePreview` — desktop/phone/iPad preview tabs; phone and iPad render inside a shared scaled `DeviceShell` frame.
- `ThemeLab` — slide-out panel for editing wechat-based theme tokens (colors, sizes, radii)
- `Toast` — notification component

**Scroll sync:** Editor textarea and preview scroll area are linked via proportional ratio calculation in App.jsx (`syncScroll`), with a `scrollSyncSource` ref guard to prevent ping-pong loops. Only active in desktop preview mode; mobile shells scroll independently.

**Utilities (`src/utils/`):**
- `markdown.js` — markdown-it instance with highlight.js + KaTeX
- `clipboard.js` — rich text copy: `copyRichText` inlines computed styles for WeChat; `copyForZhihu` generates clean semantic HTML from markdown (Zhihu applies its own styles)
- `uploadImage.js` — image upload to `upload.payforchat.com` (R2 hosting) with canvas compression >2MB; `uploadAndInsertImage` handles the placeholder-insert → upload → replace flow with base64 fallback on failure
- `exportPdf.js` — print preview via hidden iframe (collects theme + KaTeX + hljs CSS)
- `file.js` — text file reader helper

**Image handling:** Pasted/dropped/toolbar-uploaded images upload to the R2 image host and the markdown references the returned public URL. On upload failure, falls back to inline base64 data URL so the image is not lost.

**Persistence:** Draft content, selected theme, and custom themes all saved to localStorage with debounced auto-save (3s).

## Branches

- `main` — production version, single nav bar layout
- `feat/atelier-redesign` — alternative design with floating toolbar, monospace editor font, warm color palette
