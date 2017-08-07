let path = require('path')
let fs = require('fs')
let FactorNetwork = require('../../')
let {
	createEvolution
} = FactorNetwork

let createNEBP = require('./createNEBP')

let Board = require('../src/2048/Board')

let NETWORK_PATH = path.join(__dirname, `./network/2048-ne.json`)

let evolution = createNEBP({
	network: [16, 8, 4],
	amount: 100,
	activation: 'SIGMOID',
	output: list => {
		let indexOfMax = list.map(toObj).reduce(getMax).index
		let result = Array.from({ length: 4 }).fill(0)
		result[indexOfMax] = 1
		return result
	}
})

let maxScore = 0
let maxNumber = 0
let count = 0
let playTotal = 0
let deadTotal = 0
try {
	evolution.replaceNetworks(require(NETWORK_PATH))
} catch (error) {
	console.log('There is no default networks exist')
}

Array.from({
	length: 1000
}).map(train)
save()
console.log({
	maxScore,
	maxNumber
})

function save() {
	fs.writeFileSync(NETWORK_PATH, JSON.stringify(evolution.getNetworks(), null, 2))
}

function train() {
	let start = Date.now()
	let list = []
	for (let i = 0; i < evolution.options.amount; i++) {
		list[i] = {
			value: trainItem(i),
			index: i,
		}
	}
	let sortList = list.sort(sortMax)
	let ranks = sortList.map(getIndex)
	evolution.adjust(ranks)

	let end = Date.now()
	let time = end - start
	let currentMax = sortList[0].value
	let currentAvg = sortList.reduce((sum, item) => sum + item.value, 0) / sortList.length

	count += 1
	console.log({
		count,
		time,
		currentMax,
		currentAvg,
		maxScore,
		maxNumber,
		playTotal,
		deadTotal,
		rate: deadTotal / playTotal * 100
	})
}

function trainItem(index) {
	let board = new Board()

	playTotal += 1

	while (!board.hasWon() || !board.hasLost()) {
		let cells = getFlatList(board.cells)
		let max = cells.reduce(getMax).value
		let input = cells.map(({ value }) => value ? Math.log2(value) / Math.log2(max) : 0)
		let output = evolution.output(index, input)
		let direction = output.map(toObj).reduce(getMax).index
		board.move(direction)
		if (!board.hasChanged) {
			deadTotal += 1
			break
		}
	}

	let max = getFlatList(board.cells).reduce(getMax).value
	maxScore = Math.max(maxScore, board.score)
	maxNumber = Math.max(maxNumber, max)
	return board.score
}

function getFlatList(list) {
	if (!Array.isArray(list)) {
		return list
	}
	let result = []
	for (let i = 0; i < list.length; i++) {
		result = result.concat(getFlatList(list[i]))
	}
	return result
}

function getValue(value) {
	return value ? Math.log2(value) / 12 : value
}

function sortMax(a, b) {
	return b.value - a.value
}

function getMax(a, b) {
	if (a.value > b.value) {
		return a
	} else if (a.value === b.value) {
		return Math.random() > 0.5 ? a : b
	} else {
		return b
	}
}

function getSum(a, b) {
	return a + b
}

function toObj(value, index) {
	return {
		value,
		index
	}
}

function getIndex(obj) {
	return obj.index
}