import {
	randomClamped,
	activation
} from './util'

export function create(options) {
	let network = []
	let previousInputs = options[0]
	for (let i = 1; i < options.length; i++) {
		let currentLayer = []
		for (let j = 0; j < options[i]; j++) {
			let currentNode = []
			for (let k = 0; k < previousInputs; k++) {
				let randomWeight = randomClamped()
				currentNode.push(randomWeight)
			}
			currentLayer.push(currentNode)
		}
		previousInputs = currentLayer.length
		network.push(currentLayer)
	}
	return network
}

export function compute(network, inputs, activationType) {
	let currentInputs = inputs
	let networkResult = [inputs.concat()]
	for (let i = 0; i < network.length; i++) {
		let currentLayer = network[i]
		let currentLayerResult = []
		for (let j = 0; j < currentLayer.length; j++) {
			let currentNode = currentLayer[j]
			let sum = 0
			for (let k = 0; k < currentNode.length; k++) {
				let currentWeight = currentNode[k]
				sum += currentInputs[k] * currentWeight
			}
			let currentNodeResult = activation[activationType].output(sum)
			currentLayerResult.push(currentNodeResult)
		}
		networkResult.push(currentLayerResult)
		currentInputs = currentLayerResult
	}
	return networkResult
}

export function walk(network, accessor) {
	for (let i = 0; i < network.length; i++) {
		let currentLayer = network[i]
		for (let j = 0; j < currentLayer.length; j++) {
			let currentNode = currentLayer[j]
			for (let k = 0; k < currentNode.length; k++) {
				let currentWeight = currentNode[k]
				accessor({
					weight: currentWeight,
					node: currentNode,
					layer: currentLayer,
					network: network,
					path: [i, j, k]
				})
			}
		}
	}
}

export function copy(network) {
	return JSON.parse(JSON.stringify(network))
}