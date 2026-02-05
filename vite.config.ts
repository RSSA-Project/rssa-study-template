import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		libInjectCss(),
		dts({
			tsconfigPath: './tsconfig.app.json',
			rollupTypes: true,
			insertTypesEntry: true,
			exclude: ['**/*.test.ts', '**/*.test.tsx', 'src/setupTests.ts'],
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'RssaStudyTemplate',
			fileName: (format) => `rssa-study-template.${format}.js`,
			formats: ['es'],
		},
		rollupOptions: {
			// Externalize deps that shouldn't be bundled
			external: [
				'react',
				'react-dom',
				'react-router-dom',
				'@headlessui/react',
				'@heroicons/react',
				'@tanstack/react-query',
				'@rssa-project/api',
			],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					'@headlessui/react': 'HeadlessUI',
					'@heroicons/react': 'HeroIcons',
					'@rssa-project/api': 'RssaApi',
					'react-router-dom': 'ReactRouterDOM',
					'@tanstack/react-query': 'ReactQuery',
				},
			},
		},
	},
});
