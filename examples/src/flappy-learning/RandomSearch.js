import React from 'react'
import FactorNetwork from '../../../dist/factor-network'
import createGame from './game'

const { network: $network } = FactorNetwork

const networkConfig = [2, 2, 1]

export default class extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.ranks = []
    this.state = {
      amount: 50
    }
  }
  startGame() {
    this.game = createGame()
    this.game.start({
      birds: this.state.amount,
      onStart: this.handleStart,
      onUpdate: this.handleUpdate,
      // onStop: this.handleStop,
      onBirdDead: this.handleBirdDead
    })
  }
  componentDidMount() {
    this.startGame()
  }
  componentWillUnmount() {
    this.game.stop()
  }
  handleStart = () => {
    this.networkList = Array.from({ length: this.state.amount }).map(() =>
      $network.create(networkConfig)
    )
  }
  handleUpdate = ({ index, bird, inputs }) => {
    let results = $network.compute(this.networkList[index], inputs)
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
    this.game.stop()
    this.startGame()
  }
  render() {
    return (
      <div>
        <div>
          <h3>Description</h3>
          <ul>
            <li>
              Just randomly initialize {this.state.amount} neural networks for
              birds
            </li>
            <li>Repeat the steps above</li>
          </ul>
        </div>
        <canvas id="flappy" width="500" height="512" />
        <br />
        <button onClick={this.handleSwitchSpeed} data-speed="60">
          x1
        </button>
        <button onClick={this.handleSwitchSpeed} data-speed="120">
          x2
        </button>
        <button onClick={this.handleSwitchSpeed} data-speed="180">
          x3
        </button>
        <button onClick={this.handleSwitchSpeed} data-speed="380">
          x5
        </button>
        <button onClick={this.handleSwitchSpeed} data-speed="0">
          MAX
        </button>
        <br />
        <input
          value={this.state.amount}
          onChange={({ currentTarget }) =>
            this.setState({ amount: currentTarget.value })
          }
        />
        <button onClick={this.hanldeUpdateAmount}>update birds amount</button>
      </div>
    )
  }
}
