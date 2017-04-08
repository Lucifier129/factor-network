import React from 'react'
import FactorNetwork from '../../../dist/factor-network'
import createGame from './game'

const {
	network: $network,
	createEvolution
} = FactorNetwork

const evolution = createEvolution({
	network: [2, 2, 1],
	amount: 50,
	activation: 'RELU',
})

export default class Evolution extends React.Component {
	constructor(props, context) {
		super(props, context)
		this.ranks = []
		this.state = {
			amount: evolution.options.amount
		}
	}
	startGame() {
		this.game = createGame()
		this.game.start({
			birds: evolution.options.amount,
			onStart: this.handleStart,
			onUpdate: this.handleUpdate,
			// onStop: this.handleStop,
			onBirdDead: this.handleBirdDead,
		})
	}
	componentDidMount() {
		this.startGame()
	}
	componentWillUnmount() {
		this.game.stop()
	}
	handleStart = () => {
		if (this.ranks.length > 0) {
			evolution.adjust(this.ranks)
			this.ranks = []
		}
	}
	handleBirdDead = ({ index, bird, score }) => {
		this.ranks.unshift(index)
	}
	handleUpdate = ({ index, bird, inputs }) => {
		let results = evolution.compute(index, inputs)
		let result = results[results.length - 1][0]
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
		this.ranks = []
		this.startGame()
	}
	render() {
		return (
			<div>
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