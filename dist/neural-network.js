/*!
 * neural-network.js v1.0.0
 * (c) 2017-03-28 Jade Gu
 * Released under the MIT License.
 * @license
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.NeuralNetwork = global.NeuralNetwork || {})));
}(this, (function (exports) { 'use strict';

function SIGMOID(x) {
  return 1 / (1 + Math.exp(-x / 1));
}

function randomClamped() {
	return Math.random() * 2 - 1;
}

function randomBoolean() {
	return Math.random() <= 0.5;
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

var Neuron = function () {
	function Neuron() {
		var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
		var weightList = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
		classCallCheck(this, Neuron);

		this.value = value;
		this.weightList = weightList;
		this.activation = SIGMOID;
	}

	createClass(Neuron, [{
		key: 'populate',
		value: function populate(amount) {
			var weightList = this.weightList;

			for (var i = 0; i < amount; i++) {
				weightList.push(randomClamped());
			}
		}
	}, {
		key: 'repopulate',
		value: function repopulate() {
			var amount = this.weightList.length;
			this.weightList = [];
			this.populate(amount);
		}
	}, {
		key: 'computeByInput',
		value: function computeByInput(input) {
			this.value = input;
		}
	}, {
		key: 'computeByInputs',
		value: function computeByInputs(neuronInputs) {
			var sum = 0;
			for (var i = 0, len = neuronInputs.length; i < len; i++) {
				sum += neuronInputs[i].value * this.weightList[i];
			}
			this.value = this.activation(sum);
		}
	}, {
		key: 'clone',
		value: function clone() {
			return new Neuron(this.value, this.weightList.concat());
		}
	}, {
		key: 'mix',
		value: function mix(otherNeuron) {
			var weightList = this.weightList;

			for (var i = 0, len = weightList.length; i < len; i++) {
				if (randomBoolean()) {
					weightList[i] = otherNeuron.weightList[i];
				}
			}
		}
	}]);
	return Neuron;
}();

var Layer = function () {
	function Layer(index) {
		classCallCheck(this, Layer);

		this.index = index;
		this.neuronList = [];
	}

	createClass(Layer, [{
		key: 'populate',
		value: function populate(neuronAmount, inputAmount) {
			var neuronList = this.neuronList;

			for (var i = 0; i < neuronAmount; i++) {
				var neuron = new Neuron();
				neuron.populate(inputAmount);
				neuronList.push(neuron);
			}
		}
	}, {
		key: 'compute',
		value: function compute(inputs) {
			if (this.index === 0) {
				this.computeByInputs(inputs);
			} else {
				this.computeByPrevious(inputs);
			}
		}
	}, {
		key: 'computeByInputs',
		value: function computeByInputs(inputs) {
			for (var i = 0, len = inputs.length; i < len; i++) {
				this.neuronList[i].computeByInput(inputs[i]);
			}
		}
	}, {
		key: 'computeByPrevious',
		value: function computeByPrevious(previousLayer) {
			var currentNeuronList = this.neuronList;
			var previousNeuronList = previousLayer.neuronList;
			for (var i = 0, len = currentNeuronList.length; i < len; i++) {
				currentNeuronList[i].computeByInputs(previousNeuronList);
			}
		}
	}, {
		key: 'output',
		value: function output() {
			var results = [];
			for (var i = 0, len = this.neuronList.length; i < len; i++) {
				results.push(this.neuronList[i].value);
			}
			return results;
		}
	}, {
		key: 'clone',
		value: function clone() {
			var newLayer = new Layer(this.index);
			var neuronList = this.neuronList;

			for (var i = 0, len = neuronList.length; i < len; i++) {
				newLayer.neuronList.push(neuronList[i].clone());
			}
			return newLayer;
		}
	}, {
		key: 'mix',
		value: function mix(otherLayer) {
			var neuronList = this.neuronList;

			for (var i = 0, len = neuronList.length; i < len; i++) {
				neuronList[i].mix(otherLayer.neuronList[i]);
			}
		}
	}]);
	return Layer;
}();

var Network$1 = function () {
	function Network() {
		classCallCheck(this, Network);

		this.layerList = [];
	}

	createClass(Network, [{
		key: 'populate',
		value: function populate(inputAmount, hiddenAmountList, outputAmount) {
			var layerList = this.layerList;

			var amountList = [inputAmount].concat(hiddenAmountList, outputAmount);
			var previousAmount = 0;

			for (var i = 0, len = amountList.length; i < len; i++) {
				var amount = amountList[i];
				var layer = new Layer(i);
				layer.populate(amount, previousAmount);
				layerList.push(layer);
				previousAmount = amount;
			}
		}
	}, {
		key: 'compute',
		value: function compute(inputs) {
			var layerList = this.layerList;

			var currentInputs = inputs;

			for (var i = 0, len = layerList.length; i < len; i++) {
				layerList[i].compute(currentInputs);
				currentInputs = layerList[i];
			}

			var lastLayer = layerList[layerList.length - 1];
			var results = lastLayer.output();
			return results;
		}
	}, {
		key: 'clone',
		value: function clone() {
			var layerList = this.layerList;

			var newNetwork = new Network();
			for (var i = 0, len = layerList.length; i < len; i++) {
				newNetwork.layerList.push(layerList[i].clone());
			}
			return newNetwork;
		}
	}, {
		key: 'mix',
		value: function mix(otherLayerList, mutation) {
			var layerList = this.layerList;

			for (var i = 0, len = layerList.length; i < len; i++) {
				layerList[i].mix(otherLayerList[i]);
			}
			this.each(function (neuron) {
				for (var _i = 0, _len = neuron.weightList.length; _i < _len; _i++) {
					if (Math.random() <= mutation.rate) {
						neuron.weightList[_i] += mutation.range * randomClamped();
					}
				}
			});
		}
	}, {
		key: 'each',
		value: function each(callback) {
			var layerList = this.layerList;

			for (var i = 0, len = layerList.length; i < len; i++) {
				var neuronList = layerList[i].neuronList;
				for (var j = 0, len1 = neuronList.length; j < len1; j++) {
					callback(neuronList[j]);
				}
			}
		}
	}]);
	return Network;
}();

exports.Network = Network$1;

Object.defineProperty(exports, '__esModule', { value: true });

})));
