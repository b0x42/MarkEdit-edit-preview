import { ViewPlugin, Decoration, EditorView, WidgetType } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { Compartment, StateField } from '@codemirror/state';
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

class TableWidget extends WidgetType {
  constructor(readonly content: string) { super(); }
  eq(other: TableWidget) { return this.content === other.content; }
  ignoreEvent() { return false; }
  toDOM(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'cm-table-widget';
    const table = wrap.appendChild(document.createElement('table'));
    const lines = this.content.split('\n').filter(l => l.trim());
    const sepRe = /^\|?[\s:|-]+\|[\s:|-]*\|?$/;
    const parseCells = (line: string) => line.replace(/^\||\|$/g, '').split('|').map(c => c.trim());

    let headerDone = false;
    for (const line of lines) {
      if (sepRe.test(line)) { headerDone = true; continue; }
      const cells = parseCells(line);
      const tr = document.createElement('tr');
      for (const cell of cells) {
        const el = document.createElement(headerDone ? 'td' : 'th');
        el.textContent = cell;
        tr.appendChild(el);
      }
      table.appendChild(tr);
    }
    return wrap;
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

          case 'Table': {
            const block = getBlockRange(node, state);
            if (rangeInSelection(state, block.from, block.to)) return false;
            // Hide the delimiter row entirely
            for (const child of node.node.getChildren('TableDelimiter')) {
              // Only hide full-line delimiters (the separator row), not inline pipe delimiters
              const line = state.doc.lineAt(child.from);
              if (/^\|?[\s:|-]+\|?$/.test(state.sliceDoc(line.from, line.to))) {
                ranges.push(hiddenDeco.range(line.from, line.to));
                break; // Only one separator row per table
              }
            }
            // Hide pipe characters in header and body rows
            const tableText = state.sliceDoc(block.from, block.to);
            let pos = block.from;
            for (const lineText of tableText.split('\n')) {
              // Skip separator row (already hidden)
              if (!/^\|?[\s:|-]+\|?$/.test(lineText)) {
                for (let i = 0; i < lineText.length; i++) {
                  if (lineText[i] === '|') {
                    ranges.push(hiddenDeco.range(pos + i, pos + i + 1));
                  }
                }
              }
              pos += lineText.length + 1;
            }
            return false;
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
  return Decoration.set(ranges, true);
}

function buildTableDecos(state: EditorState): DecorationSet {
  const ranges: Range<Decoration>[] = [];
  const sepRe = /^\|?[\s:|-]+\|[\s:|-]*\|?$/;
  const pipeRe = /\|/;
  const doc = state.doc;
  let lineNo = 1;
  while (lineNo <= doc.lines) {
    const line = doc.line(lineNo);
    if (sepRe.test(line.text)) {
      let tableStart = lineNo;
      if (lineNo > 1 && pipeRe.test(doc.line(lineNo - 1).text)) tableStart = lineNo - 1;
      let tableEnd = lineNo;
      for (let n = lineNo + 1; n <= doc.lines; n++) {
        if (pipeRe.test(doc.line(n).text)) tableEnd = n;
        else break;
      }
      const blockFrom = doc.line(tableStart).from;
      const blockTo = doc.line(tableEnd).to;
      if (!rangeInSelection(state, blockFrom, blockTo)) {
        const content = state.sliceDoc(blockFrom, blockTo);
        ranges.push(Decoration.replace({ widget: new TableWidget(content), block: true }).range(blockFrom, blockTo));
      }
      lineNo = tableEnd + 1;
    } else {
      lineNo++;
    }
  }
  return Decoration.set(ranges);
}

const tableField = StateField.define<DecorationSet>({
  create(state) { return buildTableDecos(state); },
  update(_decos, tr) {
    if (tr.docChanged || tr.startState.selection !== tr.state.selection) return buildTableDecos(tr.state);
    return _decos;
  },
  provide: f => EditorView.decorations.from(f),
});

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
  '.cm-table-widget': { padding: '4px 0' },
  '.cm-table-widget table': { borderCollapse: 'collapse', width: 'auto', margin: '0' },
  '.cm-table-widget th, .cm-table-widget td': { border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left' },
  '.cm-table-widget th': { fontWeight: 'bold', background: '#f8f8f8' },
});

export const combinedCompartment = new Compartment();

export function combinedModeExtension() {
  return combinedCompartment.of([combinedPlugin, tableField, combinedStyle]);
}

export function setCombinedMode(view: EditorView, enabled: boolean) {
  view.dispatch({
    effects: combinedCompartment.reconfigure(
      enabled ? [combinedPlugin, tableField, combinedStyle] : [],
    ),
  });
}
