let path = require('path')
let fs = require('fs')
let FactorNetwork = require('../../')
let { createEvolution } = FactorNetwork

let Board = require('../src/2048/Board')

let NETWORK_PATH = path.join(__dirname, `./network/2048-ne.json`)

let evolution = createEvolution({
	network: [16, 15, 4],
	amount: 50,
	activation: 'SIGMOID'
})

let maxScore = 0

try {
	evolution.replaceNetworks(require(NETWORK_PATH))
} catch (error) {
	console.log('There is no default networks exist')
}

Array.from({ length: 1000 }).map(train)
save()
console.log('maxScore', maxScore)

function save() {
	fs.writeFileSync(NETWORK_PATH, JSON.stringify(evolution.getNetworks(), null, 2))
}

function train() {
	let list = []
	for (let i = 0; i < evolution.options.amount; i++) {
		list[i] = trainItem(i)
	}

	let ranks = list.map(toObj).sort((a, b) => b.value - a.value)
	console.log('ranks', ranks.concat().reverse())
	evolution.adjust(ranks.map(getIndex))
}

function trainItem(index) {
	let board = new Board()

	while (!board.hasWon() || !board.hasLost()) {
		let cells = board.cells[0]
			.concat(board.cells[1])
			.concat(board.cells[2])
			.concat(board.cells[3])
		let max = cells.reduce(getMax).value
		let input = cells.map(({ value }) => value / max)
		let results = evolution.compute(index, input)
		let direction = results[results.length - 1]
			.map(toObj).reduce(getMax).index
		board.move(direction)
		if (!board.hasChanged) {
			break
		}
	}
	maxScore = Math.max(maxScore, board.score)
	return board.score
}

function getValue({ value }) {
	return value / 2048
}

function getMax(a, b) {
	return a.value > b.value ? a : b
}

function toObj(value, index) {
	return  { value, index }
}

function getIndex(obj) {
	return obj.index
}


