let fs = require('fs')
let path = require('path')
let mnist = require('mnist')
let {
	createEvolution,
	createBackPropagation
} = require('../../')

let {
	training: trainingData,
	test: testData,
} = mnist.set(200, 100)

const NETWORK_PATH = path.join(__dirname, `./network/mnist-ne.json`)
const INPUT_LENGTH = 28 * 28

let evolution = createEvolution({
	network: [INPUT_LENGTH, 25, 10],
	amount: 50,
})

try {
	evolution.replaceNetworks(require(NETWORK_PATH))
} catch (error) {
	console.log('There is no default networks exist')
}

function training() {


	for (let i = 0; i < trainingData.length; i++) {
		let {
			input,
			output
		} = trainingData[i]
		let list = Array
			.from({
				length: evolution.options.amount
			})
			.map(() => 0)
		for (let j = 0; j < evolution.options.amount; j++) {
			let results = evolution.compute(j, input)
			let result = results[results.length - 1]
			list[j] += getError(result, output)
		}
		let ranks = list.map((value, index) => ({
				value,
				index
			}))
			.sort((a, b) => a.value - b.value)
			.map(({
				index
			}) => index)

		evolution.adjust(ranks)
	}


}

function getError(left, right) {
	let sum = 0
	for (let i = 0; i < left.length; i++) {
		sum += Math.abs(right[i] - left[i])
	}
	return sum
}

function save() {
	fs.writeFileSync(NETWORK_PATH, JSON.stringify(evolution.getNetworks(), null, 2))
}

function test() {
	let statsList = []
	for (let i = 0; i < evolution.options.amount; i++) {
		statsList.push(testByIndex(i))
	}

	statsList.sort((a, b) => a.rate - b.rate)
	console.log('result', JSON.stringify(statsList, null, 2))
}

function testByIndex(index) {
	let stats = {
		index,
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
		let results = evolution.compute(index, item.input)
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
	stats.detail = detail
	stats.rate = stats.correct / stats.total * 100

	return stats
}

console.time('training')
training()
console.timeEnd('training')
console.time('save')
save()
console.timeEnd('save')
console.time('test')
test()
console.timeEnd('test')

function getAvg(list) {
	return list.reduce((sum, item) => sum + item, 0) / list.length
}


function getResult(results) {
	return results
		.map((value, index) => ({
			value,
			index
		}))
		.reduce((a, b) => a.value > b.value ? a : b)
		.index
}