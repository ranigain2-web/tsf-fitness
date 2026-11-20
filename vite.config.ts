import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// TSF-001 walking skeleton. The PWA plugin (manifest + offline service
// worker) is added in its own judgeable piece on this same branch.
export default defineConfig({
  plugins: [react()],
})
