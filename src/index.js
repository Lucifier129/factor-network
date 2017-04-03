function createNetwork(options) {
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

function computeNetwork(network, inputs, activation) {
	let currentInputs = inputs
	let networkResult = []
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
			let currentNodeResult = activation(sum)
			currentLayerResult.push(currentNodeResult)
		}
		networkResult.push(currentLayerResult)
		currentInputs = currentLayerResult
	}
	return networkResult
}

function walkNetwork(network, accessor) {
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

function mixNetwork(targetNetwork, sourceNetwork, mutation) {
	walkNetwork(targetNetwork, function(data) {
		let path = data.path
		if (randomBoolean()) {
			let sourceWeight = sourceNetwork[path[0]][path[1]][path[2]]
			targetNetwork[path[0]][path[1]][path[2]] = sourceWeight
		}
		if (Math.random() <= mutation.rate) {
			targetNetwork[path[0]][path[1]][path[2]] += mutation.range * randomClamped()
		}
	})
	return targetNetwork
}

function copyNetwork(network) {
	return JSON.parse(JSON.stringify(network))
}

export default function createLearner(options) {
	let networks = []

	for (let i = 0; i < options.amount; i++) {
		let network = createNetwork(options.network)
		networks.push(network)
	}

	function getNetworks() {
		return networks
	}

	function compute(index, inputs) {
		return computeNetwork(
			networks[index],
			inputs,
			activation[options.activation] || SIGMOID
		)
	}

	let sorts = []

	function addItem(index, score) {
		sorts.push({
			score: score,
			network: networks[index]
		})
	}

	function clearAll() {
		sorts = []
	}

	function sortItems(sortType) {
		sorts.sort((a, b) => {
			if (sortType > 0) {
				return a.score - b.score
			} else {
				return b.score - a.score
			}
		})
	}

	function adjust() {
		if (sorts.length !== options.amount) {
			return
		}

		sortItems(options.sortType)

		let newNetworks = []

		let elitismAmount = Math.round(options.elitismRate * options.amount)
		for (let i = 0; i < elitismAmount; i++) {
			newNetworks.push(sorts[i].network)
		}

		let randomAmount = Math.round(options.randomRate * options.amount)
		for (let i = 0; i < randomAmount; i++) {
			newNetworks.push(createNetwork(options.network))
		}

		let max = 0
		while (true) {
			for (let i = 0; i < max; i++) {
				for (let j = 0; j < options.mixNumber; j++) {
					let newNetwork = mixNetwork(
						copyNetwork(sorts[i].network),
						sorts[max].network,
						options.mutation
					)
					newNetworks.push(newNetwork)
					if (newNetworks.length === options.amount) {
						sorts = []
						networks = newNetworks
						return
					}
				}
			}
			max++
		}
	}

	return {
		getNetworks: getNetworks,
		options: options,
		compute: compute,
		addItem: addItem,
		clearAll: clearAll,
		adjust: adjust
	}
}

function randomClamped() {
	return Math.random() * 2 - 1
}

function randomBoolean() {
	return Math.random() <= 0.5
}

const activation = {
	RELU: RELU,
	SIGMOID: SIGMOID,
	TANH: TANH,
}

function RELU(x) {
	return Math.max(0, x)
}

function SIGMOID(x) {
	return 1 / (1 + Math.exp(-x / 1))
}

function TANH(x) {
	if (x === Infinity) {
		return 1;
	} else if (x === -Infinity) {
		return -1;
	} else {
		let e2x = Math.exp(2 * x);
		return (e2x - 1) / (e2x + 1);
	}
}