import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '*.ngrok-free.app',
      '*.ngrok-free.dev',
      // 必要なら今の発行ドメインを完全一致で追加:
      'churchy-inclinatorily-delsie.ngrok-free.dev',
    ],
    hmr: {
      // サーバはローカルでLISTEN、クライアントは443で接続する
      protocol: 'wss',
      clientPort: 443,
      // host は省略でもOK。必要なら ngrok ドメインを指定してもよい:
      // host: 'churchy-inclinatorily-delsie.ngrok-free.dev',
      // ※ ここに port は書かない！
    },
  },
})
