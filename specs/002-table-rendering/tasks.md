# Tasks: Table Rendering

**Input**: Design documents from `/specs/002-table-rendering/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md

**Organization**: Tasks grouped by user story. Two stories:
- US1: Core table widget rendering (replace table with HTML grid)
- US2: Test coverage

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Verify GFM table nodes are available in the syntax tree

- [ ] T001 Verify @lezer/markdown GFM Table extension is active in MarkEdit's markdown language config by testing a table document in combined.test.ts

---

## Phase 2: User Story 1 — Core Table Widget (Priority: P1) 🎯 MVP

**Goal**: Replace unfocused tables with a clean HTML table widget

**Independent Test**: Open a document with a Markdown table, move cursor away, verify table renders as aligned grid without pipes

### Implementation for User Story 1

- [ ] T002 [US1] Add table parsing helper function (extract headers, alignments, rows from Table node range) in src/combined.ts
- [ ] T003 [US1] Create TableWidget class extending WidgetType that renders HTML `<table>` with thead/tbody and alignment styles in src/combined.ts
- [ ] T004 [US1] Add `case 'Table':` to buildDecorations switch — use getBlockRange + rangeInSelection, replace with TableWidget in src/combined.ts
- [ ] T005 [US1] Add table CSS rules to combinedStyle baseTheme (.cm-table-widget table, td, th) in src/combined.ts
- [ ] T006 [US1] Update spec 001 to remove tables from "NOT in scope" section in specs/001-combined-edit-preview/spec.md

**Checkpoint**: Tables render as clean grids when cursor is elsewhere, reveal raw Markdown when cursor enters

---

## Phase 3: User Story 2 — Test Coverage (Priority: P2)

**Goal**: Add tests for table decoration logic

**Independent Test**: `npm test` passes with table-specific test cases

### Implementation for User Story 2

- [ ] T007 [P] [US2] Write test: table replaced with widget when cursor is elsewhere in tests/combined.test.ts
- [ ] T008 [P] [US2] Write test: table shows raw Markdown when cursor is inside in tests/combined.test.ts
- [ ] T009 [P] [US2] Write test: multiple tables render independently in tests/combined.test.ts
- [ ] T010 [US2] Run npm run lint && npm test && npm run build to verify all gates pass

**Checkpoint**: `npm test` passes, constitution gate satisfied

---

## Phase 4: Polish

- [ ] T011 Verify existing decoration tests still pass (no regressions) via npm test
- [ ] T012 Build and install plugin via npm run install-plugin

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **US1 (Phase 2)**: Depends on Phase 1 (confirm GFM nodes available)
- **US2 (Phase 3)**: Depends on Phase 2 (need implementation to test)
- **Polish (Phase 4)**: Depends on all prior phases

### Within User Story 1

- T002 (parser) before T003 (widget) before T004 (integration)
- T005 (CSS) can run in parallel with T004
- T006 is independent

### Parallel Opportunities

- T007, T008, T009 can run in parallel (independent test cases)
- T005 and T004 can run in parallel

---

## Implementation Strategy

### MVP First

1. Phase 1: Confirm GFM nodes exist
2. Phase 2: Implement table widget (T002→T003→T004→T005)
3. **STOP and VALIDATE**: Install in MarkEdit, test with real tables
4. Phase 3: Add tests
5. Phase 4: Final validation

---

## Notes

- This is an additive change — one new `case` in the existing switch + one new widget class
- Total ~50-80 lines of new code in src/combined.ts
- No new files needed
