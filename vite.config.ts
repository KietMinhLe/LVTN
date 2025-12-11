import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Cho phép ngrok domain truy cập
    allowedHosts: [
      'unplowed-brigette-caliginously.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
      'localhost'
    ],
    host: true, // Cho phép truy cập từ bên ngoài
    proxy: {
      // Proxy API requests đến backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
      // Proxy SePay routes đến backend - KHÔNG rewrite path
      '/sepay': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('SePay proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying SePay request:', req.method, req.url);
          });
        },
      },
      // Proxy SePay IPN endpoint đến backend
      '/ipn': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('SePay IPN proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying SePay IPN request:', req.method, req.url);
          });
        },
      },
      // Proxy VNPay routes đến backend
      '/vnpay': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})