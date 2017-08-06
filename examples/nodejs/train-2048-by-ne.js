let path = require('path')
let fs = require('fs')
let FactorNetwork = require('../../')
let {
	createEvolution
} = FactorNetwork

let Board = require('../src/2048/Board')

let NETWORK_PATH = path.join(__dirname, `./network/2048-ne.json`)

let evolution = createEvolution({
	network: [16, 4],
	amount: 100,
	activation: 'SIGMOID'
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
	let previousMove = 0

	let illegalCount = 0

	playTotal += 1

	while (!board.hasWon() || !board.hasLost()) {
		let cells = board.cells.map(row => row.map(({ value }) => value))
		let input = getFlatList(cells).map(getValue)
		let results = evolution.compute(index, input)
		let direction = results[results.length - 1].map(toObj).reduce(getMax).index
		previousMove = direction
		// console.log('result', direction, results[results.length - 1])
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

function move(cells, direction) {
	let clone = cells.map(cloneList)
	if (direction === 0) {
		return clone.map(moveLeft)
	} else if (direction === 1) {
		return rotateLeft(rotateRight(clone).map(moveRight))
	} else if (direction === 2) {
		return clone.map(moveRight)
	} else if (direction === 3) {
		return rotateLeft(rotateRight(clone).map(moveLeft))
	}
}

function cloneList(list) {
	return list.concat()
}

/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
function rotateRight(matrix) {
  // reverse the rows
  matrix = matrix.reverse();
  // swap the symmetric elements
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < i; j++) {
      var temp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = temp;
    }
  }
  return matrix
};

/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
function rotateLeft(matrix) {
  // reverse the individual rows
  matrix = matrix.map(function(row) {
    return row.reverse();
  });
  // swap the symmetric elements
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < i; j++) {
      var temp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = temp;
    }
  }
  return matrix
};

function moveLeft(list) {
	let clone = list.concat()
	while (clone[0] === 0) {
		clone.shift()
	}
	let result = []
	while (clone.length) {
		let item = clone.shift()
		if (result[result.length - 1] === item) {
			result[result.length - 1] += item
		} else {
			result.push(item)
		}
	}
	while (result.length < 4) {
		result.push(0)
	}
	return result
}

function moveRight(list) {
	let clone = list.concat()
	while (clone[clone.length - 1] === 0) {
		clone.pop()
	}
	let result = []
	while (clone.length) {
		let item = clone.pop()
		if (result[result.length - 1] === item) {
			result[result.length - 1] += item
		} else {
			result.unshift(item)
		}
	}
	while (result.length < 4) {
		result.unshift(0)
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