import React from 'react'
import FactorNetwork from '../../../dist/factor-network'
import network from '../../nodejs/network/mnist-bp'
import * as utils from './utils'

let {
	network: $network
} = FactorNetwork

export default class HandwrittenDigit extends React.Component {
	state = {
		stats: null,
		number: 0,
	}
	isDrawing = false
	strokes = []
	componentDidMount() {
		let { canvas } = this.refs
		let options = {
			passive: false,
		}
		canvas.addEventListener('mousedown', this.handleDrawStart, options)
		canvas.addEventListener('mousemove', this.handleDrawing, options)
		canvas.addEventListener('mouseup', this.handleDrawEnd, options)
		canvas.addEventListener('touchstart', this.handleDrawStart, options)
		canvas.addEventListener('touchmove', this.handleDrawing, options)
		canvas.addEventListener('touchend', this.handleDrawEnd, options)
	}
	getCtx() {
		let { canvas } = this.refs
		let ctx = canvas.getContext('2d')
		return ctx
	}
	handleClear = () => {
		let { canvas } = this.refs
		let ctx = canvas.getContext('2d')
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		this.strokes = []
		this.isDrawing = false
		this.setState({
			stats: null
		})
	}
	handleDrawStart = event => {
		event.preventDefault()
		this.isDrawing = true
		this.strokes.push([])
	}
	handleDrawing = (event) => {
		event.preventDefault()
		if (!this.isDrawing) {
			return
		}
		let ctx = this.getCtx()
		let { layerX, layerY } = event
		ctx.lineWidth = 18
      	ctx.lineJoin = ctx.lineCap = 'round'
      	ctx.strokeStyle = '#393E46'

      	let points = this.strokes[this.strokes.length - 1]
      	points.push(utils.getCoordinates(event))
      	// draw individual strokes
	      for (let s = 0, slen = this.strokes.length; s < slen; s++) {
	        points = this.strokes[s]
	        let p1 = points[0]
	        let p2 = points[1]
	        if (!p1 || !p2) {
	        	return
	        }
	        ctx.beginPath()
	        ctx.moveTo(...p1)
	        // draw points in stroke
	        // quadratic bezier curve
	        for (let i = 1, len = points.length; i < len; i++) {
	          ctx.quadraticCurveTo(...p1, ...utils.getMidpoint(p1, p2))
	          p1 = points[i]
	          p2 = points[i + 1]
	        }
	        ctx.lineTo(...p1)
	        ctx.stroke()
	      }
	}

	handleDrawEnd = event => {
		if (!this.isDrawing) {
			return
		}
		this.isDrawing = false
		let ctx = this.getCtx()
        // center crop
        let imageDataCenterCrop = utils.centerCrop(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height))

        if (!imageDataCenterCrop) {
        	return
        }

        let ctxCenterCrop = document.getElementById('input-canvas-centercrop').getContext('2d')
        ctxCenterCrop.canvas.width = imageDataCenterCrop.width
        ctxCenterCrop.canvas.height = imageDataCenterCrop.height
        ctxCenterCrop.putImageData(imageDataCenterCrop, 0, 0)
        // scaled to 28 x 28
        let ctxScaled = document.getElementById('input-canvas-scaled').getContext('2d')
        ctxScaled.save()
        ctxScaled.scale(28 / ctxCenterCrop.canvas.width, 28 / ctxCenterCrop.canvas.height)
        ctxScaled.clearRect(0, 0, ctxCenterCrop.canvas.width, ctxCenterCrop.canvas.height)
        ctxScaled.drawImage(document.getElementById('input-canvas-centercrop'), 0, 0)
        let imageDataScaled = ctxScaled.getImageData(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
        ctxScaled.restore()
        // process image data for model input
        let { data } = imageDataScaled
        let input = new Float32Array(784)
        for (let i = 0, len = data.length; i < len; i += 4) {
          input[i / 4] = data[i + 3] / 255
        }

        this.handleInput(Array.from(input))
	}

	handleInput = (input) => {
		logNumber(input)
		let results = $network.compute(network, input)
		let output = results[results.length - 1]
		let stats = output.map((output, number) => ({ output, number }))
		let number = stats.reduce((target, item) => {
			return item.output > target.output ? item: target
		}).number

		this.setState({ stats, number })
	}

	render() {
		return (
			<div>
				<div>
					<h3>Description</h3>
					<ul>
						<li>Use <a href="https://en.wikipedia.org/wiki/MNIST_database" target="_blank">MNIST  Database</a></li>
						<li>Use [784, 100, 10] of network</li>
						<li>Use Backpropagation to train neural network</li>
						<li>Wait for error rate reach 6%</li>
						<li><strong>Write down your own digit below!!!</strong></li>
					</ul>
				</div>
				<canvas
					style={{ border: '15px solid rgba(27,188,155,.3)' }}
					ref="canvas"
					width="240"
					height="240"
				/>
				<canvas id="input-canvas-scaled" width="28" height="28" style={{ display: ''}}></canvas>
           		<canvas id="input-canvas-centercrop" style={{ display: 'none'}}></canvas>
				<div>
					<button onClick={this.handleClear}>clear</button>
				</div>
				{ !!this.state.stats &&
					<h3>
						The number you had drew {' '}
						{(this.state.stats[this.state.number].output * 100).toFixed(2)}%
						is: {' '}
						<span style={{ color: 'rgb(27,188,155)' }}>
							{this.state.number}
						</span>
					</h3>
				}
				{ !!this.state.stats &&
					<pre>
						stats:
						{JSON.stringify(this.state.stats, null, 2)}
					</pre>
				}
			</div>
		)
	}
}


function logNumber(input) {
	let logList = []
	for (let i = 0; i < 28; i++) {
		let list = []
		for (let j = 0; j < 28; j++) {
			list.push(input[i * 28 + j] > 0 ? '0' : '1')
		}
		logList.push(list.join(''))
	}

	console.log(logList.join('\n'))
}

