import React from 'react'
import MCNNS from '../MCNNS'
import createGame from './game'

const mcnns = new MCNNS({
  network: [2, 2, 1],
  digitLength: 5,
  // activationType: 'RELU'
})

export default class Evolution extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.scoreList = []
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
    mcnns.handleFeedback(this.scoreList)
    this.modelList = mcnns.getModelList(this.state.amount)
    this.scoreList = []
  }
  handleBirdDead = ({ index, bird, score }) => {
    this.scoreList[index] = score
  }
  handleUpdate = ({ index, bird, inputs }) => {
    let results = this.modelList[index](inputs)
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
    this.scoreList = []
    this.setState({ amount: newAmount })
    this.startGame()
  }
  render() {
    return (
      <div>
        <div>
          <h3>Description</h3>
          <ul>
            <li>Generate {this.state.amount} birds</li>
            <li>Order birds by their score(Higher is better)</li>
            <li>Make the birds with higher score breed more</li>
            <li>Make the birds with lower score breed less or eliminate</li>
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
