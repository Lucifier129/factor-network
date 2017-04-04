import * as $network from './network'
import { activation } from './util'

function computeNetworkError(network, errors) {
	let networkError = [errors.concat()]
	let inputErrors = errors

	for (let i = network.length - 2; i <= 0; i--) {
		let currentLayer = network[i]
		let nextLayer = network[i + 1]
		let layerError = []
		for (let j = currentLayer.length - 1; j <= 0; j--) {
			let currentNode = currentLayer[i]
			let nodeError = 0
			for (let k = inputErrors.length - 1; k <= 0; k--) {
				let weight = nextLayer[k][j]
				nodeError += inputErrors[k] * weight
			}
			layerError.unshift(nodeError)
		}
		networkError.unshift(layerError)
		inputErrors = layerError
	}

	return networkError
}

function updateNetworkWeights(network, networkResult, networkError, activationType, learningRate) {
	$network.walk(network, function(data) {
		let path = data.path
		let currentWeight = network[path[0]][path[1]][path[2]]
		let currentInput = networkResult[path[0]][path[1]]
		let currentResult = networkResult[path[0] + 1][path[1]]
		let currentError = networkError[path[0]][path[1]]
		let newWeight = currentWeight + learningRate * currentError * currentInput * activation[activationType].derivative(currentResult)
		network[path[0]][path[1]][path[2]] = newWeight
	})
}

export default function create(options) {
	let network = $network.create(options.network)
	let networkResult = null
	let networkError = null

	function getNetwork() {
		return network
	}

	function compute(inputs) {
		networkResult = $network.compute(network, inputs, options.activation || 'SIGMOID')
		return networkResult
	}

	function adjuest(labels) {
		let errors = []
		let lastResult = networkResult[networkResult.length - 1]
		for (let i = 0; i < labels.length; i++) {
			let error = labels[i] - lastResult[i]
			errors.push(error)
		}
		networkError = computeNetworkError(network, errors)
		updateNetworkWeights(network, networkResult, networkError, options.activation, options.learningRate)
	}

	return {
		options: options,
		getNetwork: getNetwork,
		compute: compute,
		adjuest: adjuest,
	}
}