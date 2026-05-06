/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { GFM } from '@lezer/markdown';
import { combinedModeExtension } from '../src/combined';

function createView(doc: string, cursorPos = 0): EditorView {
  const state = EditorState.create({
    doc,
    selection: { anchor: cursorPos },
    extensions: [markdown({ extensions: GFM }), combinedModeExtension()],
  });
  return new EditorView({ state });
}

function getDecorationRanges(view: EditorView) {
  // Access the plugin's decorations via the view
  const ranges: { from: number; to: number }[] = [];
  // The decorations are applied through the ViewPlugin — iterate them
  // We need to force a sync to get decorations computed
  view.requestMeasure();
  // Access decorations from the plugin instance
  for (const plugin of (view as any).plugins) {
    if (plugin.value?.decorations) {
      const decos = plugin.value.decorations;
      const iter = decos.iter();
      while (iter.value) {
        ranges.push({ from: iter.from, to: iter.to });
        iter.next();
      }
    }
  }
  return ranges;
}

describe('combined edit-preview decorations', () => {
  describe('headings', () => {
    it('hides heading marker when cursor is not on the line', () => {
      const doc = '# Hello\nsome text';
      const view = createView(doc, 14); // cursor on "some text"
      const ranges = getDecorationRanges(view);
      // Should hide "# " (positions 0-2)
      expect(ranges.some(r => r.from === 0 && r.to === 2)).toBe(true);
      view.destroy();
    });

    it('reveals heading marker when cursor is on the line', () => {
      const doc = '# Hello\nsome text';
      const view = createView(doc, 3); // cursor on heading line
      const ranges = getDecorationRanges(view);
      // Should NOT hide heading marker
      expect(ranges.some(r => r.from === 0 && r.to === 2)).toBe(false);
      view.destroy();
    });
  });

  describe('emphasis', () => {
    it('hides bold markers when cursor is elsewhere', () => {
      const doc = '**bold** text\nanother line';
      const view = createView(doc, 20); // cursor on second line
      const ranges = getDecorationRanges(view);
      // Should hide ** at positions 0-2 and 6-8
      expect(ranges.some(r => r.from === 0 && r.to === 2)).toBe(true);
      expect(ranges.some(r => r.from === 6 && r.to === 8)).toBe(true);
      view.destroy();
    });

    it('reveals bold markers when cursor is inside', () => {
      const doc = '**bold** text\nanother line';
      const view = createView(doc, 4); // cursor inside "bold"
      const ranges = getDecorationRanges(view);
      // Should NOT hide ** markers
      expect(ranges.some(r => r.from === 0 && r.to === 2)).toBe(false);
      view.destroy();
    });

    it('hides nested emphasis markers', () => {
      const doc = '**_nested_** end\nanother line';
      const view = createView(doc, 22); // cursor on second line
      const ranges = getDecorationRanges(view);
      // Should hide ** (0-2, 10-12) and _ (2-3, 9-10)
      expect(ranges.some(r => r.from === 0 && r.to === 2)).toBe(true);
      expect(ranges.some(r => r.from === 2 && r.to === 3)).toBe(true);
      view.destroy();
    });
  });

  describe('inline code', () => {
    it('hides backticks when cursor is elsewhere', () => {
      const doc = '`code` text\nanother line';
      const view = createView(doc, 18); // cursor on second line
      const ranges = getDecorationRanges(view);
      expect(ranges.some(r => r.from === 0 && r.to === 1)).toBe(true);
      expect(ranges.some(r => r.from === 5 && r.to === 6)).toBe(true);
      view.destroy();
    });
  });

  describe('links', () => {
    it('hides link syntax when cursor is elsewhere', () => {
      const doc = '[text](url)\nanother line';
      const view = createView(doc, 18); // cursor on second line
      const ranges = getDecorationRanges(view);
      // Should hide "[" (0-1) and "](url)" (5-11)
      expect(ranges.some(r => r.from === 0 && r.to === 1)).toBe(true);
      expect(ranges.some(r => r.from === 5 && r.to === 11)).toBe(true);
      view.destroy();
    });

    it('reveals link syntax when cursor is inside', () => {
      const doc = '[text](url)\nanother line';
      const view = createView(doc, 3); // cursor inside "text"
      const ranges = getDecorationRanges(view);
      expect(ranges.some(r => r.from === 0 && r.to === 1)).toBe(false);
      view.destroy();
    });
  });

  describe('lists', () => {
    it('replaces unordered list marker with bullet widget', () => {
      const doc = '- item\nanother line';
      const view = createView(doc, 14); // cursor on second line
      const ranges = getDecorationRanges(view);
      // Should have a decoration at the list marker position
      expect(ranges.some(r => r.from === 0)).toBe(true);
      view.destroy();
    });

    it('does not decorate ordered list markers', () => {
      const doc = '1. item\nanother line';
      const view = createView(doc, 15); // cursor on second line
      const ranges = getDecorationRanges(view);
      // Should NOT have decoration at "1." position
      expect(ranges.some(r => r.from === 0 && r.to <= 3)).toBe(false);
      view.destroy();
    });
  });

  describe('horizontal rule', () => {
    it('replaces hr with widget when cursor is elsewhere', () => {
      const doc = 'text\n\n---\n\nmore';
      const view = createView(doc, 0); // cursor on first line
      const ranges = getDecorationRanges(view);
      // Should have decoration covering "---"
      expect(ranges.some(r => r.from === 6 && r.to === 9)).toBe(true);
      view.destroy();
    });
  });

  describe('toggle', () => {
    it('setCombinedMode disables decorations', async () => {
      const { setCombinedMode } = await import('../src/combined');
      const doc = '# Hello\ntext';
      const view = createView(doc, 10);
      setCombinedMode(view, false);
      const ranges = getDecorationRanges(view);
      expect(ranges.length).toBe(0);
      view.destroy();
    });
  });

  describe('tables', () => {
    const tableDoc = '| A | B |\n|---|---|\n| 1 | 2 |\n\nother text';

    it('hides pipes and separator when cursor is elsewhere', () => {
      const view = createView(tableDoc, tableDoc.length - 3); // cursor on "other text"
      const ranges = getDecorationRanges(view);
      // Should have decorations for pipe characters and separator row
      expect(ranges.length).toBeGreaterThan(0);
      // Separator row starts at pos 10 ("|---|---|") should be hidden
      expect(ranges.some(r => r.from === 10)).toBe(true);
      view.destroy();
    });

    it('reveals raw table when cursor is inside', () => {
      const view = createView(tableDoc, 3); // cursor inside table header
      const ranges = getDecorationRanges(view);
      // Should NOT have any table decorations (pipes should be visible)
      // No decoration should cover the separator row
      expect(ranges.some(r => r.from === 9 && r.to === 18)).toBe(false);
      view.destroy();
    });

    it('handles multiple tables independently', () => {
      const doc = '| A | B |\n|---|---|\n| 1 | 2 |\n\ntext\n\n| C | D |\n|---|---|\n| 3 | 4 |';
      const view = createView(doc, 35); // cursor on "text" between tables
      const ranges = getDecorationRanges(view);
      // Both tables should have decorations (pipes hidden in both)
      expect(ranges.length).toBeGreaterThan(5);
      view.destroy();
    });
  });
});
