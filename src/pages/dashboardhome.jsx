import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StatCard from "@/components/dashboard/StatCard.jsx";
import DailyPerformanceChart from '@/components/dashboard/DailyPerformanceChart';
import KpiProgress from '@/components/dashboard/KpiProgress';
import { TrendingUp, ShoppingCart, Package, Wallet, AlertTriangle, Settings, Trash2, X, QrCode } from 'lucide-react';
import { getRoleLabel } from '@/lib/session';

const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];

function buildChartData(dailySales) {
  return DAYS.map(day => {
    const entry = { day };
    ['วัดดอนไก่ดี', 'วัดท่าพูด', 'พระตำหนักฯ'].forEach(school => {
      const found = dailySales.find(d => d.day_of_week === day && d.school_name?.includes(school.replace('ฯ', '')));
      entry[school] = found?.is_submitted ? (found.total_revenue || 0) : 0;
    });
    return entry;
  });
}

// KPI Settings Modal
function KpiSettingsModal({ school, onClose, onSaved }) {
  const [monthlyTarget, setMonthlyTarget] = useState(school?.monthly_target || 50000);
  const [orderTarget, setOrderTarget] = useState(school?.order_target || 1000);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await base44.entities.School.update(school.id, { monthly_target: monthlyTarget, order_target: orderTarget });
    setSaving(false);
    onSaved({ monthly_target: monthlyTarget, order_target: orderTarget });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)' }}>
        <div className="flex justify-between mb-5">
          <h2 className="text-white font-bold flex items-center gap-2"><Settings className="w-4 h-4 text-yellow-400" /> ตั้งเป้าหมาย KPI</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-white/40" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">เป้าหมายรายได้/เดือน (฿)</label>
            <input type="number" value={monthlyTarget} onChange={e => setMonthlyTarget(+e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">เป้าหมายออเดอร์/เดือน (รายการ)</label>
            <input type="number" value={orderTarget} onChange={e => setOrderTarget(+e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs text-white/50" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ยกเลิก</button>
          <button onClick={save} disabled={saving} className="flex-[2] py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #facc15, #ea580c)' }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกเป้าหมาย'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Executive School Summary (owner only)
function SchoolSummaryTable({ schools, orders }) {
  return (
    <div className="rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <h3 className="text-white font-bold text-sm">Executive Insight — สรุปทุกสาขา</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
            {['สาขา', 'ยอดขายรวม', 'ออเดอร์', 'KPI %', 'สถานะ'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs text-white/40 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schools.map(s => {
            const schoolOrders = orders.filter(o => o.school_id === s.id);
            const revenue = schoolOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
            const target = s.monthly_target || 50000;
            const pct = Math.min(100, Math.round((revenue / target) * 100));
            const color = pct >= 90 ? '#4ade80' : pct >= 60 ? '#facc15' : '#f87171';
            return (
              <tr key={s.id} className="border-t hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <td className="px-5 py-3 text-sm text-white font-medium">{s.emoji} {s.name}</td>
                <td className="px-5 py-3 text-sm font-bold" style={{ color: s.color || '#ff6b1a' }}>฿{revenue.toLocaleString()}</td>
                <td className="px-5 py-3 text-xs text-white/60">{schoolOrders.length} รายการ</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 max-w-24">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: pct >= 90 ? 'rgba(74,222,128,0.12)' : pct >= 60 ? 'rgba(250,204,21,0.12)' : 'rgba(248,113,113,0.12)', color }}>
                    {pct >= 90 ? '🔥 ยอดเยี่ยม' : pct >= 60 ? '📈 ปานกลาง' : '⚠️ ต้องเร่ง'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardHome() {
  const { school, role } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [allSchools, setAllSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showKpiSettings, setShowKpiSettings] = useState(false);
  const [currentSchool, setCurrentSchool] = useState(school);
  const [showQR, setShowQR] = useState(false);

  const accent = currentSchool?.color || '#ff6b1a';
  const accentRgb = currentSchool?.color_rgb || currentSchool?.colorRgb || '255,107,26';

  const load = () => {
    Promise.all([
      role === 'owner'
        ? base44.entities.Order.filter({ status: 'completed' }, '-created_date', 500)
        : base44.entities.Order.filter({ school_id: school?.id, status: 'completed' }, '-created_date', 200),
      role === 'owner'
        ? base44.entities.Transaction.list('-date', 200)
        : base44.entities.Transaction.filter({ school_id: school?.id }, '-date', 100),
      base44.entities.StockItem.filter(role !== 'owner' ? { school_id: school?.id } : {}, '-created_date', 200),
      base44.entities.DailySales.list('-date', 100),
      role === 'owner' ? base44.entities.School.list('name', 20) : Promise.resolve([]),
    ]).then(([ord, txn, stk, ds, sc]) => {
      setOrders(ord || []);
      setTransactions(txn || []);
      setStockItems(stk || []);
      setDailySales(ds || []);
      setAllSchools(sc || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [school, role]);

  const deleteOrder = async (id) => {
    if (!confirm('ลบออเดอร์นี้?')) return;
    await base44.entities.Order.delete(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const exportCSV = () => {
    const headers = ['วันที่', 'สาขา', 'ยอด', 'ชำระ', 'สถานะ'];
    const rows = orders.map(o => [o.created_date?.slice(0, 10), o.school_name, o.total_amount, o.payment_method, o.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.created_date?.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalExpenses = transactions.filter(t => t.type === 'รายจ่าย').reduce((s, t) => s + (t.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const lowStock = stockItems.filter(s => s.quantity_unit < (s.reorder_point || 20));
  const monthlyTarget = currentSchool?.monthly_target || 50000;
  const orderTarget = currentSchool?.order_target || 1000;
  const chartData = buildChartData(dailySales);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: accent }} />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentSchool?.emoji || '🏪'}</span>
          <div>
            <h1 className="text-xl font-bold text-white">ยินดีต้อนรับกลับมา</h1>
            <p className="text-xs text-white/40">
              {getRoleLabel(role)} · {currentSchool?.name} · {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {role === 'owner' && (
            <button onClick={() => setShowKpiSettings(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-yellow-300 transition-all" style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)' }}>
              <Settings className="w-3.5 h-3.5" /> ตั้งเป้าหมาย
            </button>
          )}
          <button onClick={() => setShowQR(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 transition-all" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <QrCode className="w-3.5 h-3.5" /> QR จ่าย
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300">⚠️ <strong>Critical Alert:</strong> สินค้าใกล้หมด {lowStock.length} รายการ — {lowStock.map(s => s.product_name).join(', ')}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="ยอดขายวันนี้" value={`฿${todayRevenue.toLocaleString()}`} sub={`${todayOrders.length} ออเดอร์`} color={accent} icon={TrendingUp} />
        <StatCard label="ออเดอร์วันนี้" value={todayOrders.length} sub="รายการ" color="#00d4ff" icon={ShoppingCart} />
        <StatCard label="สต็อกเหลือน้อย" value={lowStock.length} sub="รายการวิกฤต" color="#e040fb" icon={Package} />
        <StatCard label="กำไรสุทธิ (P&L)" value={`฿${netProfit.toLocaleString()}`} sub={`รายรับ ฿${totalRevenue.toLocaleString()} − จ่าย ฿${totalExpenses.toLocaleString()}`} color={netProfit >= 0 ? '#4ade80' : '#f87171'} icon={Wallet} />
      </div>

      {/* Chart + KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <DailyPerformanceChart data={chartData} />
        </div>
        <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h3 className="text-white font-bold text-sm mb-1">Monthly KPI</h3>
            <p className="text-white/40 text-xs">เป้าหมาย: ฿{monthlyTarget.toLocaleString()} / {orderTarget} orders</p>
          </div>
          <KpiProgress label="เป้าหมายรายได้" current={totalRevenue} target={monthlyTarget} color={accent} />
          <KpiProgress label="เป้าหมายออเดอร์" current={orders.length} target={orderTarget} color="#00d4ff" unit="" />
          <KpiProgress label="กำไรสุทธิ" current={Math.max(0, netProfit)} target={monthlyTarget * 0.3} color="#4ade80" />
          <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/40 mb-2">P&L Real-time</p>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-white/60">รายรับ: ฿{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-white/60">รายจ่าย: ฿{totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: netProfit >= 0 ? '#4ade80' : '#f87171' }} />
              <span className="text-xs font-bold" style={{ color: netProfit >= 0 ? '#4ade80' : '#f87171' }}>กำไร: ฿{netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive School Summary (owner only) */}
      {role === 'owner' && allSchools.length > 0 && (
        <div className="mb-5">
          <SchoolSummaryTable schools={allSchools} orders={orders} />
        </div>
      )}

      {/* Recent orders table */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm">ออเดอร์ล่าสุด</h3>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-green-300 font-semibold transition-all" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            ⬇ Export CSV
          </button>
        </div>
        {orders.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">ยังไม่มีออเดอร์</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {['วันที่', 'สาขา', 'ยอด', 'ชำระ', 'สถานะ', ''].map(h => (
                    <th key={h} className="text-left py-2 pr-4 text-xs text-white/40 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 12).map((o, i) => (
                  <tr key={i} className="border-b group" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="py-2.5 pr-4 text-xs text-white/70">{o.created_date?.slice(0, 10)}</td>
                    <td className="py-2.5 pr-4 text-xs text-white/70">{o.school_name || '-'}</td>
                    <td className="py-2.5 pr-4 text-xs font-semibold" style={{ color: accent }}>฿{o.total_amount?.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-xs text-white/50">{o.payment_method}</td>
                    <td className="py-2.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>สำเร็จ</span>
                    </td>
                    <td className="py-2.5">
                      {(role === 'owner' || role === 'admin') && (
                        <button onClick={() => deleteOrder(o.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5 text-red-400/60" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KPI Settings Modal */}
      {showKpiSettings && currentSchool && (
        <KpiSettingsModal
          school={currentSchool}
          onClose={() => setShowKpiSettings(false)}
          onSaved={(data) => setCurrentSchool(prev => ({ ...prev, ...data }))}
        />
      )}

      {/* QR Payment Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-6 w-full max-w-xs text-center" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold flex items-center gap-2"><QrCode className="w-4 h-4" /> QR PromptPay</h2>
              <button onClick={() => setShowQR(false)}><X className="w-5 h-5 text-white/40" /></button>
            </div>
            <div className="p-4 bg-white rounded-xl mb-3 mx-auto w-48 h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">📱</div>
                {currentSchool?.promptpay_number ? (
                  <>
                    <p className="text-xs text-gray-600 font-bold">PromptPay</p>
                    <p className="text-sm text-gray-800 font-extrabold mt-1">{currentSchool.promptpay_number}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{currentSchool?.name}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 font-medium">{currentSchool?.name}</p>
                    <p className="text-[10px] text-orange-400 mt-2">⚠️ ยังไม่ได้ตั้งค่าเลขพร้อมเพย์</p>
                    <p className="text-[9px] text-gray-400 mt-1">ไปที่ จัดการโรงเรียน → แก้ไข</p>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-white/40">{currentSchool?.name}</p>
            {currentSchool?.promptpay_number && <p className="text-sm font-bold text-cyan-300 mt-1">{currentSchool.promptpay_number}</p>}
            <p className="text-[11px] text-white/25 mt-1">สแกนเพื่อชำระเงิน · ยอดเข้าสาขาโดยตรง</p>
          </div>
        </div>
      )}
    </div>
  );
}