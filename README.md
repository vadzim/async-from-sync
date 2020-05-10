# async-from-sync

The right way to iterate with for-await-of.

Using async `for-await-of` loop to iterate over sync generator is possible, but can cause strange effects in some edge cases.

```js
// The following finally section will never be called if generator
// is consumed by for-await-of:
function* generator() {
  try {
    yield Promise.resolve(42)
    yield Promise.reject(43)
  } finally {
    console.log('finally')
  }
}

for await (const x of generator()) {
  console.log(x)
}
// 42
// Error thrown: 43

// But if you iterate over that generator with sync for-of loop
// and await yielded promise inside that loop, then finally is called
// as expected:
for (const x of generator()) {
  console.log(await x)
}
// 42
// finally
// Error thrown: 43
```

This module provides `iteratorWrap` function which fixes that:
```js
import { iteratorWrap } from 'async-from-sync'

function* generator() { ... }

for await (const x of iteratorWrap(generator())) {
  console.log(x)
}
// 42
// finally
```

The same aplies to `yield*` operator if used with sync iterables.

See https://github.com/tc39/ecma262/issues/1849

## API

### asyncFromSync(iterator: Iterable): AsyncIterable

Converts sync iterator to async one in the right way.

### asyncWrap(iterator: Iterable | AsyncIterable): AsyncIterable

Returns async iterator. Does convertion if sync iterator is passed.

### iteratorWrap(iterator: Iterable | AsyncIterable): Iterable | AsyncIterable

Does conversion only if needed. Does not any conversion if javascript engine always call finally blocks of generators.
Usefull mostly if you need to have a thing that just work:
```js
async function F() {
  for await (const x of iteratorWrap(someIterable)) { ... }
}
async function* G() {
  yield* iteratorWrap(someIterable)
}
```
