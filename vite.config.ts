import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env vars that start with VITE_ from the OS and any .env files
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    server: {
      port: 3000,
    },

    /**
     * Replace import.meta.env.VITE_API_BASE_URL with the literal string
     * at build‑time so it’s baked into the bundle (no fallback to localhost).
     */
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        env.VITE_API_BASE_URL,
      ),
    },
  };
});

