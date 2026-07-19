import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.GIT_COURSE_DASHBOARD_HOST ?? '0.0.0.0',
    port: 4178,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:4179',
      '/files': 'http://127.0.0.1:4179',
    },
  },
  build: {
    target: 'es2022',
  },
});
