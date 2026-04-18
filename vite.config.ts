import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' emits relative asset paths so the built index.html works both
// from a web server and from Electron's file:// protocol.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, host: true },
});
