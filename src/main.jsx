import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { CryptoTransfer } from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CryptoTransfer/>
  </StrictMode>,

)
