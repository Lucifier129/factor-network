import React from 'react'
import ReactDOM from 'react-dom'
import Evolution from './flappy-learning/Evolution'
import BackPropagation from './flappy-learning/BackPropagation'
import Master from './flappy-learning/Master'

const routes = {
	'evolution': {
		title: '神经进化算法',
		Component: Evolution,
	},
	'backpropagation': {
		title: '反向传播算法',
		Component: BackPropagation
	},
	'10-masters': {
		title: '十大高手对决',
		Component: Master,
	}
}

function Menu() {
	return (
		<ul>
		<h1>Flappy-Learning</h1>
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
	let targetRouter = routes[location.hash.substr(1)]
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