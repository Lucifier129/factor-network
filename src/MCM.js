export default class MCM {
	constructor(board) {
		this.originalBoard = board
		this.statistic = []
	}
	run(iterations) {
		let count = Number(iterations)
		while (count--) {
			this.simulate()
		}
		return this.getBestAction()
	}
	simulate() {
		let board = this.originalBoard.clone()
		let actions = board.getActions()
		let path = []
		while (actions.length) {
			let action = actions[Math.floor(Math.random() * actions.length)]
			path.push(action)
			board.doAction(action)
			actions = board.getActions()
		}
		this.updateStatistic(path[0], board.getResult())
	}
	updateStatistic(action, score) {
		let target = this.statistic.find(item => item.action === action)
		if (!target) {
			this.statistic.push({
				action: action,
				score: score
			})
		} else {
			target.score += score
		}
	}
	getBestAction() {
		return this.statistic.reduce(
			(best, current) => (current.score > best.score ? current : best)
		).action
	}
}
