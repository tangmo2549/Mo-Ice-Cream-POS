import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import base44 from "@base44/vite-plugin"

export default defineConfig({
  logLevel: 'error', 
  base: '/Mo-Ice-Cream-POS/', // ระบุชื่อโปรเจกต์เพื่อให้หาไฟล์ main.jsx เจอ
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ]
});