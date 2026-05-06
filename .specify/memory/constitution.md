<!-- Sync Impact Report
Version change: 0.0.0 → 1.0.0 (initial)
Added sections: Core Principles (2), Governance
Removed sections: none
Templates requiring updates: none (initial constitution)
Follow-up TODOs: none
-->

# MarkEdit-preview Constitution

## Core Principles

### I. Non-Breaking Extension

New features (including the combined edit+preview mode) MUST NOT break existing preview modes (`side-by-side`, `preview`). The extension MUST remain backward-compatible with current settings and the MarkEdit API. New modes are additive — users who don't opt in see no change.

### II. Lint & Test Gate

All code MUST pass `yarn lint` and `yarn test` before being considered complete. New behavior MUST have corresponding test coverage in the `tests/` directory using Vitest.

## Governance

This constitution applies to the "combined preview and edit mode" feature work. Amendments require updating this file and incrementing the version.

**Version**: 1.0.0 | **Ratified**: 2026-05-06 | **Last Amended**: 2026-05-06
