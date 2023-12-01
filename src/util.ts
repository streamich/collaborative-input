import type {SimpleChange} from './types';

export const applyChange = (str: string, [position, remove, insert]: SimpleChange): string =>
  str.slice(0, position) + insert + str.slice(position + remove);

export const invokeFirstOnly = () => {
  let invoked: boolean = false;
  return (fn: () => void): void => {
    if (invoked) return;
    invoked = true;
    try {
      fn();
    } finally {
      invoked = false;
    }
  };
};
