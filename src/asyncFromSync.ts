export async function* asyncFromSync<T>(iterable: Iterable<PromiseLike<T> | T>): AsyncGenerator<T> {
	const it = iterable[Symbol.iterator]()
	let needToClose
	try {
		for (;;) {
			needToClose = false
			const rec = it.next()
			needToClose = true
			if (rec.done) {
				needToClose = false
				return await rec.value
			}
			yield await rec.value
		}
	} finally {
		if (needToClose) {
			await it.return?.().value
		}
	}
}
