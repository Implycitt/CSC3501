import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import './game-ui.css'
import './mira-ui.css'
import './deck-select.css'
import './workbench.css'
import './manual.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
