# MarkEdit Combined Edit-Preview

A MarkEdit extension that hides Markdown syntax on unfocused lines, revealing raw Markdown only when the cursor is on a line. Similar to Typora/Zettlr.

## Install

```bash
npm run install-plugin
```

This builds and copies the plugin to `~/Library/Containers/app.cyan.markedit/Data/Documents/scripts/`.

## Usage

Toggle via **Extensions → Combined Edit-Preview** or press **⌘⇧E**.

## Configuration

In MarkEdit's `settings.json`:

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

## Development

```bash
npm run build    # Build to dist/
npm test         # Run tests
```
