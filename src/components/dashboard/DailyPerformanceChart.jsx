import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

const SCHOOL_COLORS = {
  'วัดดอนไก่ดี': '#ccff00',
  'วัดท่าพูด': '#00e5ff',
  'พระตำหนักฯ': '#ff00e5',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div
      className="rounded-xl p-4 shadow-2xl"
      style={{
        background: 'rgba(8, 14, 32, 0.97)',
        border: '1.5px solid rgba(255,255,255,0.15)',
        minWidth: '200px',
      }}
    >
      <p className="text-white font-bold text-sm mb-3 border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        📅 {label}
      </p>
      {payload.map((entry, i) => {
        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
        return (
          <div key={i} className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.fill }} />
              <span className="text-white/80 text-xs">{entry.name}</span>
            </div>
            <div className="text-right">
              <span className="text-white font-bold text-xs">฿{entry.value?.toLocaleString()}</span>
              <span className="text-white/40 text-xs ml-2">({pct}%)</span>
            </div>
          </div>
        );
      })}
      <div className="mt-2 pt-2 border-t flex justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <span className="text-white/50 text-xs">รวม</span>
        <span className="text-white font-bold text-xs">฿{total.toLocaleString()}</span>
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="flex items-center justify-center gap-6 mt-2">
    {payload?.map((entry, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-sm" style={{ background: entry.color }} />
        <span className="text-white/70 text-xs">{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function DailyPerformanceChart({ data }) {
  const schools = Object.keys(SCHOOL_COLORS);

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="mb-5">
        <h3 className="text-white font-bold text-sm">Daily Performance Analysis</h3>
        <p className="text-white/40 text-xs mt-0.5">ยอดขายรายวัน จันทร์–ศุกร์ (หลัง 20:00 น.)</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={4} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#ffffff', fontSize: 12, fontFamily: 'Noto Sans Thai' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#ffffff', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend content={<CustomLegend />} />
          {schools.map(school => (
            <Bar key={school} dataKey={school} fill={SCHOOL_COLORS[school]} radius={[4,4,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}