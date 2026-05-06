import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import base44 from "@base44/vite-plugin"

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', 
  // ระบุชื่อ Repository ให้ถูกต้องเพื่อให้ GitHub Pages หาไฟล์เจอ
  base: '/Mo-Ice-Cream-POS/', 
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ],
  // เพิ่มส่วนนี้เพื่อป้องกันไม่ให้ Build พังจากตัวแดงเล็กๆ น้อยๆ ค่ะ
  build: {
    chunkSizeWarningLimit: 1600,
  },
  esbuild: {
    // ปิดการแจ้งเตือนบางอย่างที่ทำให้การประกอบร่าง (Build) ล้มเหลว
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});