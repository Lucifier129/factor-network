/*!
 * factor-network.js v1.0.1
 * (c) 2017-08-07 Jade Gu
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
		var networkError = computeError(labels);
		updateNetworkWeights(network, networkResult, networkError, options.activation, options.learningRate);
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

var index = {
	network: network,
	createBackPropagation: createBackPropagation,
	createEvolution: createEvolution
};

return index;

})));
