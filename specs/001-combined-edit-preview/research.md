# Research: Combined Edit-Preview Plugin

## R1: Lezer Markdown Node Names for Decoration Targeting

**Decision**: Use `@lezer/markdown` syntax tree node names directly (ATXHeading1-6, Emphasis, StrongEmphasis, Strikethrough, InlineCode, Link, Image, FencedCode, Blockquote, ListItem, HorizontalRule) with child marker nodes (EmphasisMark, HeaderMark, CodeMark, LinkMark, QuoteMark, ListMark, StrikethroughMark, CodeInfo).

**Rationale**: The Lezer markdown parser used by CodeMirror 6 exposes these nodes in the syntax tree. Accessing them via `syntaxTree(state).iterate()` is the standard CM6 pattern for decoration plugins.

**Alternatives considered**:
- Regex-based line scanning: Fragile, doesn't handle nested/multiline structures
- Custom parser: Unnecessary when Lezer already provides the tree

## R2: Decoration Strategy — Replace vs Widget

**Decision**: Use `Decoration.replace({})` to hide markers. Use `Decoration.replace({ widget })` only for bullet replacement (•) and horizontal rules (<hr>).

**Rationale**: Replace decorations are the lightest-weight option — they simply hide ranges without inserting DOM. This preserves cursor behavior, works with all themes, and avoids the complexity of widget cursor handling.

**Alternatives considered**:
- Full HTML widget rendering (Typora-style): Heavy, breaks cursor navigation, theme-incompatible
- CSS `display:none` via mark decorations: Doesn't collapse space, leaves gaps

## R3: Selection-Aware Reveal Strategy

**Decision**: Check `state.selection.ranges` against node positions. For inline elements, check the node range. For block elements (FencedCode, Blockquote), check the entire block range so the whole structure reveals together.

**Rationale**: Users expect to see the full raw syntax of a block when editing any part of it. Revealing only the cursor line within a fenced code block would be confusing.

**Alternatives considered**:
- Line-based reveal only: Breaks multi-line structures
- Paragraph-based reveal: Too coarse for inline elements

## R4: Testing Strategy

**Decision**: Add Vitest for unit testing the decoration-building logic. Mock `EditorView` and `EditorState` to test `buildDecorations` output without a real DOM.

**Rationale**: Constitution requires test coverage. The core logic (which ranges to decorate given a syntax tree and selection) is pure and testable without browser environment.

**Alternatives considered**:
- Integration tests in MarkEdit: Requires running the full app, not practical for CI
- No tests: Violates constitution

## R5: Performance — Viewport-Only Decoration

**Decision**: Only iterate `view.visibleRanges` rather than the full document. Rebuild decorations on `docChanged`, `viewportChanged`, or `selectionSet`.

**Rationale**: For large documents, iterating the full syntax tree would exceed the 16ms budget. Viewport-only ensures constant-time relative to screen size, not document size.

**Alternatives considered**:
- Full-document decoration with incremental updates: More complex, marginal benefit for this use case
- Debounced updates: Would cause visible flicker on cursor movement
