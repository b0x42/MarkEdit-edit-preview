# Implementation Plan: Table Rendering

**Branch**: `main` | **Date**: 2026-05-06 | **Spec**: `specs/002-table-rendering/spec.md`
**Input**: Feature specification from `/specs/002-table-rendering/spec.md`

## Summary

Add table rendering to the combined edit-preview plugin. When the cursor is not inside a table, replace the entire table block with a widget that displays content as a clean aligned grid (no pipes, no separator row). Reveal raw Markdown when cursor enters any line of the table.

## Technical Context

**Language/Version**: TypeScript 5.8.3
**Primary Dependencies**: @codemirror/view (WidgetType, Decoration.replace), @lezer/markdown (GFM Table extension)
**Storage**: N/A (no new persistence)
**Testing**: Vitest + jsdom
**Target Platform**: macOS (MarkEdit desktop app)
**Project Type**: Browser extension (MarkEdit plugin)
**Performance Goals**: Table widget rendered within 16ms for visible viewport
**Constraints**: Single CJS output, no runtime dependencies, must not break existing decorations
**Scale/Scope**: Tables up to ~100 rows in visible viewport

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Non-Breaking Extension | ✅ PASS | Table rendering is additive — only activates when combined mode is enabled. Existing decorations unchanged. |
| II. Lint & Test Gate | ✅ Will satisfy | New tests required for table decoration logic. |

## Project Structure

### Documentation (this feature)

```text
specs/002-table-rendering/
├── plan.md              # This file
├── research.md          # Phase 0 output
└── data-model.md        # Phase 1 output
```

### Source Code (changes to existing files)

```text
├── src/
│   └── combined.ts      # Add Table case to buildDecorations switch
├── tests/
│   └── combined.test.ts # Add table rendering tests
```

**Structure Decision**: No new files needed. Table rendering is a new `case` in the existing `buildDecorations` function, plus a new `TableWidget` class.

## Phase 0: Research

### R1: Lezer Markdown Table Node Structure

**Decision**: The `@lezer/markdown` GFM extension provides these nodes:
- `Table` — block-level container for the entire table
- `TableHeader` — first row (header cells)
- `TableDelimiter` — separator row (`|---|---|`)
- `TableRow` — body rows
- `TableCell` — individual cells within header/rows

**Rationale**: Confirmed by reading `node_modules/@lezer/markdown/src/extension.ts`. The GFM extension is already loaded by MarkEdit's markdown language support.

**Alternatives considered**: Regex-based table parsing — rejected, Lezer tree is authoritative.

### R2: Decoration Strategy for Tables

**Decision**: Use `Decoration.replace({ widget: tableWidget })` to replace the entire `Table` node range with a `TableWidget` that renders an HTML `<table>` element. This differs from other elements (which just hide markers) because tables need structural layout.

**Rationale**: Unlike headings or bold where hiding markers leaves readable text, hiding pipes from a table leaves unaligned text fragments. A widget is necessary to provide proper grid layout.

**Alternatives considered**:
- Hide pipes only (like other markers): Results in misaligned text, unreadable
- CSS grid on existing text: Can't control layout without widget since content positions change

### R3: Table Parsing from Raw Text

**Decision**: Parse table content from the document text within the `Table` node range. Extract:
1. Header cells (from `TableHeader` children `TableCell` nodes)
2. Alignment (from `TableDelimiter` content — `:---`, `:---:`, `---:`)
3. Body rows (from `TableRow` children `TableCell` nodes)

**Rationale**: The Lezer tree gives us node positions; we slice the document to get cell text content.

### R4: Block-Level Selection Reveal

**Decision**: Use `getBlockRange()` + `rangeInSelection()` on the entire `Table` node, same pattern as `FencedCode`. If cursor is anywhere in the table, show raw Markdown.

**Rationale**: Consistent with existing block-level behavior. Partial table reveal would be confusing.

## Phase 1: Design

### TableWidget Class

The widget receives parsed table data and renders an HTML `<table>`:

```
Input: { headers: string[], alignments: ('left'|'center'|'right')[], rows: string[][] }
Output: <table> with <thead>/<tbody>, alignment applied via text-align style
```

### Integration Point

Add a new `case 'Table':` block in the `buildDecorations` `switch` statement, between the existing block-level elements (after `Blockquote`, before `ListItem`).

### Styling

Add CSS rules to `combinedStyle` baseTheme:
- `.cm-table-widget table` — basic table styling (border-collapse, width)
- `.cm-table-widget td, th` — cell padding, borders

## Complexity Tracking

No constitution violations. This is a straightforward addition following the established pattern.
