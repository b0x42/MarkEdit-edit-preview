# Feature Specification: Combined Edit-Preview Plugin for MarkEdit

**Created**: 2026-05-06
**Status**: Ready for Implementation

## Overview

A standalone MarkEdit plugin that provides a combined edit-preview mode — when the cursor is NOT on a line/block, Markdown syntax characters are hidden and the text appears rendered inline. When the cursor IS on a line, raw Markdown is revealed for editing. Similar to Typora/Zettlr.

## Architecture

### Plugin Type
- **MarkEdit extension** using the `markedit-api` (v0.22.0)
- Built as a single CJS file via Vite
- Installed to `~/Library/Containers/app.cyan.markedit/Data/Documents/scripts/`
- Activated via **Extensions menu item** (toggle on/off)

### Technical Approach
- **CodeMirror 6 ViewPlugin** with replace decorations that hide syntax markers on unfocused lines
- Uses `@lezer/markdown` syntax tree to identify Markdown nodes and their marker positions
- A **Compartment** to dynamically enable/disable the decorations
- Cursor/selection tracking to determine which lines show raw vs rendered
- Only decorates **visible viewport** (`view.visibleRanges`) for performance on large documents
- Extension registered immediately at script load time (not deferred via `onEditorReady`)

### Key Design Decision: Hide Markers (not render HTML)
Rather than replacing lines with rendered HTML widgets (heavy, complex cursor handling), we **hide syntax markers** using `Decoration.replace({})`. This means:
- `**bold**` → the `**` markers are hidden, text remains in the editor with existing CM6 syntax highlighting providing the bold styling
- `# Heading` → the `# ` is hidden, CM6's heading styles still apply
- `[link](url)` → the `[`, `](url)` parts are hidden, showing just the link text
- Fenced code blocks → the ``` lines are hidden when unfocused

This is lightweight, preserves cursor behavior, and works with all existing MarkEdit themes.

## Scope

### Supported Markdown Elements
- **Headings** (ATX `#` through `######`) — hide `# ` prefix
- **Bold/Italic** (`**`, `*`, `__`, `_`) — hide emphasis marks
- **Strikethrough** (`~~`) — hide strikethrough marks
- **Inline code** (`` ` ``) — hide code marks
- **Links** (`[text](url)`) — hide `[`, `](url)`, show just text
- **Images** (`![alt](url)`) — hide `![`, `](url)`, show alt text inline
- **Fenced code blocks** (` ``` `) — hide fence lines when unfocused
- **Blockquotes** (`>`) — hide quote marks
- **Unordered lists** (`-`, `*`, `+`) — replace with bullet `•`
- **Ordered lists** (`1.`, `2.`) — keep visible (no transformation)
- **Horizontal rules** (`---`, `***`) — replace with `<hr>` widget

### NOT in scope
- Math/KaTeX rendering
- Mermaid diagrams
- Tables (complex layout, leave as-is)

## User Interaction

### Activation
- **Extensions → Combined Edit-Preview** menu item (toggle)
- **Default state**: enabled on first load
- State persisted in `localStorage` — only saved when user explicitly disables
- Keyboard shortcut: configurable via `settings.json`

### Behavior
- When **enabled**: unfocused lines hide their Markdown syntax markers
- When **disabled**: normal editor behavior (all syntax visible)
- Cursor on a line → that line shows raw Markdown
- Selection spanning multiple lines → all selected lines show raw
- Multi-line structures (code fences, blockquotes) → entire block shows raw when cursor is on any line within it

### Edge Cases
- **Empty document**: behaves as normal editor (no decorations to apply)
- **Cursor at position 0**: first line shows raw, all others decorated
- **Nested formatting** (`**_bold italic_**`): all markers for the outermost element are hidden; inner elements handled recursively by the tree walker
- **Undo/redo**: decorations are view-only and don't affect document state — no interaction with undo history

## Configuration

Via MarkEdit's `settings.json`:

```json
{
  "extension.markeditCombinedMode": {
    "hotKey": {
      "key": "E",
      "modifiers": ["Command", "Shift"]
    }
  }
}
```

## File Structure

```
├── main.ts              # Entry point: menu item, toggle logic
├── src/
│   └── combined.ts      # ViewPlugin, decorations, compartment
├── package.json
├── tsconfig.json
├── vite.config.mts
└── README.md
```

## Build & Install

```bash
npm run build
# Output: dist/markedit-edit-preview.js
# Copy to: ~/Library/Containers/app.cyan.markedit/Data/Documents/scripts/
```

## Success Criteria

- Toggle on/off via Extensions menu without restart
- Syntax markers hidden on unfocused lines within 16ms (single frame)
- Cursor position preserved when lines transition between states
- Works with all built-in MarkEdit themes
- No interference with other MarkEdit extensions (including MarkEdit-preview)
- Single JS file output, no external dependencies at runtime

## References

- [MarkEdit API](https://github.com/MarkEdit-app/MarkEdit-api)
- [MarkEdit Customization Guide](https://github.com/MarkEdit-app/MarkEdit/wiki/Customization)
- [CodeMirror 6 Decorations](https://codemirror.net/docs/ref/#view.Decoration)
- [MarkEdit-preview combined.ts](https://github.com/MarkEdit-app/MarkEdit-preview/blob/main/src/combined.ts) — reference implementation
