export default class Factor {
	constructor(weight = 0.1) {
		this.input = 0
		this.value = 0
		this.weight = weight
	}
	updateWeight(weight) {
		if (typeof weight !== 'number') {
			throw new Error(`Expected weight to be a number`)
		}
		this.weight = weight
	}
	compute(input) {
		if (typeof input !== 'number') {
			throw new Error(`Expected input to be a number`)
		}
		this.input = input
		this.value = input * this.weight
		return this.value
	}
}