import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import manifest from './manifest.json';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = path.resolve(process.cwd(), 'env'); // Folder where .env files placed

  const env = loadEnv(mode, envDir, ''); // Load internal Vite env variables

  const port = Number(env.VITE_PORT) || 5173;

  return {
    server: {
      port,
    },
    plugins: [
      react(),
      VitePWA({
        manifest,
        includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        // switch to "true" to enable sw on development
        devOptions: { enabled: false },
        registerType: 'autoUpdate',
        workbox: { globPatterns: ['**/*.{js,css,html}', '**/*.{svg,png,jpg,gif}'] },
      }),
    ],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  };
});
