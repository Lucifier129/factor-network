import React from 'react'
import ReactDOM from 'react-dom'
import Evolution from './flappy-learning/Evolution'
import EvolutionWithLabel from './flappy-learning/Evolution-with-label'
import BackPropagation from './flappy-learning/BackPropagation'
import Master from './flappy-learning/Master'
import HandwrittenDigit from './mnist/HandwrittenDigit'
import BoardView2048 from './2048' 

const routes = {
	'Flappy-Bird: Neuroevolution-Without-Labeled-Data': Evolution,
	'Flappy-Bird: Neuroevolution-With-Labeled-Data': EvolutionWithLabel,
	'Flappy-Bird: Back-Propagation': BackPropagation,
	'Flappy-Bird: Ten-Masters': Master,
	'Mnist: Handwritten-Digit': HandwrittenDigit,
	'Game-2048: Neuroevolution': BoardView2048
}

function Menu() {
	return (
		<ul>
			<h1>Factor-Network</h1>
			<h2>Powered by <a href="https://github.com/Lucifier129/factor-network">GitHub: Factor-Network</a></h2>
			{
				Object.keys(routes).map(route => {
					return (
						<li key={route}>
							<a href={`#${route}`}>{route}</a>
						</li>
					)
				})
			}
		</ul>
	)
}

function App() {
	let Component = routes[location.hash.substr(1)] || routes[Object.keys(routes)[0]]
	return (
		<div>
			<Menu />
			{ !!Component &&
				<Component />
			}
		</div>
	)
}

function render() {
	ReactDOM.render(
		<App />,
		document.getElementById('root')
	)
}

render()
window.addEventListener('hashchange', render)