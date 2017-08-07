import * as $network from './network'
import { activation, identity } from './util'

const defaults = {
	network: [2, 2, 1],
	activation: 'SIGMOID',
	learningRate: 0.1,
	output: identity,
}

export default function createBackPropagation(settings) {
	let options = Object.assign({}, defaults, settings)
	let network = $network.create(options.network)
	let networkResult = null

	function getNetwork() {
		return network
	}

	function replaceNetwork(newNetwork) {
		network = newNetwork
	}

	function compute(inputs) {
		networkResult = $network.compute(
			network,
			inputs,
			options.activation
		)
		return networkResult
	}

	function output(index, inputs) {
		let results = compute(inputs)
		return options.output(results[results.length - 1])
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
			options.activation,
			options.learningRate
		)
	}

	function train(inputs, labels) {
		compute(inputs)
		adjust(labels)
	}

	return {
		options: options,
		getNetwork: getNetwork,
		replaceNetwork: replaceNetwork,
		compute: compute,
		adjust: adjust,
		train: train,
		output: output,
	}
}

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
		let currentActivation = $network.getActivation(activationType, path[0])
		let deltaWeight = -learningRate * currentError * currentInput * currentActivation.derivative(currentResult)
		let newWeight = currentWeight + deltaWeight
		network[path[0]][path[1]][path[2]] = newWeight
	})
}