import Layer from './Layer'
import { randomClamped } from '../util'

export default class Network {
	constructor() {
		this.layerList = []
	}
	populate(inputAmount, hiddenAmountList, outputAmount) {
		let { layerList } = this
		let amountList = [inputAmount].concat(hiddenAmountList, outputAmount)
		let previousAmount = 0

		for (let i = 0, len = amountList.length; i < len; i++) {
			let amount = amountList[i]
			let layer = new Layer(i)
			layer.populate(amount, previousAmount)
			layerList.push(layer)
			previousAmount = amount
		}
	}
	compute(inputs) {
		let { layerList } = this
		let currentInputs = inputs

		for (let i = 0, len = layerList.length; i < len; i++) {
			layerList[i].compute(currentInputs)
			currentInputs = layerList[i]
		}

		let lastLayer = layerList[layerList.length - 1]
		let results = lastLayer.output()
		return results
	}
	clone() {
		let { layerList } = this
		let newNetwork = new Network()
		for (let i = 0, len = layerList.length; i < len; i++) {
			newNetwork.layerList.push(layerList[i].clone())
		}
		return newNetwork
	}
	mix(otherLayerList, mutation) {
		let { layerList } = this
		for (let i = 0, len = layerList.length; i < len; i++) {
			layerList[i].mix(otherLayerList[i])
		}
		this.each(neuron => {
			for (let i = 0, len = neuron.weightList.length; i < len; i++) {
				if (Math.random() <= mutation.rate) {
					neuron.weightList[i] += mutation.range * randomClamped()
				}
			}
		})
	}
	each(callback) {
		let { layerList } = this
		for (let i = 0, len = layerList.length; i < len; i++) {
			let neuronList = layerList[i].neuronList
			for (let j = 0, len1 = neuronList.length; j < len1; j++) {
				callback(neuronList[j])
			}
		}
	}
}