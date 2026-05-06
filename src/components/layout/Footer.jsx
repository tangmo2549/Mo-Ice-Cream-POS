import React from 'react';

export default function Footer() {
  return (
    <div
      className="relative z-50 flex items-center justify-between px-6 py-2 shrink-0 border-t"
      style={{
        background: 'rgba(8, 13, 30, 0.85)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-white/40">
          Sync Status: <span className="text-green-400">Online</span>
        </span>
      </div>
      <p className="text-xs text-white/30">© 2026 MO ICE CREAM POS</p>
    </div>
  );
}