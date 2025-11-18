import { describe, expect, it } from 'vitest'
import * as index from '../../src/index'

describe('index.ts', () => {
	describe('subscription', () => {
		const keys = Object.keys(index.subscriptions)
		it('should contain RenewalReminder method', () => {
			expect(keys.indexOf('RenewalReminder')).not.toBe(-1)
		})
	})
	describe('charges', () => {
		const keys = Object.keys(index.charges)
		it('should contain getDeclineDescriptionmethod', () => {
			expect(keys.indexOf('getDeclineDescription')).not.toBe(-1)
		})
	})
})
