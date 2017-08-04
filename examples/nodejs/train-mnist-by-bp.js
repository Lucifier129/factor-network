let fs = require('fs')
let path = require('path')
let mnist = require('mnist')
let {
	createBackPropagation
} = require('../../')

let {
	training: trainingData,
	test: testData,
} = mnist.set(2000, 8000)

const NETWORK_PATH = path.join(__dirname, `./network/bp.json`)
const INPUT_LENGTH = 28 * 28

let learner = createBackPropagation({
	network: [INPUT_LENGTH, 25, 10],
	learningRate: 0.08,
})

try {
	learner.replaceNetwork(require(NETWORK_PATH))
} catch(error) {
	console.log('There is no default network exist')
}

function training() {
	for (let i = 0; i < trainingData.length; i++) {
		let { input, output } = trainingData[i]
		learner.train(input, output)
	}
}

function save() {
	fs.writeFileSync(NETWORK_PATH, JSON.stringify(learner.getNetwork(), null, 2))
}

function test() {
	let stats = {
		total: 0,
		correct: 0,
	}
	let detail = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => {
		return {
			number,
			total: 0,
			correct: 0,
		}
	})
	for (let i = 0; i < testData.length; i++) {
		let item = testData[i]
		let results = learner.compute(item.input)
		let result = results[results.length - 1]
		let output = getResult(result)
		let answer = getResult(item.output)

		detail[answer].total += 1
		stats.total += 1

		if (output === answer) {
			detail[answer].correct += 1
			stats.correct += 1
		}
	}

	detail.forEach(item => item.rate = item.correct / item.total * 100)
	stats.rate = stats.correct / stats.total * 100
	stats.detail = detail

	console.log('result', stats)
}

training()
save()
test()

function getAvg(list) {
	return list.reduce((sum, item) => sum + item, 0) / list.length
}


function getResult(results) {
	return results
			.map((value, index) => ({ value, index }))
			.reduce((a, b) => a.value > b.value ? a : b)
			.index
}