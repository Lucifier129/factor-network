// rollup.config.js
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import license from 'rollup-plugin-license'

const banner =
  `/*!
 * <%= pkg.name %>.js v<%= pkg.version %>
 * (c) <%= moment().format('YYYY-MM-DD') %> Jade Gu
 * Released under the MIT License.
 * @license
 */`

export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleName: 'NeuralNetwork',
  plugins: [
    resolve(),
    babel({
      presets: ['es2015-rollup'],
      babelrc: false,
      exclude: 'node_modules/**' // only transpile our source code
    }),
    license({
      banner
    })
  ],
  dest: './dist/neural-network.js'
}