import { MarkEdit } from 'markedit-api';
import { combinedModeExtension, setCombinedMode, combinedCompartment } from './src/combined';

const STORAGE_KEY = 'markedit-edit-preview.enabled';
const settings = (MarkEdit.userSettings?.['extension.markeditCombinedMode'] ?? {}) as Record<string, unknown>;
const hotKey = (settings.hotKey ?? { key: 'E', modifiers: ['Command', 'Shift'] }) as { key: string; modifiers: string[] };

// Default enabled; only disabled if user explicitly toggled off
let enabled = localStorage.getItem(STORAGE_KEY) !== 'false';

// Register compartment (starts enabled or empty based on saved state)
MarkEdit.addExtension(enabled ? combinedModeExtension() : combinedCompartment.of([]));

function toggle() {
  enabled = !enabled;
  localStorage.setItem(STORAGE_KEY, String(enabled));
  setCombinedMode(MarkEdit.editorView, enabled);
}

MarkEdit.addMainMenuItem({
  title: 'Combined Edit-Preview',
  action: toggle,
  state: () => ({ isSelected: enabled }),
  key: hotKey.key,
  modifiers: hotKey.modifiers as ('Shift' | 'Control' | 'Command' | 'Option')[],
});
