# Contributing

Thanks for your interest in contributing to MarkEdit Combined Edit-Preview!

## Setup

```bash
git clone https://github.com/b0x42/MarkEdit-edit-preview.git
cd MarkEdit-edit-preview
npm install
```

## Development

```bash
npm run build      # Build to dist/
npm test           # Run tests
npm run lint       # Lint TypeScript
npm run install-plugin  # Build and install into MarkEdit
```

## Making Changes

1. Fork the repo and create a branch from `main`
2. Make your changes in `src/combined.ts` (decorations) or `main.ts` (toggle/menu)
3. Add tests in `tests/combined.test.ts` for new behavior
4. Ensure `npm run lint && npm test && npm run build` all pass
5. Open a pull request

## Adding Support for New Markdown Elements

1. Add a new `case` in the `switch` block inside `buildDecorations()` in `src/combined.ts`
2. Use `rangeInSelection()` to skip decoration when cursor is on the element
3. Use `hiddenDeco.range(from, to)` to hide syntax markers
4. Add a test case in `tests/combined.test.ts`

## Code Style

- TypeScript, strict mode
- No runtime dependencies — the plugin must produce a single JS file
- All CodeMirror imports are externalized (provided by MarkEdit at runtime)

## Reporting Issues

Open an issue with:
- MarkEdit version
- What Markdown syntax is misbehaving
- A minimal example document that reproduces the problem
