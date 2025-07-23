import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['luma-logo.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
      },
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mantine/core', '@mantine/hooks', '@mantine/notifications'],
          icons: ['lucide-react', '@tabler/icons-react'],
          router: ['react-router-dom'],
          maps: ['@googlemaps/js-api-loader'],
          utils: ['date-fns', 'zustand']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});
