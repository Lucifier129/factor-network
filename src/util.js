export function indentity(input) {
	return input
}

export function prop(propName) {
	return obj => obj[propName]
}

export function randomClamped() {
	return Math.random() * 2 - 1
}

export function randomBoolean() {
	return Math.random() <= 0.5
}