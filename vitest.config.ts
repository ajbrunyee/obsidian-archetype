import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'happy-dom',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'*.config.*',
				'main.ts', // Just re-exports
				'**/*.test.ts',
				'**/__mocks__/**',
			],
		},
	},
	resolve: {
		alias: {
			obsidian: new URL('./src/__mocks__/obsidian.ts', import.meta.url).pathname,
		},
	},
});

