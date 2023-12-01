# Collaborative `<input>` and `<textarea>` elements

This package provides bindings for `<input>` and `<textarea>` elements to
JSON CRDT data structures. It allows multiple users to edit the `<input>` and
`<textarea>` elements simultaneously.


## Usage

Installation:

```
npm install collaborative-input
```

Usage:

```ts
import {StrBinding} from 'collaborative-input';

const str = model.api.str(['path', 'to', 'string']);
const input = document.getElementById('input');
const unbind = StrBinding.bind(str, input);

// When done, unbind the binding.
unbind();
```


## Preview

See [demo](https://streamich.github.io/collaborative-input).
