import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, TrendingUp, Package, ClipboardList, LogOut, IceCreamCone } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'ยอดขายวันนี้', value: '฿ 12,450', sub: '+8% จากเมื่อวาน', color: '#ff6b1a' },
    { label: 'ออเดอร์วันนี้', value: '47', sub: 'รายการ', color: '#00d4ff' },
    { label: 'สินค้าคงเหลือ', value: '128', sub: 'รายการ', color: '#e040fb' },
    { label: 'กำไรสุทธิ', value: '฿ 5,230', sub: 'วันนี้', color: '#4ade80' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #050c1a 0%, #070d1e 40%, #050a18 100%)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{
          background: 'rgba(6, 10, 22, 0.95)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ff6b1a, #e84d00)', boxShadow: '0 0 16px rgba(255,107,26,0.4)' }}
          >
            <IceCreamCone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">MO ICE CREAM</p>
            <p className="text-[11px] text-white/35">Dashboard · ระบบจัดการร้านค้า</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          ออกจากระบบ
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">ยินดีต้อนรับกลับมา 👋</h1>
          <p className="text-sm text-white/40 mt-1">ภาพรวมธุรกิจวันนี้ · {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid rgba(255,255,255,0.08)`,
              }}
            >
              <p className="text-xs text-white/45 mb-2">{s.label}</p>
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-white/35 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: ShoppingCart, label: 'ขายสินค้า', desc: 'เปิดหน้าร้าน POS', color: '#ff6b1a' },
            { icon: TrendingUp, label: 'รายงานยอดขาย', desc: 'ดูสถิติ', color: '#00d4ff' },
            { icon: ClipboardList, label: 'จัดการเมนู', desc: 'เพิ่ม / แก้ไข', color: '#e040fb' },
            { icon: Package, label: 'คลังสินค้า', desc: 'ติดตามสต็อก', color: '#4ade80' },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <button
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:bg-white/[0.06]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `rgba(${a.color === '#ff6b1a' ? '255,107,26' : a.color === '#00d4ff' ? '0,212,255' : a.color === '#e040fb' ? '224,64,251' : '74,222,128'}, 0.15)` }}
                >
                  <Icon className="w-5 h-5" style={{ color: a.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{a.label}</p>
                  <p className="text-xs text-white/40">{a.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}