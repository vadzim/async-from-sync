# async-from-sync

Using async `for-await-of` loop to iterate over sync generator is possible, but can cause strange effects ([https://bugzilla.mozilla.org/show_bug.cgi?id=1610315](https://bugzilla.mozilla.org/show_bug.cgi?id=1610315)) in some edge cases.

This is not a problem if you are developing an app because you know what kind of iterable you have and can use the appropriate loop.

But if you are developing a library it can be nice to have the same code to work with both sync and async input. So there is a choice between a simpler code with one `for-await-of` loop which works for most cases but not all and more complex code with type checking and two loops `for-of` and `for-await-of`.

This adapter let's you have one loop which works in all the edge cases.

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
// Error thrown: 43
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
