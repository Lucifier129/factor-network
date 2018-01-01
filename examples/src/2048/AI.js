import { MCM, MCTS, UCT } from '../../../dist/factor-network'

export function getBestActionByMCTS(board, iterations = 400) {
  let bestAction = new MCTS(adapter(board)).run(iterations)
  return bestAction
}

export function getBestActionByMCM(board, iterations = 400) {
  let bestAction = new MCM(adapter(board)).run(iterations)
  return bestAction
}

export function getBestActionByUCT(board, iterations = 400) {
  let bestAction = new UCT(UCTAdapter(board)).run(iterations)
  return bestAction
}

function UCTAdapter(board) {
  function clone() {
    return UCTAdapter(board.clone())
  }

  function getActions() {
    if (!board.hasWon() && !board.hasLost() && getHighestValue() < 2048) {
      return [0, 1, 2, 3]
    } else {
      return []
    }
  }

  function doAction(action) {
    board.move(action)
  }

  function getSum() {
    let sum = 0
    for (let i = 0; i < board.cells.length; i++) {
      for (let ii = 0; ii < board.cells[i].length; ii++) {
        sum += board.cells[i][ii].value
      }
    }
    return sum
  }

  function getHighestValue() {
    let highest = 0
    for (let i = 0; i < board.cells.length; i++) {
      for (let ii = 0; ii < board.cells[i].length; ii++) {
        if (board.cells[i][ii].value > highest) {
          highest = board.cells[i][ii].value
        }
      }
    }
    return highest
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
