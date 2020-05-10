import { asyncFromSync } from "./asyncFromSync"

export function asyncWrap<T>(iterable: Iterable<PromiseLike<T> | T> | AsyncIterable<T>): AsyncIterable<T> {
	return isIterable(iterable) ? asyncFromSync(iterable) : iterable
}

function isIterable<T>(value: object): value is Iterable<T> {
	return typeof (value as Iterable<T>)[Symbol.iterator] === "function"
}
