export function randomClamped() {
	return Math.random() * 2 - 1
}

export function randomBoolean() {
	return Math.random() <= 0.5
}

export function identity(x) {
	return x
}

export const activation = {
	RELU: {
		output: RELU,
		derivative: RELU_DERIVATIVE
	},
	SIGMOID: {
		output: SIGMOID,
		derivative: SIGMOID_DERIVATIVE
	},
	TANH: {
		output: TANH,
		derivative: TANH_DERIVATIVE
	}
}

function RELU(x) {
	return Math.max(0, x)
}

function RELU_DERIVATIVE(x) {
	return x <= 0 ? 0 : 1
}

function SIGMOID(x) {
	return 1 / (1 + Math.exp(-x / 1))
}

function SIGMOID_DERIVATIVE(x) {
	return x * (1 - x)
}

function TANH(x) {
	if (x === Infinity) {
		return 1;
	} else if (x === -Infinity) {
		return -1;
	} else {
		let e2x = Math.exp(2 * x);
		return (e2x - 1) / (e2x + 1);
	}
}

function TANH_DERIVATIVE(x) {
	return 1 - x * x
}

function LINEAR(x) {
	return x
}

function LINEAR_DERIVATIVE(x) {
	return 1
}