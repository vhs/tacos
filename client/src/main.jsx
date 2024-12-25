import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'
import { SWRConfig } from 'swr'

import App from './App.jsx'
import { AuthenticationProvider } from './Components/AuthenticationProvider/AuthenticationProvider.jsx'
import { fetcher } from './lib/fetcher.js'

import './index.css'

let container = document.getElementById('root')

if (container == null) {
    container = document.createElement('div')
    document.appendChild(container)
}

createRoot(container).render(
    <StrictMode>
        <SWRConfig
            value={{
                fetcher,
                revalidateIfStale: true,
                revalidateOnFocus: true,
                revalidateOnMount: true,
                revalidateOnReconnect: true
            }}
        >
            <AuthenticationProvider>
                <App />
            </AuthenticationProvider>
        </SWRConfig>
    </StrictMode>
)
