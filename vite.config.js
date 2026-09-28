import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // or your standard Tailwind import

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})