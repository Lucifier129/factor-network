// rollup.config.js
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import license from 'rollup-plugin-license'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json'))

const banner =
  `/*!
 * <%= pkg.name %>.js v<%= pkg.version %>
 * (c) <%= moment().format('YYYY-MM-DD') %> Jade Gu
 * Released under the MIT License.
 * @license
 */`

const moduleName = pkg.name.split('-').map(str => str[0].toUpperCase() + str.slice(1)).join('')

export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleName: moduleName,
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
  dest: `./dist/${pkg.name}.js`
}