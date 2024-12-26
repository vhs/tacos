import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
    const config = {
        build: {
            outDir: 'build'
        },
        plugins: [react()],
        server: {
            proxy: {
                '/auth': 'http://localhost:7000',
                '/api': 'http://localhost:7000'
            }
        }
    }

    if (process.env.NODE_ENV !== 'production')
        config.server.https = {
            key: fs.readFileSync(
                path.resolve(__dirname, './certs/localhost.key')
            ),
            cert: fs.readFileSync(
                path.resolve(__dirname, './certs/localhost.crt')
            )
        }

    return config
})
