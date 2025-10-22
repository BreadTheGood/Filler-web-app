import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile' // <-- Importa

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile() // <-- Añade el plugin
  ],
})