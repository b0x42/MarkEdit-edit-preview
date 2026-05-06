# Feature Specification: Table Rendering

**Created**: 2026-05-06
**Status**: Draft
**Input**: User description: "add rendering of tables"

## User Scenarios & Testing

### User Story 1 — Clean Table Display (Priority: P1)

A writer has Markdown tables in their document. When the cursor is not inside the table, the pipe characters and alignment dashes are hidden and the table content is displayed in a clean, aligned grid. When the cursor moves into the table, the full raw Markdown syntax is revealed for editing.

**Why this priority**: Tables are the most visually noisy Markdown element — pipes and dashes dominate the view. Hiding them provides the highest readability improvement.

**Independent Test**: Create a document with a Markdown table, move cursor away from it, and verify the table appears as a clean aligned grid without pipe characters.

**Acceptance Scenarios**:

1. **Given** a document with a Markdown table and cursor on a different line, **When** the plugin is enabled, **Then** the table displays as a clean grid without `|` characters or `---` separator rows
2. **Given** a document with a rendered table, **When** the cursor moves into any cell of the table, **Then** the full raw Markdown table syntax is revealed
3. **Given** a table with alignment markers (`:---`, `:---:`, `---:`), **When** the table is rendered, **Then** cell content respects left/center/right alignment

---

### User Story 2 — Multi-Table Documents (Priority: P2)

A writer has multiple tables in a long document. Each table independently shows rendered or raw state depending on cursor position.

**Why this priority**: Real documents often contain multiple tables. Each must behave independently.

**Independent Test**: Create a document with two tables separated by text. Place cursor in one table and verify only that table shows raw Markdown while the other remains rendered.

**Acceptance Scenarios**:

1. **Given** a document with multiple tables, **When** cursor is in table A, **Then** only table A shows raw Markdown; other tables remain rendered
2. **Given** a document with tables and other Markdown elements, **When** the plugin is enabled, **Then** tables and other elements (headings, bold, etc.) all render correctly without interference

---

### Edge Cases

- Empty table cells display as empty space in the grid
- Tables with inconsistent column counts (malformed) fall back to showing raw Markdown
- Single-column tables render correctly
- Tables immediately adjacent to other block elements (code blocks, headings) don't interfere
- Very wide tables (many columns) remain usable without horizontal overflow issues

## Requirements

### Functional Requirements

- **FR-001**: System MUST hide pipe (`|`) characters on unfocused table lines
- **FR-002**: System MUST hide the header separator row (`|---|---|`) entirely when unfocused
- **FR-003**: System MUST display table content in a visually aligned grid using a widget decoration
- **FR-004**: System MUST reveal full raw Markdown when cursor is on any line within the table
- **FR-005**: System MUST respect column alignment markers (left, center, right) in the rendered view
- **FR-006**: System MUST treat the entire table as a single block for cursor reveal purposes (same as fenced code blocks)
- **FR-007**: System MUST handle tables of any size within the visible viewport without exceeding the 16ms frame budget

### Key Entities

- **Table**: A block-level Markdown element consisting of a header row, separator row, and body rows
- **Cell**: Individual content unit within a table, delimited by pipes
- **Alignment**: Per-column text alignment derived from the separator row's colon placement

## Success Criteria

### Measurable Outcomes

- **SC-001**: Tables appear as clean aligned grids within one frame (16ms) of cursor leaving the table
- **SC-002**: All table content remains readable and properly aligned in rendered view
- **SC-003**: Cursor entering any table cell reveals raw Markdown within one frame
- **SC-004**: Plugin continues to work with documents containing 10+ tables without performance degradation
- **SC-005**: Existing element decorations (headings, bold, links, etc.) continue to function correctly alongside table rendering

## Assumptions

- Tables follow standard GitHub Flavored Markdown (GFM) pipe table syntax
- The Lezer markdown parser provides `Table`, `TableHeader`, `TableDelimiter`, and `TableRow` nodes (via GFM extension)
- Table rendering uses a CM6 widget decoration that replaces the entire table block when unfocused
- Column widths in the rendered view are determined by content width (no fixed-width columns)
- Tables with syntax errors (missing pipes, inconsistent columns) are left as raw Markdown (no decoration applied)
