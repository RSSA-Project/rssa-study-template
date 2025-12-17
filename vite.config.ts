import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";;
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		cssInjectedByJsPlugin(),
		dts({
			tsconfigPath: "./tsconfig.app.json",
			insertTypesEntry: true,
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "RssaStudyTemplate",
			fileName: (format) => `rssa-study-template.${format}.js`,
			formats: ["es"],
		},
		rollupOptions: {
			// Make sure to externalize deps that shouldn't be bundled
			external: ["react", "react-dom", "react-router-dom", "@tanstack/react-query", "rssa-api"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"rssa-api": "RssaApi",
					"react-router-dom": "ReactRouterDOM",
					"@tanstack/react-query": "ReactQuery",
				},
			},
		},
	},
});
