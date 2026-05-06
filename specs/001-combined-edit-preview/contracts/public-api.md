# Public API Contract: Combined Edit-Preview Plugin

## Exported Symbols (from `src/combined.ts`)

```typescript
/** Compartment instance for dynamic reconfiguration */
export const combinedCompartment: Compartment;

/** Returns the extension array to register in the compartment */
export function combinedModeExtension(): Extension;

/** Reconfigure the compartment to enable/disable decorations */
export function setCombinedMode(view: EditorView, enabled: boolean): void;
```

## MarkEdit Integration Points

### Menu Item

- **Title**: `"Combined Edit-Preview"`
- **Location**: Extensions menu
- **Behavior**: Toggle — calls `setCombinedMode()` and persists state
- **State callback**: Returns `{ isSelected: boolean }`

### Settings Key

- **Path**: `extension.markeditCombinedMode`
- **Schema**:
  ```json
  {
    "hotKey": {
      "key": "string (single character)",
      "modifiers": ["Command" | "Shift" | "Control" | "Option"]
    }
  }
  ```

### localStorage Key

- **Key**: `markedit-edit-preview.enabled`
- **Values**: `"true"` | `"false"`
- **Default behavior**: If key absent, plugin is enabled

## CSS Classes

| Class | Element | Purpose |
|-------|---------|---------|
| `.cm-combined-bullet` | `<span>` | Bullet replacement widget styling |
