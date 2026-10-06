import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { 
    port: 5173,
    // open:true,
    strictPort: true,  // Prevent silent port switching
    host: 'localhost',
    watch: {
      ignored: ['**/src-tauri/**'],  // Avoid infinite reload loops
    },
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
})
