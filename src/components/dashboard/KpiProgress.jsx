import React from 'react';

export default function KpiProgress({ label, current, target, color, unit = '฿' }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs text-white/40">
          {unit}{current?.toLocaleString()} / {unit}{target?.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
      <p className="text-right text-xs mt-1" style={{ color }}>{pct.toFixed(1)}%</p>
    </div>
  );
}