import Neuron from './Neuron'

export default class Layer {
	constructor(index) {
		this.index = index
		this.neuronList = []
	}
	populate(neuronAmount, inputAmount) {
		let { neuronList } = this
		for (let i = 0; i < neuronAmount; i++) {
			let neuron = new Neuron()
			neuron.populate(inputAmount)
			neuronList.push(neuron)
		}
	}
	compute(inputs) {
		if (this.index === 0) {
			this.computeByInputs(inputs)
		} else {
			this.computeByPrevious(inputs)
		}
	}
	computeByInputs(inputs) {
		for (let i = 0, len = inputs.length; i < len; i++) {
			this.neuronList[i].computeByInput(inputs[i])
		}
	}
	computeByPrevious(previousLayer) {
		let currentNeuronList = this.neuronList
		let previousNeuronList = previousLayer.neuronList
		for (let i = 0, len = currentNeuronList.length; i < len; i++) {
			currentNeuronList[i].computeByInputs(previousNeuronList)
		}
	}
	output() {
		let results = []
		for (let i = 0, len = this.neuronList.length; i < len; i++) {
			results.push(this.neuronList[i].value)
		}
		return results
	}
	clone() {
		let newLayer = new Layer(this.index)
		let { neuronList } = this
		for (let i = 0, len = neuronList.length; i < len; i++) {
			newLayer.neuronList.push(neuronList[i].clone())
		}
		return newLayer
	}
	mix(otherLayer) {
		let { neuronList } = this
		for (let i = 0, len = neuronList.length; i < len; i++) {
			neuronList[i].mix(otherLayer.neuronList[i])
		}
	}
}