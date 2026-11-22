import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Offline-first: the service worker precaches the built shell and keeps it
// fresh on subsequent loads (autoUpdate). Registration is safe offline —
// it simply fails silently when no worker can be fetched.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
