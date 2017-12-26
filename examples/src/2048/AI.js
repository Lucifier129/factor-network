import { MCM, MCTS } from '../../../dist/factor-network'

export function getBestActionByMCTS(board, iterations = 400) {
	let bestAction = new MCTS(adapter(board)).run(iterations)
	return bestAction
}

export function getBestActionByMCM(board, iterations = 400) {
	let bestAction = new MCM(adapter(board)).run(iterations)
	return bestAction
}

function adapter(board) {
	function clone() {
		return adapter(board.clone())
	}

	function getActions() {
		if (!board.hasWon() && !board.hasLost()) {
			return [0, 1, 2, 3]
		} else {
			return []
		}
	}

	function doAction(action) {
		board.move(action)
	}

	let startScore = board.score
	function getResult() {
		return board.score - startScore
	}

	return {
		clone,
		getActions,
		doAction,
		getResult
	}
}
