export const activation = {
	RELU: {
		output: RELU,
		derivative: RELU_DERIVATIVE
	},
	SIGMOID: {
		output: SIGMOID,
		derivative: SIGMOID_DERIVATIVE
	},
	TANH: {
		output: TANH,
		derivative: TANH_DERIVATIVE
	}
}


export default class MCNNS {
  constructor({ network, digitLength = 5, activationType }) {
    this.board = new Board({
      network,
      digitLength
    })
    this.activationType = activationType
    this.uct = new UCT(this.board)
    this.collection = null
  }
  getModelList(iterations = 0) {
    let getModel = ({ board }) => inputs =>
      computeNetwork(board.network, inputs, this.activationType)
    this.collection = this.uct.run(iterations)
    return this.collection.map(getModel)
  }
  handleFeedback(resultList) {
    resultList.forEach((result, index) => {
      let { node, score } = this.collection[index]
      node.fixStatistic(result - score)
    })
  }
}

class UCT {
  constructor(board) {
    this.originalBoard = board
    this.board = null
    this.root = new UCTNode(null, this.originalBoard.getActions(), null)
  }
  run(iterations) {
    let collection = Array.from({ length: Number(iterations) }).map(() =>
      this.runOnce()
    )
    return collection
  }
  runOnce() {
    let node = this.root
    this.board = this.originalBoard.clone()
    node = this.Selection(node)
    node = this.Expanstion(node)
    this.Simulation()
    let score = !node.isRoot() ? node.parent.getScore() : 0
    this.Backpropagation(node, score)
    return {
      score: score,
      node: node,
      board: this.board
    }
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
  Backpropagation(node, score) {
    node.updateStatistic(score)
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
    let parameter = this.parent.getScore() * 4
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
      let childUctValue = child.getUCTValue()
      let selectedUctValue = selected.getUCTValue()
      if (childUctValue > selectedUctValue) {
        selected = child
      } else if (childUctValue === selectedUctValue && Math.random() > 0.5) {
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
  fixStatistic(wins) {
    this.wins += wins
    if (!this.isRoot()) {
      this.parent.updateStatistic(wins)
    }
  }
}

class Board {
  constructor({ network, digitLength = 5, weightIndex = 0, digitIndex = 0 }) {
    this.network = createNetwork(network)
    this.weightList = getWeightList(this.network)
    this.digitLength = digitLength
    this.weightIndex = weightIndex
    this.digitIndex = digitIndex
  }
  clone() {
    let board = Object.assign(Object.create(Board.prototype), this)
    board.network = cloneNetwork(this.network)
    board.weightList = getWeightList(board.network)
    return board
  }
  getActions() {
    if (this.digitIndex < this.digitLength) {
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    } else {
      return []
    }
  }
  doAction(digit) {
    this.weightList[this.weightIndex][this.digitIndex] = digit
    this.weightIndex += 1
    if (this.weightIndex === this.weightList.length) {
      this.weightIndex = 0
      this.digitIndex += 1
    }
  }
}

function createNetwork(options) {
  let network = []
  let previousInputs = options[0]
  for (let i = 1; i < options.length; i++) {
    let currentLayer = []
    for (let j = 0; j < options[i]; j++) {
      let currentNode = []
      for (let k = 0; k < previousInputs; k++) {
        currentNode.push([])
      }
      currentLayer.push(currentNode)
    }
    previousInputs = currentLayer.length
    network.push(currentLayer)
  }
  return network
}

function computeNetwork(network, inputs, activationType = 'SIGMOID') {
  let currentInputs = inputs
  let networkResult = [inputs.concat()]
  for (let i = 0; i < network.length; i++) {
    let currentLayer = network[i]
    let currentLayerResult = []
    for (let j = 0; j < currentLayer.length; j++) {
      let currentNode = currentLayer[j]
      let sum = 0
      for (let k = 0; k < currentNode.length; k++) {
        let currentWeight = Number(`0.${currentNode[k].slice(0).join('')}`)
        sum += currentInputs[k] * currentWeight
      }
      let currentNodeResult = getActivation(activationType, i).output(sum)
      currentLayerResult.push(currentNodeResult)
    }
    networkResult.push(currentLayerResult)
    currentInputs = currentLayerResult
  }
  return networkResult
}

function getActivation(type, layerIndex) {
  if (typeof type === 'string') {
    return activation[type]
  } else if (Array.isArray(type)) {
    return activation[type[layerIndex]]
  }
}

function walk(network, accessor) {
  for (let i = 0; i < network.length; i++) {
    let currentLayer = network[i]
    for (let j = 0; j < currentLayer.length; j++) {
      let currentNode = currentLayer[j]
      for (let k = 0; k < currentNode.length; k++) {
        let currentWeight = currentNode[k]
        accessor({
          weight: currentWeight,
          node: currentNode,
          layer: currentLayer,
          network: network,
          path: [i, j, k]
        })
      }
    }
  }
}

function getWeightList(network) {
  let weightList = []
  walk(network, data => weightList.push(data.weight))
  return weightList
}

function cloneNetwork(network) {
  return JSON.parse(JSON.stringify(network))
}
