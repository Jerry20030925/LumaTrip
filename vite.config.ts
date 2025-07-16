import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['luma-logo.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'LumaTrip',
        short_name: 'LumaTrip',
        description: 'A modern social travel app.',
        theme_color: '#3498DB',
        background_color: '#ffffff',
        icons: [
          {
            src: 'luma-logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'luma-logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
});
