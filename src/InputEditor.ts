import type {SimpleChange, EditorFacade, Selection} from 'collaborative-editor';
import type {StrApi} from 'json-joy/es2020/json-crdt';

export class InputEditor implements EditorFacade {
  public selection!: Selection;
  public onchange?: (change: SimpleChange | void) => void;
  public onselection?: () => void;

  constructor(protected readonly str: StrApi, protected readonly input: HTMLInputElement | HTMLTextAreaElement) {
    input.addEventListener('input', this.onInput as any);
    document.addEventListener('selectionchange', this.onSelectionChange);
  }

  public get(): string {
    return this.input.value;
  }

  public getLength(): number {
    return this.input.value.length;
  }

  public set(text: string): void {
    this.input.value = text;
  }

  public getSelection(): [number, number, -1 | 0 | 1] | null {
    const input = this.input;
    const {selectionStart, selectionEnd, selectionDirection} = input;
    const direction = selectionDirection === 'backward' ? -1 : selectionDirection === 'forward' ? 1 : 0;
    return [
      typeof selectionStart === 'number' ? selectionStart : -1,
      typeof selectionEnd === 'number' ? selectionEnd : -1,
      direction,
    ];
  }

  public setSelection(start: number, end: number, direction: -1 | 0 | 1): void {
    const input = this.input;
    input.selectionStart = start > -1 ? start : null;
    input.selectionEnd = end > -1 ? end : null;
    input.selectionDirection = direction === -1 ? 'backward' : direction === 1 ? 'forward' : 'none';
  }

  protected createChange(event: InputEvent): SimpleChange | undefined {
    // console.log(event);
    const {input} = this;
    const {data, inputType, isComposing} = event;
    if (isComposing) return;
    switch (inputType) {
      case 'deleteContentBackward': {
        const {selection} = this;
        const {start, end} = selection;
        if (typeof start !== 'number' || typeof end !== 'number') return;
        if (start === end) return [start - 1, 1, ''];
        return [start, end - start, ''];
      }
      case 'deleteContentForward': {
        const {selection} = this;
        const {start, end} = selection;
        if (typeof start !== 'number' || typeof end !== 'number') return;
        if (start === end) return [start, 1, ''];
        return [start, end - start, ''];
      }
      case 'deleteByCut': {
        const {start, end} = this.selection;
        if (typeof start !== 'number' || typeof end !== 'number') return;
        if (start === end) return;
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        const str = this.str;
        const view = str.view();
        const input = this.input;
        const value = input.value;
        if (view.length - value.length !== max - min) return;
        return [min, max - min, ''];
      }
      case 'insertFromPaste': {
        const {start, end} = this.selection;
        if (typeof start !== 'number' || typeof end !== 'number') return;
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        const str = this.str;
        const view = str.view();
        const input = this.input;
        const value = input.value;
        const newMax = Math.max(input.selectionStart ?? 0, input.selectionEnd ?? 0);
        if (newMax <= min) return;
        const remove = max - min;
        const insert = value.slice(min, newMax);
        if (value.length !== view.length - remove + insert.length) return;
        return [min, remove, insert];
      }
      case 'insertText': {
        if (!data || data.length !== 1) return;
        const {selectionStart, selectionEnd} = input;
        if (selectionStart === null || selectionEnd === null) return;
        if (selectionStart !== selectionEnd) return;
        if (selectionStart <= 0) return;
        const selection = this.selection;
        if (selectionStart - data.length !== selection.start) return;
        if (typeof selection.end !== 'number' || typeof selection.end !== 'number') return;
        const remove = selection.end - selection.start;
        return [selection.start, remove, data];
      }
    }
    return;
  }

  private readonly onInput = (event: Event) => {
    const change = this.createChange(event as InputEvent);
    this.onchange!(change);
  };

  private readonly onSelectionChange = () => {
    this.onselection!();
  };

  public dispose(): void {
    this.input.removeEventListener('input', this.onInput as any);
    document.removeEventListener('selectionchange', this.onSelectionChange);
  }
}
