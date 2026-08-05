import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './env-check'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  {/* React StrictMode will cause double mounting of components in development (effects run twice). This does not affect production builds. */}
  <StrictMode>
    <App />
  </StrictMode>
)
