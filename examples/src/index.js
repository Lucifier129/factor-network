import React from 'react'
import ReactDOM from 'react-dom'
import Evolution from './flappy-learning/Evolution'
import EvolutionWithLabel from './flappy-learning/Evolution-with-label'
import BackPropagation from './flappy-learning/BackPropagation'
import Master from './flappy-learning/Master'

const routes = {
	'Neuroevolution-Without-Labeled-Data': {
		Component: Evolution,
	},
	'Neuroevolution-With-Labeled-Data': {
		Component: EvolutionWithLabel,
	},
	'Back-Propagation': {
		Component: BackPropagation
	},
	'Ten-Masters': {
		Component: Master,
	}
}

function Menu() {
	return (
		<ul>
			<h1>Flappy-Learning</h1>
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
	let targetRouter = routes[location.hash.substr(1)] || routes['Neuroevolution-Without-Labeled-Data']
	return (
		<div>
			<Menu />
			{ !!targetRouter &&
				<targetRouter.Component />
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