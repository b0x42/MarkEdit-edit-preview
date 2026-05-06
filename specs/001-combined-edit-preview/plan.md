# Implementation Plan: Combined Edit-Preview Plugin

**Branch**: `main` | **Date**: 2026-05-06 | **Spec**: `specs/001-combined-edit-preview/spec.md`
**Input**: Feature specification from `/specs/001-combined-edit-preview/spec.md`

## Summary

A MarkEdit extension that hides Markdown syntax markers on unfocused lines using CodeMirror 6 replace decorations, revealing raw Markdown only when the cursor is on a line. Built as a single CJS file via Vite, toggled via Extensions menu.

## Technical Context

**Language/Version**: TypeScript 5.8.3  
**Primary Dependencies**: markedit-api v0.22.0, @codemirror/view, @codemirror/state, @codemirror/language, @lezer/markdown  
**Storage**: localStorage (single boolean toggle)  
**Testing**: Vitest (to be added per constitution)  
**Target Platform**: macOS (MarkEdit desktop app)  
**Project Type**: Browser extension (MarkEdit plugin)  
**Performance Goals**: Decorations computed within 16ms (single frame) for visible viewport  
**Constraints**: Single CJS output file, no runtime dependencies beyond what MarkEdit provides, must not break existing preview modes  
**Scale/Scope**: Single-user editor plugin, documents up to ~100k lines

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Non-Breaking Extension | ✅ PASS | Plugin uses a Compartment — when disabled, zero effect. Does not modify existing preview modes. Additive only. |
| II. Lint & Test Gate | ⚠️ PARTIAL | No lint/test scripts exist yet. Plan includes adding Vitest. `yarn` not used (npm project) — constitution says `yarn lint`/`yarn test` but project uses npm. Will add `npm test` equivalent. |

**Gate Decision**: PASS with noted deviation. Constitution references `yarn` but project uses `npm`. Will implement the spirit of the gate (lint + test before completion) using npm scripts.

## Project Structure

### Documentation (this feature)

```text
specs/001-combined-edit-preview/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── contracts/           # Phase 1 output (public API surface)
```

### Source Code (repository root)

```text
├── main.ts              # Entry point: menu registration, toggle, hotkey
├── src/
│   └── combined.ts      # ViewPlugin, decorations, compartment
├── tests/
│   └── combined.test.ts # Unit tests for decoration logic
├── package.json
├── tsconfig.json
├── vite.config.mts
└── dist/
    └── markedit-edit-preview.js  # Build output
```

**Structure Decision**: Single-project flat layout. Only two source files needed given the focused scope. Tests directory added to satisfy constitution.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| npm instead of yarn | Project initialized with npm, no yarn.lock exists | Switching package managers mid-project adds unnecessary churn |
