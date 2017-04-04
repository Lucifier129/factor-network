/*!
 * factor-network.js v1.0.0
 * (c) 2017-04-04 Jade Gu
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
	var value = SIGMOID(x);
	return value * (1 - value);
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
	var value = TANH(x);
	return 1 - value * value;
}

function create$1(options) {
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

function compute(network, inputs, activationType) {
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
			var currentNodeResult = activation[activationType].output(sum);
			currentLayerResult.push(currentNodeResult);
		}
		networkResult.push(currentLayerResult);
		currentInputs = currentLayerResult;
	}
	return networkResult;
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

function computeNetworkError(network, errors) {
	var networkError = [errors.concat()];
	var inputErrors = errors;

	for (var i = network.length - 1; i <= 0; i--) {
		var currentLayer = network[i];
		var layerError = [];
		for (var j = currentLayer.length - 1; j <= 0; j--) {
			var currentNode = currentLayer[i];
			var nodeError = [];
			for (var k = currentNode.length - 1; k <= 0; k--) {
				var currentWeight = currentNode[k];
				var currentError = inputErrors[j] * currentWeight;
				nodeError.unshift(currentError);
			}
			layerError.unshift(nodeError);
			inputErrors = nodeError;
		}
		networkError.unshift(layerError);
	}

	return networkError;
}

function updateNetworkWeights(network, networkResult, networkError, activationType, learningRate) {
	walk(network, function (data) {
		var path = data.path;
		var currentWeight = network[path[0]][path[1]][path[2]];
		var currentInput = networkResult[path[0]][path[1]];
		var currentResult = networkResult[path[0] + 1][path[1]];
		var currentError = networkError[path[0]][path[1]];
		var newWeight = currentWeight + learningRate * currentError * currentInput * activation[activationType].derivative(currentResult);
		network[path[0]][path[1]][path[2]] = newWeight;
	});
}

function create$$1(options) {
	var network = create$1(options.network);
	var networkResult = null;
	var networkError = null;

	function getNetwork() {
		return network;
	}

	function compute$$1(inputs) {
		networkResult = compute(network);
		return networkResult;
	}

	function adjuest(labels) {
		var errors = [];
		var lastResult = networkResult[networkResult.length - 1];
		for (var i = 0; i < labels.length; i++) {
			var error = labels[i] - lastResult[i];
			errors.push(error);
		}
		networkError = computeNetworkError(network, errors);
		updateNetworkWeights(network, networkResult, networkError, options.activation, options.learningRate);
	}

	return {
		options: options,
		getNetwork: getNetwork,
		compute: compute$$1,
		adjuest: adjuest
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

function create$2(options) {
	var networks = [];

	for (var i = 0; i < options.amount; i++) {
		var network = create$1(options.network);
		networks.push(network);
	}

	function getNetworks() {
		return networks;
	}

	function compute$$1(index, inputs) {
		return compute(networks[index], inputs, options.activation || 'SIGMOID');
	}

	var sorts = [];

	function addItem(index, score) {
		sorts.push({
			score: score,
			network: networks[index]
		});
	}

	function clearAll() {
		sorts = [];
	}

	function sortItems(sortType) {
		sorts.sort(function (a, b) {
			if (sortType > 0) {
				return a.score - b.score;
			} else {
				return b.score - a.score;
			}
		});
	}

	function adjust() {
		if (sorts.length !== options.amount) {
			return;
		}

		sortItems(options.sortType);

		var newNetworks = [];

		var elitismAmount = Math.round(options.elitismRate * options.amount);
		for (var _i = 0; _i < elitismAmount; _i++) {
			newNetworks.push(sorts[_i].network);
		}

		var randomAmount = Math.round(options.randomRate * options.amount);
		for (var _i2 = 0; _i2 < randomAmount; _i2++) {
			newNetworks.push(create$1(options.network));
		}

		var max = 0;
		while (true) {
			for (var _i3 = 0; _i3 < max; _i3++) {
				for (var j = 0; j < options.mixNumber; j++) {
					var newNetwork = mixNetwork(copy(sorts[_i3].network), sorts[max].network, options.mutation);
					newNetworks.push(newNetwork);
					if (newNetworks.length === options.amount) {
						sorts = [];
						networks = newNetworks;
						return;
					}
				}
			}
			max++;
		}
	}

	return {
		getNetworks: getNetworks,
		options: options,
		compute: compute$$1,
		addItem: addItem,
		clearAll: clearAll,
		adjust: adjust
	};
}

var index = {
	backPropagation: create$$1,
	evolution: create$2
};

return index;

})));
