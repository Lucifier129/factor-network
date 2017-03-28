import Calculator from './Calculator'
import { prop, indentity } from './util'

export default class Layer {
	constructor(id, calculatorNumber = 0) {
		this.id = id
		this.calculators = Array(calculatorNumber)
	}
	generateCalculators(factorNumber, data = []) {
		let { calculators } = this
		for (let i = 0; i < calculators.length; i++) {
			let calculator = new Calculator(factorNumber)
			calculator.generateFactors(data[i])
			calculators.push(calculator)
		}
	}
	compute(inputs, getValue = indentity) {
		let { id, calculators } = this

		for (let i = 0; i < calculators.length; i++) {
			let calculator = calculators[i]
			calculator.compute(getValue(input[i]))
		}
	}
	output() {
		let { calculators } = this
		return calculators.map(prop('value'))
	}
}