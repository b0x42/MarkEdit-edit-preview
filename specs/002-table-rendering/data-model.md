# Data Model: Table Rendering

## Entities

### TableData (transient, computed per decoration cycle)

| Field | Type | Description |
|-------|------|-------------|
| headers | string[] | Cell text content from the header row |
| alignments | ('left' \| 'center' \| 'right')[] | Per-column alignment from delimiter row |
| rows | string[][] | Cell text content for each body row |

### Lezer Node Mapping

| Node Name | Role | Children |
|-----------|------|----------|
| Table | Block container | TableHeader, TableDelimiter, TableRow* |
| TableHeader | First row | TableCell* |
| TableDelimiter | Separator (`\|---\|`) | TableDelimiter markers |
| TableRow | Body row | TableCell* |
| TableCell | Individual cell | Inline content |

## Decoration Rule

| Markdown Node | Action | Condition |
|---------------|--------|-----------|
| Table | Replace entire block with TableWidget | Cursor not in table block range |
