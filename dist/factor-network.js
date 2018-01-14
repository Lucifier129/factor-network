/*!
 * factor-network.js v1.0.1
 * (c) 2018-01-14 Jade Gu
 * Released under the MIT License.
 * @license
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FactorNetwork = factory());
}(this, (function () { 'use strict';

function randomClamped() {
	return Math.random() * 2 - 1;
}

function randomBoolean() {
	return Math.random() <= 0.5;
}

function identity(x) {
	return x;
}

var activation = {
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
};

function RELU(x) {
	return Math.max(0, x);
}

function RELU_DERIVATIVE(x) {
	return x <= 0 ? 0 : 1;
}

function SIGMOID(x) {
	return 1 / (1 + Math.exp(-x / 1));
}

function SIGMOID_DERIVATIVE(x) {
	return x * (1 - x);
}

function TANH(x) {
	if (x === Infinity) {
		return 1;
	} else if (x === -Infinity) {
		return -1;
	} else {
		var e2x = Math.exp(2 * x);
		return (e2x - 1) / (e2x + 1);
	}
}

function TANH_DERIVATIVE(x) {
	return 1 - x * x;
}

function create(options) {
	var network = [];
	var previousInputs = options[0];
	for (var i = 1; i < options.length; i++) {
		var currentLayer = [];
		for (var j = 0; j < options[i]; j++) {
			var currentNode = [];
			for (var k = 0; k < previousInputs; k++) {
				var randomWeight = randomClamped();
				currentNode.push(randomWeight);
			}
			currentLayer.push(currentNode);
		}
		previousInputs = currentLayer.length;
		network.push(currentLayer);
	}
	return network;
}

function compute(network, inputs) {
	var activationType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'SIGMOID';

	var currentInputs = inputs;
	var networkResult = [inputs.concat()];
	for (var i = 0; i < network.length; i++) {
		var currentLayer = network[i];
		var currentLayerResult = [];
		for (var j = 0; j < currentLayer.length; j++) {
			var currentNode = currentLayer[j];
			var sum = 0;
			for (var k = 0; k < currentNode.length; k++) {
				var currentWeight = currentNode[k];
				sum += currentInputs[k] * currentWeight;
			}
			var currentNodeResult = getActivation(activationType, i).output(sum);
			currentLayerResult.push(currentNodeResult);
		}
		networkResult.push(currentLayerResult);
		currentInputs = currentLayerResult;
	}
	return networkResult;
}

function getActivation(type, layerIndex) {
	if (typeof type === 'string') {
		return activation[type];
	} else if (Array.isArray(type)) {
		return activation[type[layerIndex]];
	}
}

function walk(network, accessor) {
	for (var i = 0; i < network.length; i++) {
		var currentLayer = network[i];
		for (var j = 0; j < currentLayer.length; j++) {
			var currentNode = currentLayer[j];
			for (var k = 0; k < currentNode.length; k++) {
				var currentWeight = currentNode[k];
				accessor({
					weight: currentWeight,
					node: currentNode,
					layer: currentLayer,
					network: network,
					path: [i, j, k]
				});
			}
		}
	}
}

function copy(network) {
	return JSON.parse(JSON.stringify(network));
}

function isEqual(aNetwork, bNetwork) {
	return JSON.stringify(aNetwork) === JSON.stringify(bNetwork);
}

var network = Object.freeze({
	create: create,
	compute: compute,
	getActivation: getActivation,
	walk: walk,
	copy: copy,
	isEqual: isEqual
});

var defaults = {
	network: [2, 2, 1],
	activation: 'SIGMOID',
	learningRate: 0.1,
	output: identity
};

function createBackPropagation(settings) {
	var options = Object.assign({}, defaults, settings);
	var network = create(options.network);
	var networkResult = null;

	function getNetwork() {
		return network;
	}

	function replaceNetwork(newNetwork) {
		network = newNetwork;
	}

	function compute$$1(inputs) {
		networkResult = compute(network, inputs, options.activation);
		return networkResult;
	}

	function output(index, inputs) {
		var results = compute$$1(inputs);
		return options.output(results[results.length - 1]);
	}

	function computeError(labels) {
		var errors = [];
		var lastResult = networkResult[networkResult.length - 1];
		for (var i = 0; i < labels.length; i++) {
			var error = lastResult[i] - labels[i];
			errors.push(error);
		}
		return computeNetworkError(network, errors);
	}

	function adjust(labels) {
		var learningRate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.learningRate;

		var networkError = computeError(labels);
		updateNetworkWeights(network, networkResult, networkError, options.activation, learningRate);
	}

	function train(inputs, labels) {
		compute$$1(inputs);
		adjust(labels);
	}

	return {
		options: options,
		getNetwork: getNetwork,
		replaceNetwork: replaceNetwork,
		compute: compute$$1,
		adjust: adjust,
		train: train,
		output: output
	};
}

function computeNetworkError(network, errors) {
	var networkError = [errors.concat()];
	var inputErrors = errors;

	for (var i = network.length - 2; i >= 0; i--) {
		var currentLayer = network[i];
		var nextLayer = network[i + 1];
		var layerError = [];
		for (var j = currentLayer.length - 1; j >= 0; j--) {
			var nodeError = 0;
			for (var k = nextLayer.length - 1; k >= 0; k--) {
				var weight = nextLayer[k][j];
				nodeError += inputErrors[k] * weight;
			}
			layerError.unshift(nodeError);
		}
		networkError.unshift(layerError);
		inputErrors = layerError;
	}

	return networkError;
}

function updateNetworkWeights(network, networkResult, networkError, activationType, learningRate) {
	walk(network, function (data) {
		var path = data.path;
		var currentWeight = network[path[0]][path[1]][path[2]];
		var currentInput = networkResult[path[0]][path[2]];
		var currentResult = networkResult[path[0] + 1][path[1]];
		var currentError = networkError[path[0]][path[1]];
		var currentActivation = getActivation(activationType, path[0]);
		var deltaWeight = -learningRate * currentError * currentInput * currentActivation.derivative(currentResult);
		var newWeight = currentWeight + deltaWeight;
		network[path[0]][path[1]][path[2]] = newWeight;
	});
}

var defaults$1 = {
	network: [2, 2, 1],
	amount: 50,
	elitismRate: 0.2,
	randomRate: 0.2,
	mixNumber: 1,
	mutation: {
		rate: 0.1,
		range: 0.5
	},
	activation: 'SIGMOID',
	output: identity
};

function createEvolution(settings) {
	var options = Object.assign({}, defaults$1, settings);
	var networks = [];

	function createNetworks(amount) {
		for (var i = 0; i < amount; i++) {
			var network = create(options.network);
			networks.push(network);
		}
		options.amount = networks.length;
	}

	function eachNetwork(handleNetwork) {
		networks.forEach(handleNetwork);
	}

	function updateAmount(targetAmount) {
		var currentAmount = networks.length;
		if (currentAmount > targetAmount) {
			networks.length = targetAmount;
			options.amount = targetAmount;
		} else if (currentAmount < targetAmount) {
			createNetworks(targetAmount - currentAmount);
		}
	}

	function getNetworks() {
		return networks;
	}

	function replaceNetworks(newNetworks) {
		networks = newNetworks;
	}

	function sortNetworks(ranks) {
		var newNetworks = [];
		for (var i = 0; i < ranks.length; i++) {
			newNetworks.push(networks[ranks[i]]);
		}
		networks = newNetworks;
		options.amount = networks.length;
	}

	function compute$$1(index, inputs) {
		return compute(networks[index], inputs, options.activation);
	}

	function output(index, inputs) {
		var results = compute$$1(index, inputs);
		return options.output(results[results.length - 1]);
	}

	function adjust(ranks) {
		if (ranks) {
			sortNetworks(ranks);
		}

		var newNetworks = [];

		var elitismAmount = Math.round(options.elitismRate * options.amount);
		for (var i = 0; i < elitismAmount; i++) {
			newNetworks.push(networks[i]);
		}

		var randomAmount = Math.round(options.randomRate * options.amount);
		for (var _i = 0; _i < randomAmount; _i++) {
			newNetworks.push(create(options.network));
		}

		var max = 0;
		while (true) {
			for (var _i2 = 0; _i2 < max; _i2++) {
				for (var j = 0; j < options.mixNumber; j++) {
					var newNetwork = mixNetwork(copy(networks[_i2]), networks[max], options.mutation);
					newNetworks.push(newNetwork);
					if (newNetworks.length >= options.amount) {
						newNetworks.length = options.amount;
						networks = newNetworks;
						return;
					}
				}
			}
			max++;
			if (max === networks.length) {
				max = 0;
			}
		}
	}

	createNetworks(options.amount);

	return {
		options: options,
		createNetworks: createNetworks,
		eachNetwork: eachNetwork,
		getNetworks: getNetworks,
		replaceNetworks: replaceNetworks,
		sortNetworks: sortNetworks,
		updateAmount: updateAmount,
		compute: compute$$1,
		adjust: adjust,
		output: output
	};
}

function mixNetwork(targetNetwork, sourceNetwork, mutation) {
	walk(targetNetwork, function (data) {
		var path = data.path;
		if (randomBoolean()) {
			var sourceWeight = sourceNetwork[path[0]][path[1]][path[2]];
			targetNetwork[path[0]][path[1]][path[2]] = sourceWeight;
		}
		if (Math.random() <= mutation.rate) {
			targetNetwork[path[0]][path[1]][path[2]] += mutation.range * randomClamped();
		}
	});
	return targetNetwork;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var MCM = function () {
  function MCM(board) {
    classCallCheck(this, MCM);

    this.originalBoard = board;
    this.statistic = [];
  }

  createClass(MCM, [{
    key: "run",
    value: function run(iterations) {
      var total = Number(iterations);
      var actions = this.originalBoard.getActions();

      for (var i = 0; i < actions.length; i++) {
        var count = Math.floor(total / actions.length);
        while (count--) {
          this.simulate(actions[i]);
        }
      }

      return this.getBestAction();
    }
  }, {
    key: "simulate",
    value: function simulate(rootAction) {
      var board = this.originalBoard.clone();
      board.doAction(rootAction);

      var actions = board.getActions();
      while (actions.length) {
        var action = actions[Math.floor(Math.random() * actions.length)];
        board.doAction(action);
        actions = board.getActions();
      }

      this.updateStatistic(rootAction, board.getResult());
    }
  }, {
    key: "updateStatistic",
    value: function updateStatistic(action, score) {
      var target = this.statistic.find(function (item) {
        return item.action === action;
      });
      if (!target) {
        this.statistic.push({
          action: action,
          score: score,
          visited: 1
        });
      } else {
        target.score += score;
        target.visited += 1;
      }
    }
  }, {
    key: "getBestAction",
    value: function getBestAction() {
      var qualityList = this.statistic.map(function (item) {
        return {
          action: item.action,
          quality: item.score / item.visited
        };
      });
      return qualityList.reduce(function (best, current) {
        return current.quality > best.quality ? current : best;
      }).action;
    }
  }]);
  return MCM;
}();

var MCTS = function () {
	function MCTS(board) {
		classCallCheck(this, MCTS);

		this.originalBoard = board;
		this.board = null;
	}

	createClass(MCTS, [{
		key: "run",
		value: function run(iterations) {
			var count = Number(iterations);
			var root = new MCTSNode(null, this.originalBoard.getActions(), null);
			while (count--) {
				this.board = this.originalBoard.clone();
				var node = root;
				node = this.Selection(node);
				node = this.Expanstion(node);
				this.Simulation(node);
				this.Backpropagation(node);
			}
			return root.getBestAction();
		}
	}, {
		key: "Selection",
		value: function Selection(node) {
			while (!node.hasUnexaminedAction() && node.children.length > 0) {
				node = node.selectChild();
				this.board.doAction(node.action);
			}
			return node;
		}
	}, {
		key: "Expanstion",
		value: function Expanstion(node) {
			if (node.hasUnexaminedAction()) {
				var unexamineAction = node.getUnexamineActionRandomly();
				this.board.doAction(unexamineAction);
				node = node.addChild(unexamineAction, this.board.getActions());
			}
			return node;
		}
	}, {
		key: "Simulation",
		value: function Simulation(node) {
			var actions = this.board.getActions();
			while (actions.length > 0) {
				var randomAction = actions[Math.floor(Math.random() * actions.length)];
				this.board.doAction(randomAction);
				actions = this.board.getActions();
			}
		}
	}, {
		key: "Backpropagation",
		value: function Backpropagation(node) {
			node.updateStatistic(this.board.getResult());
		}
	}]);
	return MCTS;
}();

var MCTSNode = function () {
	function MCTSNode(action, nextActions) {
		var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
		classCallCheck(this, MCTSNode);

		this.action = action;
		this.nextActions = nextActions || [];
		this.children = [];
		this.wins = 0;
		this.visits = 0;
		this.parent = parent;
	}

	createClass(MCTSNode, [{
		key: "isRoot",
		value: function isRoot() {
			return !this.parent;
		}
	}, {
		key: "hasUnexaminedAction",
		value: function hasUnexaminedAction() {
			return this.nextActions.length > 0;
		}
	}, {
		key: "getUnexamineActionRandomly",
		value: function getUnexamineActionRandomly() {
			var index = Math.floor(Math.random() * this.nextActions.length);
			var action = this.nextActions.splice(index, 1)[0];
			return action;
		}
	}, {
		key: "getScore",
		value: function getScore() {
			return this.visits > 0 ? this.wins / this.visits : 0;
		}
	}, {
		key: "getBestChild",
		value: function getBestChild() {
			var best = this.children[0];
			for (var i = 1; i < this.children.length; i++) {
				var child = this.children[i];
				if (child.getScore() > best.getScore()) {
					best = child;
				}
			}
			return best;
		}
	}, {
		key: "getBestAction",
		value: function getBestAction() {
			return this.getBestChild().action;
		}
	}, {
		key: "addChild",
		value: function addChild(action, nextActions) {
			var child = new MCTSNode(action, nextActions, this);
			this.children.push(child);
			return child;
		}
	}, {
		key: "selectChild",
		value: function selectChild() {
			return this.children[Math.floor(Math.random() * this.children.length)];
		}
	}, {
		key: "updateStatistic",
		value: function updateStatistic() {
			var wins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			this.visits += 1;
			this.wins += wins;
			if (!this.isRoot()) {
				this.parent.updateStatistic(wins);
			}
		}
	}]);
	return MCTSNode;
}();

var UCT = function () {
  function UCT(board) {
    classCallCheck(this, UCT);

    this.originalBoard = board;
    this.board = null;
  }

  createClass(UCT, [{
    key: "run",
    value: function run(iterations) {
      var count = Number(iterations);
      var root = new UCTNode(null, this.originalBoard.getActions(), null);
      while (count--) {
        this.board = this.originalBoard.clone();
        var node = root;
        node = this.Selection(node);
        node = this.Expanstion(node);
        this.Simulation();
        this.Backpropagation(node);
      }
      return root.getBestAction();
    }
  }, {
    key: "Selection",
    value: function Selection(node) {
      while (!node.hasUnexaminedAction() && node.children.length > 0) {
        node = node.selectChild();
        this.board.doAction(node.action);
      }
      return node;
    }
  }, {
    key: "Expanstion",
    value: function Expanstion(node) {
      if (node.hasUnexaminedAction()) {
        var unexamineAction = node.getUnexamineActionRandomly();
        this.board.doAction(unexamineAction);
        node = node.addChild(unexamineAction, this.board.getActions());
      }
      return node;
    }
  }, {
    key: "Simulation",
    value: function Simulation() {
      var actions = this.board.getActions();
      while (actions.length > 0) {
        var randomAction = actions[Math.floor(Math.random() * actions.length)];
        this.board.doAction(randomAction);
        actions = this.board.getActions();
      }
    }
  }, {
    key: "Backpropagation",
    value: function Backpropagation(node) {
      node.updateStatistic(this.board.getResult());
    }
  }]);
  return UCT;
}();

var UCTNode = function () {
  function UCTNode(action, nextActions) {
    var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    classCallCheck(this, UCTNode);

    this.action = action;
    this.nextActions = nextActions || [];
    this.children = [];
    this.wins = 0;
    this.visits = 0;
    this.parent = parent;
  }

  createClass(UCTNode, [{
    key: "isRoot",
    value: function isRoot() {
      return !this.parent;
    }
  }, {
    key: "hasUnexaminedAction",
    value: function hasUnexaminedAction() {
      return this.nextActions.length > 0;
    }
  }, {
    key: "getUnexamineActionRandomly",
    value: function getUnexamineActionRandomly() {
      var index = Math.floor(Math.random() * this.nextActions.length);
      var action = this.nextActions.splice(index, 1)[0];
      return action;
    }
  }, {
    key: "getScore",
    value: function getScore() {
      return this.visits > 0 ? this.wins / this.visits : 0;
    }
  }, {
    key: "getBestChild",
    value: function getBestChild() {
      var best = this.children[0];
      for (var i = 1; i < this.children.length; i++) {
        var child = this.children[i];
        if (child.visits > best.visits) {
          best = child;
        } else if (child.visits === best.visits) {
          best = child.wins > best.wins ? child : best;
        }
      }
      return best;
    }
  }, {
    key: "getBestAction",
    value: function getBestAction() {
      return this.getBestChild().action;
    }
  }, {
    key: "getUCTValue",
    value: function getUCTValue() {
      var averageReward = this.getScore();
      var parameter = this.parent.getScore();
      var bias = parameter * Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);
      return averageReward + bias;
    }
  }, {
    key: "addChild",
    value: function addChild(action, nextActions) {
      var child = new UCTNode(action, nextActions, this);
      this.children.push(child);
      return child;
    }
  }, {
    key: "selectChild",
    value: function selectChild() {
      var selected = this.children[0];
      for (var i = 1; i < this.children.length; i++) {
        var child = this.children[i];
        if (child.getUCTValue() > selected.getUCTValue()) {
          selected = child;
        }
      }
      return selected;
    }
  }, {
    key: "updateStatistic",
    value: function updateStatistic() {
      var wins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      this.visits += 1;
      this.wins += wins;
      if (!this.isRoot()) {
        this.parent.updateStatistic(wins);
      }
    }
  }]);
  return UCTNode;
}();

var MCNNS = function () {
  function MCNNS(_ref) {
    var network = _ref.network,
        _ref$digitLength = _ref.digitLength,
        digitLength = _ref$digitLength === undefined ? 5 : _ref$digitLength,
        activationType = _ref.activationType;
    classCallCheck(this, MCNNS);

    this.board = new Board({
      network: network,
      digitLength: digitLength
    });
    this.activationType = activationType;
    this.uct = new UCT$2(this.board);
    this.collection = null;
  }

  createClass(MCNNS, [{
    key: 'getModelList',
    value: function getModelList() {
      var _this = this;

      var iterations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var getModel = function getModel(_ref2) {
        var board = _ref2.board;
        return function (inputs) {
          return computeNetwork(board.network, inputs, _this.activationType);
        };
      };
      this.collection = this.uct.run(iterations);
      return this.collection.map(getModel);
    }
  }, {
    key: 'handleFeedback',
    value: function handleFeedback(resultList) {
      var _this2 = this;

      resultList.forEach(function (result, index) {
        var _collection$index = _this2.collection[index],
            node = _collection$index.node,
            score = _collection$index.score;

        node.fixStatistic(result - score);
      });
    }
  }]);
  return MCNNS;
}();

var UCT$2 = function () {
  function UCT(board) {
    classCallCheck(this, UCT);

    this.originalBoard = board;
    this.board = null;
    this.root = new UCTNode$1(null, this.originalBoard.getActions(), null);
  }

  createClass(UCT, [{
    key: 'run',
    value: function run(iterations) {
      var _this3 = this;

      var collection = Array.from({ length: Number(iterations) }).map(function () {
        return _this3.runOnce();
      });
      return collection;
    }
  }, {
    key: 'runOnce',
    value: function runOnce() {
      var node = this.root;
      this.board = this.originalBoard.clone();
      node = this.Selection(node);
      node = this.Expanstion(node);
      this.Simulation();
      var score = !node.isRoot() ? node.parent.getScore() : 0;
      this.Backpropagation(node, score);
      return {
        score: score,
        node: node,
        board: this.board
      };
    }
  }, {
    key: 'Selection',
    value: function Selection(node) {
      while (!node.hasUnexaminedAction() && node.children.length > 0) {
        node = node.selectChild();
        this.board.doAction(node.action);
      }
      return node;
    }
  }, {
    key: 'Expanstion',
    value: function Expanstion(node) {
      if (node.hasUnexaminedAction()) {
        var unexamineAction = node.getUnexamineActionRandomly();
        this.board.doAction(unexamineAction);
        node = node.addChild(unexamineAction, this.board.getActions());
      }
      return node;
    }
  }, {
    key: 'Simulation',
    value: function Simulation() {
      var actions = this.board.getActions();
      while (actions.length > 0) {
        var randomAction = actions[Math.floor(Math.random() * actions.length)];
        this.board.doAction(randomAction);
        actions = this.board.getActions();
      }
    }
  }, {
    key: 'Backpropagation',
    value: function Backpropagation(node, score) {
      node.updateStatistic(score);
    }
  }]);
  return UCT;
}();

var UCTNode$1 = function () {
  function UCTNode(action, nextActions) {
    var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    classCallCheck(this, UCTNode);

    this.action = action;
    this.nextActions = nextActions || [];
    this.children = [];
    this.wins = 0;
    this.visits = 0;
    this.parent = parent;
  }

  createClass(UCTNode, [{
    key: 'isRoot',
    value: function isRoot() {
      return !this.parent;
    }
  }, {
    key: 'hasUnexaminedAction',
    value: function hasUnexaminedAction() {
      return this.nextActions.length > 0;
    }
  }, {
    key: 'getUnexamineActionRandomly',
    value: function getUnexamineActionRandomly() {
      var index = Math.floor(Math.random() * this.nextActions.length);
      var action = this.nextActions.splice(index, 1)[0];
      return action;
    }
  }, {
    key: 'getScore',
    value: function getScore() {
      return this.visits > 0 ? this.wins / this.visits : 0;
    }
  }, {
    key: 'getBestChild',
    value: function getBestChild() {
      var best = this.children[0];
      for (var i = 1; i < this.children.length; i++) {
        var child = this.children[i];
        if (child.visits > best.visits) {
          best = child;
        } else if (child.visits === best.visits) {
          best = child.wins > best.wins ? child : best;
        }
      }
      return best;
    }
  }, {
    key: 'getBestAction',
    value: function getBestAction() {
      return this.getBestChild().action;
    }
  }, {
    key: 'getUCTValue',
    value: function getUCTValue() {
      var averageReward = this.getScore();
      var parameter = this.parent.getScore();
      var bias = parameter * Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);
      return averageReward + bias;
    }
  }, {
    key: 'addChild',
    value: function addChild(action, nextActions) {
      var child = new UCTNode(action, nextActions, this);
      this.children.push(child);
      return child;
    }
  }, {
    key: 'selectChild',
    value: function selectChild() {
      var selected = this.children[0];
      for (var i = 1; i < this.children.length; i++) {
        var child = this.children[i];
        var childUctValue = child.getUCTValue();
        var selectedUctValue = selected.getUCTValue();
        if (childUctValue > selectedUctValue) {
          selected = child;
        } else if (childUctValue === selectedUctValue && Math.random() > 0.5) {
          selected = child;
        }
      }
      return selected;
    }
  }, {
    key: 'updateStatistic',
    value: function updateStatistic() {
      var wins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      this.visits += 1;
      this.wins += wins;
      if (!this.isRoot()) {
        this.parent.updateStatistic(wins);
      }
    }
  }, {
    key: 'fixStatistic',
    value: function fixStatistic(wins) {
      this.wins += wins;
      if (!this.isRoot()) {
        this.parent.updateStatistic(wins);
      }
    }
  }]);
  return UCTNode;
}();

var Board = function () {
  function Board(_ref3) {
    var network = _ref3.network,
        _ref3$digitLength = _ref3.digitLength,
        digitLength = _ref3$digitLength === undefined ? 5 : _ref3$digitLength,
        _ref3$weightIndex = _ref3.weightIndex,
        weightIndex = _ref3$weightIndex === undefined ? 0 : _ref3$weightIndex,
        _ref3$digitIndex = _ref3.digitIndex,
        digitIndex = _ref3$digitIndex === undefined ? 0 : _ref3$digitIndex;
    classCallCheck(this, Board);

    this.network = createNetwork(network);
    this.weightList = getWeightList(this.network);
    this.digitLength = digitLength;
    this.weightIndex = weightIndex;
    this.digitIndex = digitIndex;
  }

  createClass(Board, [{
    key: 'clone',
    value: function clone() {
      var board = Object.assign(Object.create(Board.prototype), this);
      board.network = cloneNetwork(this.network);
      board.weightList = getWeightList(board.network);
      return board;
    }
  }, {
    key: 'getActions',
    value: function getActions() {
      if (this.digitIndex < this.digitLength) {
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      } else {
        return [];
      }
    }
  }, {
    key: 'doAction',
    value: function doAction(digit) {
      this.weightList[this.weightIndex][this.digitIndex] = digit;
      this.weightIndex += 1;
      if (this.weightIndex === this.weightList.length) {
        this.weightIndex = 0;
        this.digitIndex += 1;
      }
    }
  }]);
  return Board;
}();

function createNetwork(options) {
  var network = [];
  var previousInputs = options[0];
  for (var i = 1; i < options.length; i++) {
    var currentLayer = [];
    for (var j = 0; j < options[i]; j++) {
      var currentNode = [];
      for (var k = 0; k < previousInputs; k++) {
        currentNode.push([]);
      }
      currentLayer.push(currentNode);
    }
    previousInputs = currentLayer.length;
    network.push(currentLayer);
  }
  return network;
}

function computeNetwork(network, inputs) {
  var activationType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'SIGMOID';

  var currentInputs = inputs;
  var networkResult = [inputs.concat()];
  for (var i = 0; i < network.length; i++) {
    var currentLayer = network[i];
    var currentLayerResult = [];
    for (var j = 0; j < currentLayer.length; j++) {
      var currentNode = currentLayer[j];
      var sum = 0;
      for (var k = 0; k < currentNode.length; k++) {
        var currentWeight = Number('0.' + currentNode[k].slice(0).join(''));
        sum += currentInputs[k] * currentWeight;
      }
      var currentNodeResult = getActivation$1(activationType, i).output(sum);
      currentLayerResult.push(currentNodeResult);
    }
    networkResult.push(currentLayerResult);
    currentInputs = currentLayerResult;
  }
  return networkResult;
}

function getActivation$1(type, layerIndex) {
  if (typeof type === 'string') {
    return activation[type];
  } else if (Array.isArray(type)) {
    return activation[type[layerIndex]];
  }
}

function walk$1(network, accessor) {
  for (var i = 0; i < network.length; i++) {
    var currentLayer = network[i];
    for (var j = 0; j < currentLayer.length; j++) {
      var currentNode = currentLayer[j];
      for (var k = 0; k < currentNode.length; k++) {
        var currentWeight = currentNode[k];
        accessor({
          weight: currentWeight,
          node: currentNode,
          layer: currentLayer,
          network: network,
          path: [i, j, k]
        });
      }
    }
  }
}

function getWeightList(network) {
  var weightList = [];
  walk$1(network, function (data) {
    return weightList.push(data.weight);
  });
  return weightList;
}

function cloneNetwork(network) {
  return JSON.parse(JSON.stringify(network));
}

var index = {
  network: network,
  createBackPropagation: createBackPropagation,
  createEvolution: createEvolution,
  MCM: MCM,
  MCTS: MCTS,
  UCT: UCT,
  MCNNS: MCNNS
};

return index;

})));
