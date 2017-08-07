let FactorNetwork = require('../../')
let {
	network: $network,
	createEvolution,
	createBackPropagation,
} = FactorNetwork

let defaults = {
	learningRate: 0.1,
	learningRange: 1,
	activation: 'SIGMOID',
}

module.exports = function createNEBP(settings) {
	let options = Object.assign({}, defaults, settings)
	let evolution = createEvolution(options)
	let learner = createBackPropagation(options)
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

	function training(index) {
		let target = recoder[index]
		let inputList = target.inputList
		let outputList = target.outputList

		for (let i = 0; i < inputList.length; i++) {
			learner.train(
				inputList[i],
				outputList[i]
			)
		}
	}

	function insertLearnerToEvolution() {
		let netwrokList = evolution.getNetworks()
		netwrokList.pop()
		netwrokList.push($network.copy(learner.getNetwork()))
	}

	function adjust(ranks) {
		let learningRange = options.learningRange || 1

		while (--learningRange >= 0) {
			training(ranks[learningRange])
		}

		recoder = []
		insertLearnerToEvolution()

		return evolution.adjust(ranks)
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