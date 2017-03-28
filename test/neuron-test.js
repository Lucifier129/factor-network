import expect from 'expect'
import Neuron from '../src/network/Neuron'

describe('test Neuron', () => {
	it('should not throw error', async () => {
		let neuron = new Neuron()
		neuron.populate(10)

		await Promise.resolve(1)

		expect(neuron).toBeAn('object')
		expect(neuron.value).toEqual(0)
		expect(neuron.weightList.length).toEqual(10)
	})
})
