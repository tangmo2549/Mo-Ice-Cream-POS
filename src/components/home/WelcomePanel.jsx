import React from 'react';
import { Shield, ShoppingCart, TrendingUp, ClipboardList, Package } from 'lucide-react';

const features = [
  { icon: ShoppingCart, title: 'ขายสินค้า', desc: 'POS หน้าร้าน' },
  { icon: TrendingUp, title: 'ยอดขาย', desc: 'วิเคราะห์รายวัน' },
  { icon: ClipboardList, title: 'จัดการเมนู', desc: 'เพิ่ม / แก้ไข' },
  { icon: Package, title: 'สต็อก', desc: 'ติดตามสินค้า' },
];

export default function WelcomePanel({ selectedSchool }) {
  const accent = selectedSchool?.color || '#ff6b1a';
  const accentRgb = selectedSchool?.color_rgb || selectedSchool?.colorRgb || '255,107,26';

  return (
    <div className="hidden lg:flex lg:w-[42%] flex-col justify-center px-12 py-8 shrink-0">
      {/* Badge */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 w-fit transition-all duration-500"
        style={{
          background: `rgba(${accentRgb}, 0.08)`,
          border: `1px solid rgba(${accentRgb}, 0.2)`,
        }}
      >
        <Shield className="w-3.5 h-3.5 transition-all duration-500" style={{ color: accent }} />
        <span className="text-xs text-white/45 font-medium">Secure PIN Access</span>
      </div>

      {/* Title */}
      <h1 className="text-xl font-semibold text-white/55 mb-0.5">ยินดีต้อนรับสู่</h1>
      <h2
        className="text-3xl font-extrabold mb-8 transition-all duration-500"
        style={{ color: accent, textShadow: `0 0 30px rgba(${accentRgb}, 0.4)` }}
      >
        Mo Ice Cream POS
      </h2>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-500"
              style={{
                background: `rgba(${accentRgb}, 0.05)`,
                border: `1px solid rgba(${accentRgb}, 0.12)`,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500"
                style={{ background: `rgba(${accentRgb}, 0.15)` }}
              >
                <Icon className="w-3.5 h-3.5 transition-all duration-500" style={{ color: accent }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/85">{f.title}</p>
                <p className="text-[11px] text-white/35">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}