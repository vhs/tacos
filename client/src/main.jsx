import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'

let container = document.getElementById('root')

if (container == null) {
    container = document.createElement('div')
    document.appendChild(container)
}

createRoot(container).render(
    <StrictMode>
        <App />
    </StrictMode>
)
