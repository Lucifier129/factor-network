import {
	randomBoolean,
	randomClamped
} from './util'
import * as $network from './network'


function mixNetwork(targetNetwork, sourceNetwork, mutation) {
	$network.walk(targetNetwork, function(data) {
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

export default function create(options) {
	let networks = []

	for (let i = 0; i < options.amount; i++) {
		let network = $network.create(options.network)
		networks.push(network)
	}

	function getNetworks() {
		return networks
	}

	function compute(index, inputs) {
		return $network.compute(
			networks[index],
			inputs,
			options.activation || 'SIGMOID'
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
			newNetworks.push($network.create(options.network))
		}

		let max = 0
		while (true) {
			for (let i = 0; i < max; i++) {
				for (let j = 0; j < options.mixNumber; j++) {
					let newNetwork = mixNetwork(
						$network.copy(sorts[i].network),
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