import React from 'react';

export default function BackgroundEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Subtle top center glow */}
      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(0, 80, 120, 0.18) 0%, transparent 70%)',
        }}
      />
      {/* Bottom right subtle */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(0, 60, 100, 0.12) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}