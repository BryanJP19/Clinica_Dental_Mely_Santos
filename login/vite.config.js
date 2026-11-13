import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; frame-src https://www.google.com https://maps.google.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
const securityMeta = { name: 'csp-meta', apply: 'build', transformIndexHtml: h => h.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`) }
export default defineConfig({ plugins: [react(), securityMeta] })
