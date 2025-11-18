import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'StripeUtils',
			fileName: (format) => `stripe-utils.${format}.js`,
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			external: ['stripe', 'moment'],
			output: {
				globals: {
					stripe: 'Stripe',
					moment: 'moment',
				},
			},
		},
	},
	test: {
		globals: true,
		environment: 'node',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
		},
	},
})
