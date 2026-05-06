# Data Model: Combined Edit-Preview Plugin

## Entities

### CombinedModeState (runtime, in-memory)

| Field | Type | Description |
|-------|------|-------------|
| enabled | boolean | Whether decorations are active |
| decorations | DecorationSet | Current set of replace decorations for visible viewport |

**Persistence**: `enabled` stored in `localStorage` under key `markedit-edit-preview.enabled`. Value is string `"true"` or `"false"`.

### Configuration (read-only, from settings.json)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| hotKey.key | string | `"E"` | Key character for toggle shortcut |
| hotKey.modifiers | string[] | `["Command", "Shift"]` | Modifier keys |

**Source**: `MarkEdit.userSettings['extension.markeditCombinedMode']`

## State Transitions

```
[Plugin Load] → enabled=localStorage.get() !== 'false'
                    │
                    ├─ enabled=true  → Compartment.of([plugin, style])
                    └─ enabled=false → Compartment.of([])

[Toggle Action] → enabled = !enabled
                  → localStorage.set(enabled)
                  → Compartment.reconfigure(...)

[Cursor Move / Doc Change / Viewport Scroll]
                  → Rebuild DecorationSet from visible ranges
```

## Decoration Rules

| Markdown Node | Action | Condition |
|---------------|--------|-----------|
| ATXHeading1-6 | Hide HeaderMark + trailing space | Cursor not on heading line |
| Emphasis / StrongEmphasis | Hide EmphasisMark children | Cursor not in node range |
| Strikethrough | Hide StrikethroughMark children | Cursor not in node range |
| InlineCode | Hide CodeMark children | Cursor not in node range |
| Link | Hide first LinkMark + second-to-last LinkMark range | Cursor not in node range |
| Image | Hide first LinkMark + second-to-last LinkMark range | Cursor not in node range |
| FencedCode | Hide CodeMark/CodeInfo lines | Cursor not in block range |
| Blockquote | Hide QuoteMark + trailing spaces | Cursor not in block range |
| ListItem (unordered) | Replace ListMark with bullet widget | Cursor not on line |
| HorizontalRule | Replace with hr widget | Cursor not in node range |
