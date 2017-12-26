export default class MCTS {
	constructor(board) {
		this.originalBoard = board
		this.board = null
	}
	run(iterations) {
		let count = Number(iterations)
		let root = new MCTSNode(null, this.originalBoard.getActions(), null)
		while (count--) {
			this.board = this.originalBoard.clone()
			let node = root
			node = this.Selection(node)
			node = this.Expanstion(node)
			this.Simulation(node)
			this.Backpropagation(node)
		}
		return root.getBestAction()
	}
	Selection(node) {
		while (!node.hasUnexaminedAction() && node.children.length > 0) {
			node = node.selectChild()
			this.board.doAction(node.action)
		}
		return node
	}
	Expanstion(node) {
		if (node.hasUnexaminedAction()) {
			let unexamineAction = node.getUnexamineActionRandomly()
			this.board.doAction(unexamineAction)
			node = node.addChild(unexamineAction, this.board.getActions())
		}
		return node
	}
	Simulation(node) {
		let actions = this.board.getActions()
		while (actions.length > 0) {
			let randomAction = actions[Math.floor(Math.random() * actions.length)]
			this.board.doAction(randomAction)
			actions = this.board.getActions()
		}
	}
	Backpropagation(node) {
		node.updateStatistic(this.board.getResult())
	}
}

class MCTSNode {
	constructor(action, nextActions, parent = null) {
		this.action = action
		this.nextActions = nextActions || []
		this.children = []
		this.wins = 0
		this.visits = 0
		this.parent = parent
	}
	isRoot() {
		return !this.parent
	}
	hasUnexaminedAction() {
		return this.nextActions.length > 0
	}
	getUnexamineActionRandomly() {
		let index = Math.floor(Math.random() * this.nextActions.length)
		let action = this.nextActions.splice(index, 1)[0]
		return action
	}
	getScore() {
		return this.visits > 0 ? this.wins / this.visits : 0
	}
	getBestChild() {
		let best = this.children[0]
		for (let i = 1; i < this.children.length; i++) {
			let child = this.children[i]
			if (child.getScore() > best.getScore()) {
				best = child
			}
		}
		return best
	}
	getBestAction() {
		return this.getBestChild().action
	}
	addChild(action, nextActions) {
		let child = new MCTSNode(action, nextActions, this)
		this.children.push(child)
		return child
	}
	selectChild() {
		return this.children[Math.floor(Math.random() * this.children.length)]
	}
	updateStatistic(wins = 0) {
		this.visits += 1
		this.wins += wins
		if (!this.isRoot()) {
			this.parent.updateStatistic(wins)
		}
	}
}
