import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  define: {
    global: 'window'
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Paisán - Latin American Products',
        short_name: 'Paisán',
        description: 'Discover authentic Latin American products and connect with trusted suppliers',
        theme_color: '#F4A024',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'public/*',
          dest: ''
        }
      ]
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  // Configure SSR
  ssr: {
    // Externalize dependencies that shouldn't be bundled
    noExternal: ['react-helmet-async', 'react-hot-toast']
  },
  // Configure build
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Ensure CSS is extracted for better caching
    cssCodeSplit: true,
    // Minify output
    minify: 'terser',
    // Configure Terser
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for now
        drop_debugger: true
      }
    }
  }
})