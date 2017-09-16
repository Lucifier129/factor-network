import React from 'react'
import FactorNetwork from '../../../dist/factor-network'
import createGame from './game'
import networks from './Master/networks'

const {
	network: $network,
	createEvolution
} = FactorNetwork

const labelNetwork = networks[0]

const evolution = createEvolution({
	network: [2, 2, 1],
	amount: 50,
	activation: 'RELU',
})

export default class Evolution extends React.Component {
	constructor(props, context) {
		super(props, context)
		this.errorList = []
		this.state = {
			amount: evolution.options.amount
		}
	}
	startGame() {
		this.errorList = []
		this.game = createGame()
		this.game.start({
			birds: evolution.options.amount,
			onStart: this.handleStart,
			onUpdate: this.handleUpdate,
		})
	}
	addError(index, error) {
		if (!Array.isArray(this.errorList[index])) {
			this.errorList[index] = []
		}
		this.errorList[index].push(error)
	}
	clearErrorList() {
		this.errorList = []
	}
	getRanks() {
		let { errorList } = this
		let list = []

		for (let i = 0; i < errorList.length; i++) {
			let sum = errorList[i].reduce((sum, item) => sum + Math.abs(item), 0)
			let value = sum / errorList[i].length
			list.push({ index: i , value })
		}

		let ranks = list.sort((a, b) => a.value - b.value)
		console.log('Min error', ranks[0].value)
		return ranks.map(({ index }) => index)
	}
	componentDidMount() {
		this.startGame()
	}
	componentWillUnmount() {
		this.game.stop()
	}
	handleStart = () => {
		if (this.errorList.length > 0) {
			evolution.adjust(this.getRanks())
			this.clearErrorList()
		}
	}
	handleUpdate = ({ index, bird, inputs }) => {
		let labelResults = $network.compute(labelNetwork, inputs, 'RELU')
		let labelResult = labelResults[labelResults.length - 1][0]
		let results = evolution.compute(index, inputs)
		let result = results[results.length - 1][0]
		let error = labelResult - result
		this.addError(index, error)
		if (result > 0.5) {
			bird.flap()
		}
	}

	handleSwitchSpeed = ({ currentTarget }) => {
		let speed = currentTarget.getAttribute('data-speed')
		this.game.speed(Number(speed))
	}
	hanldeUpdateAmount = ({ currentTarget }) => {
		let input = currentTarget.previousElementSibling
		let newAmount = Number(input.value)

		if (newAmount === evolution.options.amount) {
			return
		}

		if (newAmount < 2) {
			alert(`How to breed with just ${newAmount} bird`)
			return
		}

		this.game.stop()
		evolution.updateAmount(0)
		evolution.updateAmount(newAmount)
		this.startGame()
	}
	render() {
		return (
			<div>
				<div>
					<h3>Description</h3>
					<ul>
						<li>Pick a master bird trained by <a href="#Neuroevolution">Neuroevolution</a></li>
						<li>Generate {this.state.amount} birds</li>
						<li>Use the master bird to generate labeled data</li>
						<li>Use labeled data to compute the error of all birds</li>
						<li>Order birds by their error(Lower is better)</li>
						<li>Make the birds with lower error breed more</li>
						<li>Make the birds with higher error breed less or eliminate</li>
						<li>Repeat the steps above</li>
					</ul>
				</div>
				<canvas id="flappy" width="500" height="512"></canvas>
				<br/>
				<button onClick={this.handleSwitchSpeed} data-speed="60">x1</button>
				<button onClick={this.handleSwitchSpeed} data-speed="120">x2</button>
				<button onClick={this.handleSwitchSpeed} data-speed="180">x3</button>
				<button onClick={this.handleSwitchSpeed} data-speed="380">x5</button>
				<button onClick={this.handleSwitchSpeed} data-speed="0">MAX</button>
				<br />
				<input
					value={this.state.amount}
					onChange={({ currentTarget }) => this.setState({ amount: currentTarget.value })}
				/>
				<button onClick={this.hanldeUpdateAmount}>update birds amount</button>
			</div>
		)
	}
}