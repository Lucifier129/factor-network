export default class MCM {
  constructor(board) {
    this.originalBoard = board
    this.statistic = []
  }
  run(iterations) {
    let total = Number(iterations)
    let actions = this.originalBoard.getActions()

    for (let i = 0; i < actions.length; i++) {
			let count = Math.floor(total / actions.length)
      while (count--) {
        this.simulate(actions[i])
      }
    }

    return this.getBestAction()
  }
  simulate(rootAction) {
    let board = this.originalBoard.clone()
    board.doAction(rootAction)

    let actions = board.getActions()
    while (actions.length) {
      let action = actions[Math.floor(Math.random() * actions.length)]
      board.doAction(action)
      actions = board.getActions()
    }

    this.updateStatistic(rootAction, board.getResult())
  }
  updateStatistic(action, score) {
    let target = this.statistic.find(item => item.action === action)
    if (!target) {
      this.statistic.push({
        action: action,
        score: score,
        visited: 1
      })
    } else {
      target.score += score
      target.visited += 1
    }
  }
  getBestAction() {
    let qualityList = this.statistic.map(item => ({
      action: item.action,
      quality: item.score / item.visited
    }))
    return qualityList.reduce(
      (best, current) => (current.quality > best.quality ? current : best)
    ).action
  }
}
