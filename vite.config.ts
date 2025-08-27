import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
	plugins: [
		tailwindcss(),
		react(),
		devtoolsJson(),
		VitePWA({ registerType: 'autoUpdate', manifest: false })
	],
	server: {
		allowedHosts: ["96cbe7f36a78.ngrok-free.app"]
	}
});
