export default class UCT {
  constructor(board) {
    this.originalBoard = board
    this.board = null
  }
  run(iterations) {
    let count = Number(iterations)
    let root = new UCTNode(null, this.originalBoard.getActions(), null)
    while (count--) {
      this.board = this.originalBoard.clone()
      let node = root
      node = this.Selection(node)
      node = this.Expanstion(node)
      this.Simulation()
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
  Simulation() {
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

class UCTNode {
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
      if (child.visits > best.visits) {
        best = child
      } else if (child.visits === best.visits) {
        best = child.wins > best.wins ? child : best
      }
    }
    return best
  }
  getBestAction() {
    return this.getBestChild().action
  }
  getUCTValue() {
    let averageReward = this.getScore()
    let parameter = this.parent.getScore()
    let bias =
      parameter * Math.sqrt(2 * Math.log(this.parent.visits) / this.visits)
    return averageReward + bias
  }
  addChild(action, nextActions) {
    let child = new UCTNode(action, nextActions, this)
    this.children.push(child)
    return child
  }
  selectChild() {
    let selected = this.children[0]
    for (var i = 1; i < this.children.length; i++) {
      let child = this.children[i]
      if (child.getUCTValue() > selected.getUCTValue()) {
        selected = child
      }
    }
    return selected
  }
  updateStatistic(wins = 0) {
    this.visits += 1
    this.wins += wins
    if (!this.isRoot()) {
      this.parent.updateStatistic(wins)
    }
  }
}
