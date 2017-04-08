import React from 'react'
import ReactDOM from 'react-dom'
import Evolution from './flappy-learning/Evolution'
import BackPropagation from './flappy-learning/BackPropagation'
import Master from './flappy-learning/Master'

const routes = {
	'Neuroevolution': {
		title: '神经进化算法',
		Component: Evolution,
	},
	'Back-Propagation': {
		title: '反向传播算法',
		Component: BackPropagation
	},
	'Ten-Masters': {
		title: '十大高手对决',
		Component: Master,
	}
}

function Menu() {
	return (
		<ul>
			<h1>Flappy-Learning</h1>
			<h2>Powered by <a href="https://github.com/Lucifier129/factor-network">Factor-Network</a></h2>
			{
				Object.keys(routes).map(route => {
					return (
						<li key={route}>
							<a href={`#${route}`}>{route + ': ' + routes[route].title}</a>
						</li>
					)
				})
			}
		</ul>
	)
}

function App() {
	let targetRouter = routes[location.hash.substr(1)] || routes['Neuroevolution']
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