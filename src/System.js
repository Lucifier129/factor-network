import Network from './Network'
import { prop } from './util'

export default class System {
	constructor(networkNumber = 0) {
		this.networks = Array(networkNumber)
	}
	generateNetworks(data = []) {
		let { networks } = this
		for (let i = 0; i < networks.length; i++) {
			let network = new Network(data[i].shape)
			network.generateLayers(data[i].content)
			networks.push(network)
		}
	}
	compute(inputs) {
		let { networks } = this
		let results = []
		for (let i = 0; i < networks.length; i++) {
			let network = networks[i]
			let result = network.compute(inputs)
			results.push(result)
		}
		return results
	}
}