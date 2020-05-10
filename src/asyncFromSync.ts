export async function* asyncFromSync<T>(iterable: Iterable<PromiseLike<T> | T>): AsyncGenerator<T> {
	for (const item of iterable) yield await item
}
