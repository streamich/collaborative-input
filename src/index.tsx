import {StrBinding} from 'collaborative-editor';
import {InputEditor} from './InputEditor';
import type {CollaborativeStr} from 'collaborative-editor';

export const bind = (
  str: CollaborativeStr,
  input: HTMLInputElement | HTMLTextAreaElement,
  polling?: boolean,
): (() => void) => {
  const editor = new InputEditor(str, input);
  const binding = new StrBinding(str, editor);
  binding.syncFromModel();
  binding.bind(polling);
  return binding.unbind;
};
