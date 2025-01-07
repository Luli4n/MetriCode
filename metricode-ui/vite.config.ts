import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Konfiguracja poprawnej ścieżki do pliku index.html
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  root: '.', // Upewnia się, że index.html w katalogu głównym
  build: {
    outDir: 'dist'
  }
});
