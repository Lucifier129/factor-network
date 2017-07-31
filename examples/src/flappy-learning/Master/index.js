import React from 'react'
import FactorNetwork from '../../../../dist/factor-network'
import createGame from '../game'
import masters from './networks'

const {
	network,
} = FactorNetwork

export default class BackPropagation extends React.Component {
	startGame() {
		this.game = createGame()
		this.game.start({
			birds: masters.length,
			onUpdate: this.handleUpdate,
		})
	}
	componentDidMount() {
		this.startGame()
	}
	componentWillUnmount() {
		this.game.stop()
	}
	handleUpdate = ({ index, bird, inputs }) => {
		let results = network.compute(masters[index], inputs, 'RELU')
		let result = results[results.length - 1][0]
		if (result > 0.5) {
			bird.flap()
		}
	}

	handleSwitchSpeed = ({ currentTarget }) => {
		let speed = currentTarget.getAttribute('data-speed')
		this.game.speed(Number(speed))
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
				<div>
					<h3>Description</h3>
					<ul>
						<li>Pick ten master birds trained by <a href="#Neuroevolution">Neuroevolution</a></li>
						<li>Start game</li>
					</ul>
				</div>
			</div>
		)
	}
}