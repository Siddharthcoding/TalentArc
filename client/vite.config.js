import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL?.replace(/\/$/, '');

  return {
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
    }
  },

  build: {
    // Raise warning threshold — individual chunks after splitting will be smaller
    chunkSizeWarningLimit: 600,

    // Inline small assets (< 4 KB) as base64 to save HTTP round-trips
    assetsInlineLimit: 4096,

    // Use Rollup's built-in tree shaking
    rollupOptions: {
      output: {
        // ── Manual chunk splitting ──────────────────────────────────────────
        // Each group gets its own cached bundle, loaded only when first needed
        manualChunks(id) {
          // Core React runtime — tiny, always needed, cached forever
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

          // Router — loaded on every page but separately cacheable
          if (id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }

          // Animations — large lib, lazy-load with pages that use it
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer';
          }

          // Icons — medium size, changes rarely
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }

          // HTTP client
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }

          // Helmet for SEO
          if (id.includes('node_modules/react-helmet-async')) {
            return 'vendor-helmet';
          }

          // Heavy admin pages — grouped separately (rarely visited)
          if (id.includes('/pages/CompanyBankAdmin') ||
              id.includes('/pages/DoubtSessionAdmin')) {
            return 'pages-admin';
          }

          // Assessment session (large, auth-gated)
          if (id.includes('/pages/AssessmentSession') ||
              id.includes('/pages/AssessmentReport') ||
              id.includes('/pages/AssessmentLanding')) {
            return 'pages-assessment';
          }

          // Company bank (large, auth-gated)
          if (id.includes('/pages/CompanyBank') ||
              id.includes('/pages/CompanyBankDetail')) {
            return 'pages-company';
          }

          // Doubt sessions (largest page)
          if (id.includes('/pages/DoubtSessions')) {
            return 'pages-doubt';
          }
        },
      },
    },
  },
  };
});
