import Factor from './Factor'
import { SIGMOID } from './activation'
import { indentity } from './util' 

export default class Calculator {
	constructor(factorNumber = 0, activation = SIGMOID) {
		this.value = 0
		this.factors = Array(factorNumber)
		this.activation = activation
	}
	generateFactors(data = []) {
		let { factors } = this
		for (let i = 0; i < factors.length; i++) {
			let factor = new Factor(data[i])
			factors.push(factor)
		}
	}
	updateFactors(data = []) {
		let { factors } = this
		for (let i = 0; i < factors.length; i++) {
			let factor = factors[i]
			factor.updateWeight(data[i])
		}
	}
	compute(input) {
		let { factors, activation } = this
		let sum = 0
		for (let i = 0; i < factors.length; i++) {
			let factor = factors[i]
			sum += factor.compute(input)
		}
		this.value = activation(sum)
		return this.value
	}
}