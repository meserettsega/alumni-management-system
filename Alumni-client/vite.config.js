import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 👇 This is the fix that enables direct access to routes like /reset-password/:token
    historyApiFallback: true,
  },
});
