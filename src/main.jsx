import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AudioEqualizer from './audioequalizer.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AudioEqualizer />
  </StrictMode>,
)
