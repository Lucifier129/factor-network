let FactorNetwork = require('../../')
let {
	network: $network,
	createEvolution,
	createBackPropagation,
} = FactorNetwork

module.exports = function createNEBP(options) {
	let evolution = createEvolution(options)
	let learner = createBackPropagation({
		network: options.network,
		activation: options.activation,
		learningRate: options.learningRate,
	})
	let getOuput = options.output ? results => options.output(results[results.length - 1]) : results => results[results.length - 1]

	let recoder = []

	function compute(index, inputs) {
		let results = evolution.compute(index, inputs)

		if (!recoder[index]) {
			recoder[index] = {
				inputList: [],
				outputList: [],
			}
		}

		recoder[index].inputList.push(inputs)
		recoder[index].outputList.push(getOuput(results))

		return results
	}

	function output(index, inputs) {
		compute(index, inputs)
		let outputList = recoder[index].outputList
		return outputList[outputList.length - 1]
	}

	function training(bestNetworkIndex) {
		let bestNetwork = evolution.getNetworks()[bestNetworkIndex]
		let target = recoder[bestNetworkIndex]
		let inputList = target.inputList
		let outputList = target.outputList

		for (let i = 0; i < inputList.length; i++) {
			learner.train(
				inputList[i],
				outputList[i]
			)
		}

		recoder = []
	}

	function insertLearnerToEvolution() {
		let netwrokList = evolution.getNetworks()
		netwrokList.pop()
		netwrokList.push($network.copy(learner.getNetwork()))
	}

	function adjust(ranks) {
		let result = evolution.adjust(ranks)

		training(ranks[0])
		insertLearnerToEvolution()
		return result
	}

	return Object.assign({}, evolution, {
		compute,
		output,
		adjust,
	})

}

function getOuput(output, results) {
	return output(results[results.length - 1])
}