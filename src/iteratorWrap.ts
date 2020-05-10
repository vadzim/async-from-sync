import { asyncWrap } from "./asyncWrap"

export function iteratorWrap<T>(
	iterable: Iterable<PromiseLike<T> | T> | AsyncIterable<T>,
): Iterable<PromiseLike<T> | T> | AsyncIterable<T> {
	// istanbul ignore next
	return engineValid ? iterable : asyncWrap(iterable)
}

let engineValid = false

isEngineValid().then(valid => {
	engineValid = valid
})

async function isEngineValid() {
	let finallyCalled = false
	let catchCalled = false
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for await (const x of (function* () {
			try {
				yield Promise.reject()
			} finally {
				// istanbul ignore next
				finallyCalled = true
			}
		})()) {
			// istanbul ignore next
			throw new Error("impossible")
		}
	} catch {
		catchCalled = true
	}
	return catchCalled && finallyCalled
}
