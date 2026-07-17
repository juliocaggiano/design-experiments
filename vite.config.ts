import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // fs.strict off: the workspace path contains ":" which confuses Vite's allow-list
  server: { port: 5173, fs: { strict: false } },
})
