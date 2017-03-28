import Layer from './Layer'
import { indentity, prop } from './util'

export default class Network {
	constructor(shape = []) {
		this.shape = shape
		this.layers = []
	}
	generateLayers(data = []) {
		let { shape, layers } = this
		let inputNumber = 0
		for (let i = 0; i < shape.length; i++) {
			let layer = new Layer(i, shape[i])
			layer.generateCalculators(inputNumber, data[i])
			layers.push(layer)
			inputNumber = shape[i]
		}
	}
	compute(inputs) {
		let { shape, layers } = this
		let currentInputs = inputs
		let getValue = prop('value')
		for (let i = 0; i < layers.length; i++) {
			let layer = layers[i]
			layer.compute(currentInputs, i === 0 ? indentity : getValue)
			currentInputs = layer.calculators
		}
		return layers[layers.length - 1].output()
	}
}