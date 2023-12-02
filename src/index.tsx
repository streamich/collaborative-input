import {StrBinding} from 'collaborative-editor';
import {InputEditor} from './InputEditor';
import type {StrApi} from 'json-joy/es2020/json-crdt';

export const bind = (
  str: StrApi,
  input: HTMLInputElement | HTMLTextAreaElement,
  polling?: boolean,
): (() => void) => {
  const editor = new InputEditor(str, input);
  const binding = new StrBinding(str, editor);
  binding.syncFromModel();
  binding.bind(polling);
  return binding.unbind;
};
