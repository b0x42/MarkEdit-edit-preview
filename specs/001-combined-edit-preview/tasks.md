# Tasks: Combined Edit-Preview Plugin

**Input**: Design documents from `/specs/001-combined-edit-preview/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included per constitution requirement (Lint & Test Gate).

**Organization**: Tasks grouped by user story. This plugin has three logical stories:
- US1: Core decoration engine (hide markers on unfocused lines)
- US2: Toggle & persistence (menu item, hotkey, localStorage)
- US3: Test coverage & polish (constitution compliance)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization and build tooling

- [ ] T001 Create project structure with main.ts, src/combined.ts, package.json, tsconfig.json, vite.config.mts
- [ ] T002 Configure Vite for CJS library output with external CodeMirror/markedit-api in vite.config.mts
- [ ] T003 Install dependencies: markedit-api, typescript, vite in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure needed by all stories

- [ ] T004 Create Compartment instance and export combinedModeExtension/setCombinedMode in src/combined.ts
- [ ] T005 Implement rangeInSelection helper (cursor/selection detection) in src/combined.ts
- [ ] T006 Implement getBlockRange helper (line range for block nodes) in src/combined.ts

**Checkpoint**: Core utilities ready — decoration and toggle work can begin

---

## Phase 3: User Story 1 — Core Decoration Engine (Priority: P1) 🎯 MVP

**Goal**: Hide Markdown syntax markers on unfocused lines using replace decorations

**Independent Test**: Open a Markdown document; markers should be hidden on lines without cursor; moving cursor reveals raw syntax on that line

### Implementation for User Story 1

- [ ] T007 [US1] Implement ATXHeading1-6 decoration (hide HeaderMark + trailing space) in src/combined.ts
- [ ] T008 [P] [US1] Implement Emphasis/StrongEmphasis decoration (hide EmphasisMark, allow nested descent) in src/combined.ts
- [ ] T009 [P] [US1] Implement Strikethrough decoration (hide StrikethroughMark) in src/combined.ts
- [ ] T010 [P] [US1] Implement InlineCode decoration (hide CodeMark) in src/combined.ts
- [ ] T011 [US1] Implement Link decoration (hide `[` and `](url)`) in src/combined.ts
- [ ] T012 [US1] Implement Image decoration (hide `![` and `](url)`) in src/combined.ts
- [ ] T013 [US1] Implement FencedCode decoration (hide fence lines when unfocused, block-level selection) in src/combined.ts
- [ ] T014 [US1] Implement Blockquote decoration (hide QuoteMark + trailing spaces, block-level selection) in src/combined.ts
- [ ] T015 [US1] Implement ListItem decoration with BulletWidget (replace `-`/`*`/`+` with `•`) in src/combined.ts
- [ ] T016 [US1] Implement HorizontalRule decoration with HrWidget in src/combined.ts
- [ ] T017 [US1] Create ViewPlugin class with buildDecorations, update on docChanged/viewportChanged/selectionSet in src/combined.ts
- [ ] T018 [US1] Add baseTheme for .cm-combined-bullet styling in src/combined.ts

**Checkpoint**: Decorations work in MarkEdit when extension is loaded

---

## Phase 4: User Story 2 — Toggle & Persistence (Priority: P2)

**Goal**: Enable/disable via Extensions menu with hotkey and localStorage persistence

**Independent Test**: Toggle via Cmd+Shift+E; state persists across editor reloads; menu shows checkmark when enabled

### Implementation for User Story 2

- [ ] T019 [US2] Read settings from MarkEdit.userSettings for hotkey config in main.ts
- [ ] T020 [US2] Implement localStorage persistence (default enabled, save on toggle) in main.ts
- [ ] T021 [US2] Register extension via MarkEdit.addExtension with compartment in main.ts
- [ ] T022 [US2] Implement toggle function calling setCombinedMode in main.ts
- [ ] T023 [US2] Register menu item via MarkEdit.addMainMenuItem with state callback in main.ts

**Checkpoint**: Full plugin functional — toggle on/off, persists state, hotkey works

---

## Phase 5: User Story 3 — Test Coverage & Constitution Compliance (Priority: P3)

**Goal**: Add Vitest tests satisfying constitution's Lint & Test Gate

**Independent Test**: `npm test` passes with coverage of decoration logic

### Implementation for User Story 3

- [ ] T024 [US3] Add vitest as devDependency and configure test script in package.json
- [ ] T025 [US3] Create test helpers (mock EditorState, mock syntax tree) in tests/combined.test.ts
- [ ] T026 [P] [US3] Write tests for heading decoration (hide/reveal on cursor) in tests/combined.test.ts
- [ ] T027 [P] [US3] Write tests for emphasis/bold decoration including nested case in tests/combined.test.ts
- [ ] T028 [P] [US3] Write tests for link/image decoration in tests/combined.test.ts
- [ ] T029 [P] [US3] Write tests for block-level elements (fenced code, blockquote) in tests/combined.test.ts
- [ ] T030 [US3] Write tests for toggle/compartment reconfiguration in tests/combined.test.ts

**Checkpoint**: `npm test` passes, constitution gate satisfied

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation

- [ ] T031 [P] Create README.md with usage, configuration, and build instructions
- [ ] T032 Verify build output is single CJS file with no runtime dependencies via npm run build
- [ ] T033 Test install-plugin script copies to correct MarkEdit scripts directory

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on Phase 2 (T004 specifically for compartment exports)
- **US3 (Phase 5)**: Depends on Phase 3 and Phase 4 (tests need implementation to exist)
- **Polish (Phase 6)**: Depends on all prior phases

### User Story Dependencies

- **US1 (Core Decorations)**: Depends on Foundational only — can start after Phase 2
- **US2 (Toggle & Persistence)**: Depends on Foundational only — can run in parallel with US1
- **US3 (Tests)**: Depends on US1 + US2 completion

### Parallel Opportunities

- T008, T009, T010 can run in parallel (independent inline element decorations)
- T019-T023 (US2) can run in parallel with T007-T018 (US1)
- T026, T027, T028, T029 can run in parallel (independent test files)

---

## Parallel Example: User Story 1

```bash
# After T007 (headings), these can run in parallel:
Task: "T008 Implement Emphasis/StrongEmphasis decoration"
Task: "T009 Implement Strikethrough decoration"
Task: "T010 Implement InlineCode decoration"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (core decorations)
4. **STOP and VALIDATE**: Install in MarkEdit, verify markers hide/reveal
5. Functional MVP ready

### Incremental Delivery

1. Setup + Foundational → Build infrastructure ready
2. US1 → Core decorations working → Install and test in MarkEdit (MVP!)
3. US2 → Toggle/menu/hotkey → Full user-facing feature
4. US3 → Tests → Constitution compliance
5. Polish → README, final validation

---

## Notes

- [P] tasks = different files or independent code paths, no dependencies
- All decoration implementations follow same pattern: check selection → get markers → push ranges
- Commit after each phase completion
- The plugin is already partially implemented — tasks reflect the complete implementation for reference
