import React from 'react'
import FactorNetwork from '../../../dist/factor-network'
import createGame from './game'
import masters from './Master/networks'

const {
	network: $network,
	createBackPropagation
} = FactorNetwork

export default class BackPropagation extends React.Component {
	startGame() {
		this.game = createGame()
		this.game.start({
			birds: 1,
			onUpdate: this.handleUpdate,
		})
	}
	componentDidMount() {
		this.labelNetwork = masters[0]
		// this.labelNetwork = masters[Math.round(Math.random() * (masters.length - 1))]
		this.learner = createBackPropagation({
			network: [2, 2, 1],
			activation: 'SIGMOID',
			learningRate: 3,
		})
		this.startGame()
	}
	componentWillUnmount() {
		this.game.stop()
	}
	handleUpdate = ({ index, bird, inputs }) => {
		let results = this.learner.compute(inputs)
		let result = results[results.length - 1][0]
		let labelResults = $network.compute(this.labelNetwork, inputs, 'RELU')
		let labelResult = labelResults[labelResults.length - 1][0]

		this.learner.adjust([labelResult])

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
						<li>Pick a master bird trained by <a href="#Neuroevolution">Neuroevolution</a></li>
						<li>Generate one bird</li>
						<li>Use the master bird to generate labeled data</li>
						<li>Use BackPropagation to train the bird by fixing its error</li>
						<li>Repeat the steps above</li>
					</ul>
				</div>
			</div>
		)
	}
}