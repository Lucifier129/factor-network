import { SIGMOID } from './activation'
import { randomClamped, randomBoolean } from '../util'

export default class Neuron {
	constructor(value = 0, weightList = []) {
		this.value = value
		this.weightList = weightList
		this.activation = SIGMOID
	}
	populate(amount) {
		let { weightList } = this
		for (let i = 0; i < amount; i++) {
			weightList.push(randomClamped())
		}
	}
	repopulate() {
		let amount = this.weightList.length
		this.weightList = []
		this.populate(amount)
	}
	computeByInput(input) {
		this.value = input
	}
	computeByInputs(neuronInputs) {
		let sum = 0
		for (let i = 0, len = neuronInputs.length; i < len; i++) {
			sum += neuronInputs[i].value * this.weightList[i]
		}
		this.value = this.activation(sum)
	}
	clone() {
		return new Neuron(this.value, this.weightList.concat())
	}
	mix(otherNeuron) {
		let { weightList } = this
		for (let i = 0, len = weightList.length; i < len; i++) {
			if (randomBoolean()) {
				weightList[i] = otherNeuron.weightList[i]
			}
		}
	}
}