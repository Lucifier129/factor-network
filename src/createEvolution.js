import {
	randomBoolean,
	randomClamped
} from './util'
import * as $network from './network'

const defaults = {
	network: [2, 2, 1],
	amount: 50,
	elitismRate: 0.2,
	randomRate: 0.2,
	mixNumber: 1,
	mutation: {
		rate: 0.1,
		range: 0.5,
	},
	activation: 'SIGMOID'
}

export default function createEvolution(settings) {
	let options = Object.assign({}, defaults, settings)
	let networks = []

	function createNetworks(amount) {
		for (let i = 0; i < amount; i++) {
			let network = $network.create(options.network)
			networks.push(network)
		}
		options.amount = networks.length
	}

	function updateAmount(targetAmount) {
		let currentAmount = networks.length
		if (currentAmount > targetAmount) {
			networks.length = targetAmount
			options.amount = targetAmount
		} else if (currentAmount < targetAmount) {
			createNetworks(targetAmount - currentAmount)
		}
	}

	function getNetworks() {
		return networks
	}

	function sortNetworks(ranks) {
		let newNetworks = []
		for (let i = 0; i < ranks.length; i++) {
			newNetworks.push(networks[ranks[i]])
		}
		networks = newNetworks
		options.amount = networks.length
	}

	function compute(index, inputs) {
		return $network.compute(
			networks[index],
			inputs,
			options.activation
		)
	}

	function adjust(ranks) {
		if (ranks) {
			sortNetworks(ranks)
		}

		let newNetworks = []

		let elitismAmount = Math.round(options.elitismRate * options.amount)
		for (let i = 0; i < elitismAmount; i++) {
			newNetworks.push(networks[i])
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
						$network.copy(networks[i]),
						networks[max],
						options.mutation
					)
					newNetworks.push(newNetwork)
					if (newNetworks.length >= options.amount) {
						newNetworks.length = options.amount
						networks = newNetworks
						return
					}
				}
			}
			max++
			if (max === networks.length) {
				max = 0
			}
		}
	}

	createNetworks(options.amount)

	return {
		options: options,
		createNetworks: createNetworks,
		getNetworks: getNetworks,
		sortNetworks: sortNetworks,
		updateAmount: updateAmount,
		compute: compute,
		adjust: adjust
	}
}

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