# async-from-sync

Using async `for-await-of` loop to iterate over sync generator is possible, but can cause strange effects in some edge cases ([https://bugzilla.mozilla.org/show_bug.cgi?id=1610315](https://bugzilla.mozilla.org/show_bug.cgi?id=1610315)).

This is not a problem if you are developing an app because you know what kind of iterable you have and can use the appropriate loop.

But if you are developing a library it can be nice to have the same code to work with both sync and async input. So there is a choice between a simpler code with one `for-await-of` loop which works for most cases but not all and more complex code with type checking and two loops `for-of` and `for-await-of`.

This module lets you have one loop which just works.

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

Let's fix that:
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

The same applies to `yield*` operator if used with sync iterables.

## API

### asyncFromSync(iterator: Iterable): AsyncIterable

Converts sync iterator to async one in the right way.

### asyncWrap(iterator: Iterable | AsyncIterable): AsyncIterable

Returns async iterator. Does convertion if sync iterator is passed.

### iteratorWrap(iterator: Iterable | AsyncIterable): Iterable | AsyncIterable

Does conversion only if needed. Does not any conversion if javascript engine always calls finally blocks of generators. Useful if you need to have a thing that just works:
```js
async function F() {
  for await (const x of iteratorWrap(someIterable)) { ... }
}
async function* G() {
  yield* iteratorWrap(someIterable)
}
```
