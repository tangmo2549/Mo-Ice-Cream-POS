import React from 'react';

export default function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-white/45">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold mb-1" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-white/35">{sub}</p>}
    </div>
  );
}