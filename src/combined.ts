import { ViewPlugin, Decoration, EditorView, WidgetType } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { Compartment } from '@codemirror/state';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import type { EditorState, Range } from '@codemirror/state';
import type { SyntaxNodeRef } from '@lezer/common';

const hiddenDeco = Decoration.replace({});

function rangeInSelection(state: EditorState, from: number, to: number): boolean {
  for (const range of state.selection.ranges) {
    if (range.from <= to && range.to >= from) return true;
  }
  return false;
}

function getBlockRange(node: SyntaxNodeRef, state: EditorState) {
  return { from: state.doc.lineAt(node.from).from, to: state.doc.lineAt(node.to).to };
}

class BulletWidget extends WidgetType {
  toDOM(): HTMLElement {
    const el = document.createElement('span');
    el.textContent = '•';
    el.className = 'cm-combined-bullet';
    return el;
  }
}

class HrWidget extends WidgetType {
  toDOM(): HTMLElement {
    return document.createElement('hr');
  }
}

const bulletWidget = new BulletWidget();
const hrWidget = new HrWidget();

function buildDecorations(view: EditorView): DecorationSet {
  const { state } = view;
  const ranges: Range<Decoration>[] = [];

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter(node) {
        switch (node.name) {
          case 'FencedCode': {
            const block = getBlockRange(node, state);
            if (rangeInSelection(state, block.from, block.to)) return false;
            for (const mark of node.node.getChildren('CodeMark').concat(node.node.getChildren('CodeInfo'))) {
              const line = state.doc.lineAt(mark.from);
              ranges.push(hiddenDeco.range(line.from, Math.min(line.to + 1, state.doc.length)));
            }
            return false;
          }

          case 'Blockquote': {
            const block = getBlockRange(node, state);
            if (rangeInSelection(state, block.from, block.to)) return false;
            for (const mark of node.node.getChildren('QuoteMark')) {
              const text = state.sliceDoc(mark.from, mark.to + 3);
              const match = /^>[ ]{0,3}/.exec(text);
              ranges.push(hiddenDeco.range(mark.from, match ? mark.from + match[0].length : mark.to));
            }
            return;
          }

          case 'StrongEmphasis':
          case 'Emphasis': {
            if (rangeInSelection(state, node.from, node.to)) return;
            for (const mark of node.node.getChildren('EmphasisMark')) {
              ranges.push(hiddenDeco.range(mark.from, mark.to));
            }
            return;
          }

          case 'Strikethrough': {
            if (rangeInSelection(state, node.from, node.to)) return;
            for (const mark of node.node.getChildren('StrikethroughMark')) {
              ranges.push(hiddenDeco.range(mark.from, mark.to));
            }
            return false;
          }

          case 'InlineCode': {
            if (rangeInSelection(state, node.from, node.to)) return;
            for (const mark of node.node.getChildren('CodeMark')) {
              ranges.push(hiddenDeco.range(mark.from, mark.to));
            }
            return false;
          }

          case 'Link': {
            if (rangeInSelection(state, node.from, node.to)) return;
            const marks = node.node.getChildren('LinkMark');
            if (marks.length >= 3) {
              ranges.push(hiddenDeco.range(marks[0].from, marks[0].to));
              ranges.push(hiddenDeco.range(marks[1].from, marks[marks.length - 1].to));
            }
            return false;
          }

          case 'Image': {
            if (rangeInSelection(state, node.from, node.to)) return;
            const marks = node.node.getChildren('LinkMark');
            if (marks.length >= 3) {
              // Hide ![ at the start
              ranges.push(hiddenDeco.range(marks[0].from, marks[0].to));
              // Hide ](url) at the end
              ranges.push(hiddenDeco.range(marks[1].from, marks[marks.length - 1].to));
            }
            return false;
          }

          case 'ATXHeading1':
          case 'ATXHeading2':
          case 'ATXHeading3':
          case 'ATXHeading4':
          case 'ATXHeading5':
          case 'ATXHeading6': {
            const line = state.doc.lineAt(node.from);
            if (rangeInSelection(state, line.from, line.to)) return false;
            const mark = node.node.getChild('HeaderMark');
            if (mark) {
              let end = mark.to;
              while (end < line.to && state.sliceDoc(end, end + 1) === ' ') end++;
              ranges.push(hiddenDeco.range(mark.from, end));
            }
            return false;
          }

          case 'ListItem': {
            if (node.node.parent?.name === 'OrderedList') return;
            const line = state.doc.lineAt(node.from);
            if (rangeInSelection(state, line.from, line.to)) return;
            for (const mark of node.node.getChildren('ListMark')) {
              ranges.push(Decoration.replace({ widget: bulletWidget }).range(mark.from, mark.to));
            }
            return;
          }

          case 'HorizontalRule': {
            if (rangeInSelection(state, node.from, node.to)) return;
            ranges.push(Decoration.replace({ widget: hrWidget }).range(node.from, node.to));
            return false;
          }
        }
      },
    });
  }

  ranges.sort((a, b) => a.from - b.from);
  return Decoration.set(ranges);
}

const combinedPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: v => v.decorations },
);

const combinedStyle = EditorView.baseTheme({
  '.cm-combined-bullet': { fontSize: '1.2em' },
});

export const combinedCompartment = new Compartment();

export function combinedModeExtension() {
  return combinedCompartment.of([combinedPlugin, combinedStyle]);
}

export function setCombinedMode(view: EditorView, enabled: boolean) {
  view.dispatch({
    effects: combinedCompartment.reconfigure(
      enabled ? [combinedPlugin, combinedStyle] : [],
    ),
  });
}
