import * as $network from './network'
import { activation } from './util'

function computeNetworkError(network, errors) {
	let networkError = [errors.concat()]
	let inputErrors = errors

	for (let i = network.length - 2; i >= 0; i--) {
		let currentLayer = network[i]
		let nextLayer = network[i + 1]
		let layerError = []
		for (let j = currentLayer.length - 1; j >= 0; j--) {
			let nodeError = 0
			for (let k = nextLayer.length - 1; k >= 0; k--) {
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
		let currentInput = networkResult[path[0]][path[2]]
		let currentResult = networkResult[path[0] + 1][path[1]]
		let currentError = networkError[path[0]][path[1]]
		let deltaWeight = -learningRate * currentError * currentInput * activation[activationType].derivative(currentResult)
		let newWeight = currentWeight + deltaWeight
		network[path[0]][path[1]][path[2]] = newWeight
	})
}

export default function create(options) {
	let network = $network.create(options.network)
	let networkResult = null

	function getNetwork() {
		return network
	}

	function compute(inputs) {
		networkResult = $network.compute(
			network,
			inputs,
			options.activation || 'SIGMOID'
		)
		return networkResult
	}

	function computeError(labels) {
		let errors = []
		let lastResult = networkResult[networkResult.length - 1]
		for (let i = 0; i < labels.length; i++) {
			let error = lastResult[i] - labels[i]
			errors.push(error)
		}
		return computeNetworkError(network, errors)
	}

	function adjust(labels) {
		let networkError = computeError(labels)
		updateNetworkWeights(
			network,
			networkResult,
			networkError,
			options.activation || 'SIGMOID',
			options.learningRate
		)
	}

	return {
		options: options,
		getNetwork: getNetwork,
		compute: compute,
		adjust: adjust,
	}
}