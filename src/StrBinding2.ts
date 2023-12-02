import {invokeFirstOnly} from './util';
import {Selection} from './Selection';
import {applyChange} from './util';
import type {EditorFacade, SimpleChange} from './types';
import type {StrApi} from 'json-joy/es2020/json-crdt';
const diff = require('fast-diff');

const enum DIFF_CHANGE_TYPE {
  DELETE = -1,
  EQUAL = 0,
  INSERT = 1,
}

export class StrBinding {
  protected readonly selection = new Selection();
  protected readonly race = invokeFirstOnly();

  constructor(
    protected readonly str: StrApi,
    protected readonly editor: EditorFacade,
  ) {}

  // ---------------------------------------------------------------- Selection
  // We constantly keep track of the selection state, which is stored in the
  // Selection class. The selection state is updated on every input event and
  // selectionchange event, and in other cases. The selection state, keeps track
  // of, both, the local and remote selection state.

  protected saveSelection() {
    const {str, editor, selection} = this;
    const [selectionStart, selectionEnd, selectionDirection] = editor.getSelection() || [-1, -1, 0];
    const {start, end} = selection;
    const now = Date.now();
    const tick = str.api.model.tick;
    // Return early to avoid excessive RGA queries.
    if (start === selectionStart && end === selectionEnd && (tick === selection.tick || now - selection.ts < 3000))
      return;
    selection.start = selectionStart;
    selection.end = selectionEnd;
    selection.dir = selectionDirection;
    selection.ts = now;
    selection.tick = tick;
    selection.startId = typeof selectionStart === 'number' ? str.findId((selectionStart ?? 0) - 1) ?? null : null;
    selection.endId = typeof selectionEnd === 'number' ? str.findId((selectionEnd ?? 0) - 1) ?? null : null;
  }

  // ----------------------------------------------------- Model-to-Editor sync
  // We can always sync the model to the editor. However, it is done only in
  // two cases: (1) on initial binding, and (2) when the model receives remote
  // changes. The latter is done by listening to the changes event on the str
  // instance.

  public syncFromModel() {
    this.editor.set(this.str.view());
  }

  protected readonly onModelChange = () => {
    this.race(() => {
      this.syncFromModel();
      const {editor, selection, str} = this;
      const start = selection.startId ? str.findPos(selection.startId) + 1 : -1;
      const end = selection.endId ? str.findPos(selection.endId) + 1 : -1;
      editor.setSelection(start, end, selection.dir);
      this.saveSelection();
    });
  };

  // ----------------------------------------------------- Editor-to-Model sync
  // The main synchronization is from the editor to the model. This is done by
  // listening to the change events of the editor. However, some changes might
  // be too complex, in which case the implementation bails out of granular
  // input synchronization and instead synchronizes the whole editor value
  // with the model. The whole state synchronization is done
  // by `syncFromInput()`, which uses the char-by-char diffing algorithm to
  // compute the changes.

  public syncFromEditor() {
    const {str, editor} = this;
    const view = str.view();
    const value = editor.get();
    if (value === view) return;
    // console.log('FULL_SYNC');
    const selection = this.selection;
    const caretPos: number | undefined = selection.start === selection.end ? selection.start ?? undefined : undefined;
    const changes = diff(view, value, caretPos);
    const changeLen = changes.length;
    let pos: number = 0;
    for (let i = 0; i < changeLen; i++) {
      const change = changes[i];
      const [type, text] = change;
      switch (type) {
        case DIFF_CHANGE_TYPE.DELETE: {
          str.del(pos, text.length);
          break;
        }
        case DIFF_CHANGE_TYPE.EQUAL: {
          pos += text.length;
          break;
        }
        case DIFF_CHANGE_TYPE.INSERT: {
          str.ins(pos, text);
          pos += text.length;
          break;
        }
      }
    }
  }

  private readonly onchange = (change: SimpleChange | null) => {
    this.race(() => {
      if (change) {
        const view = this.str.view();
        const expected = applyChange(view, change);
        const editor = this.editor;
        if (expected.length === editor.getLength() && expected === editor.get()) {
          const str = this.str;
          const [position, remove, insert] = change;
          if (remove) str.del(position, remove);
          if (insert) str.ins(position, insert);
        }
      }
      this.syncFromEditor();
      this.saveSelection();
    });
  };

  // ------------------------------------------------------------------ Polling
  // Some changes to the input are not captured by the `input`, nor `change`
  // events. For example, when input is modified programmatically
  // `input.value = '...'`. To capture such changes, one can opt-in to polling
  // by calling `bind(true)`. The polling interval can be configured by
  // setting the `pollingInterval` property.

  public pollingInterval: number = 1000;
  private pollingRef: number | null | unknown = null;

  private readonly pollChanges = () => {
    this.pollingRef = setTimeout(() => {
      this.race(() => {
        try {
          const view = this.str.view();
          const value = this.editor.get();
          if (view !== value) this.syncFromEditor();
        } catch {}
        if (this.pollingRef) this.pollChanges();
      });
    }, this.pollingInterval);
  };

  public stopPolling() {
    if (this.pollingRef) clearTimeout(this.pollingRef as any);
    this.pollingRef = null;
  }

  // ------------------------------------------------------------------ Binding

  private _s: (() => void) | null = null;

  public readonly bind = (polling?: boolean) => {
    const editor = this.editor;
    editor.onchange = this.onchange;
    editor.onselection = () => this.saveSelection();
    if (polling) this.pollChanges();
    this._s = this.str.api.onChange.listen(this.onModelChange);
  };

  public readonly unbind = () => {
    this.stopPolling();
    if (this._s) this._s();
    this.editor.dispose();
  };
}
