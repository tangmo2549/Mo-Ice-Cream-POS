import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Package, Plus, Pencil, X, AlertTriangle, Bell } from 'lucide-react';

const LINE_TOKEN_KEY = 'line_notify_token';
const EMPTY_STOCK = { school_id: '', school_name: '', product_id: '', product_name: '', quantity_box: 0, quantity_unit: 0, reorder_point: 20, audit_note: '' };

async function sendLowStockAlert(lowItems, school) {
  const token = localStorage.getItem(LINE_TOKEN_KEY);
  if (!token || !lowItems.length) return;
  const items = lowItems.map(s => `  ⚠️ ${s.product_name}: เหลือ ${s.quantity_unit} (จุดสั่งซื้อ ${s.reorder_point})`).join('\n');
  const msg = `\n🚨 CRITICAL ALERT — ${school?.name || ''}\nสินค้าใกล้หมด ${lowItems.length} รายการ:\n${items}\n\nกรุณาสั่งเพิ่มทันที!`;
  try {
    await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `message=${encodeURIComponent(msg)}`,
    });
  } catch { }
}

export default function StockPage() {
  const { school, role } = useOutletContext();
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const accent = school?.color || '#ff6b1a';

  const load = async () => {
    const filter = role !== 'owner' ? { school_id: school?.id } : {};
    const [s, p, sc] = await Promise.all([
      base44.entities.StockItem.filter(filter, 'product_name', 200),
      base44.entities.Product.list('name', 100),
      base44.entities.School.list('name', 20),
    ]);
    setStocks(s || []);
    setProducts(p || []);
    setSchools(sc || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const data = { ...form, last_audit_date: new Date().toISOString().split('T')[0] };
    if (form.id) await base44.entities.StockItem.update(form.id, data);
    else await base44.entities.StockItem.create(data);
    setSaving(false);
    setForm(null);
    load();
  };

  const openNew = () => {
    setForm({ ...EMPTY_STOCK, school_id: school?.id || '', school_name: school?.name || '' });
  };

  const handleSendAlert = async () => {
    await sendLowStockAlert(lowStocks, school);
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };

  const lowStocks = stocks.filter(s => s.quantity_unit < (s.reorder_point || 20));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5" style={{ color: accent }} /> สต็อกสินค้า
        </h1>
        <div className="flex flex-wrap gap-2">
          {lowStocks.length > 0 && (
            <button onClick={handleSendAlert} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap" style={{ background: alertSent ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.12)', border: alertSent ? '1px solid #4ade80' : '1px solid rgba(239,68,68,0.4)', color: alertSent ? '#4ade80' : '#f87171' }}>
              <Bell className="w-3.5 h-3.5 shrink-0" /> {alertSent ? '✓ ส่งแล้ว' : `LINE (${lowStocks.length})`}
            </button>
          )}
          {(role === 'owner' || role === 'admin') && (
            <button onClick={openNew} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap" style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}>
              <Plus className="w-3.5 h-3.5 shrink-0" /> รับสินค้าเข้า
            </button>
          )}
        </div>
      </div>

      {lowStocks.length > 0 && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <div>
            <p className="text-xs text-red-300 font-semibold">🚨 Critical Alert — สินค้าใกล้หมด {lowStocks.length} รายการ</p>
            <p className="text-[11px] text-red-400/70 mt-0.5">{lowStocks.map(s => s.product_name).join(' · ')}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['สินค้า', 'สาขา', 'กล่อง/ลัง (คลัง)', 'แท่ง/ถ้วย (ตู้แช่)', 'จุดสั่งซื้อ', 'สถานะ', 'ตรวจนับล่าสุด', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stocks.map(s => {
              const low = s.quantity_unit < (s.reorder_point || 20);
              return (
                <tr key={s.id} className="border-t hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3 text-sm text-white">{s.product_name || '-'}</td>
                  <td className="px-4 py-3 text-xs text-white/60">{s.school_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-white/80">{s.quantity_box}</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: low ? '#f87171' : '#4ade80' }}>{s.quantity_unit}</td>
                  <td className="px-4 py-3 text-xs text-white/40">{s.reorder_point}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: low ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.12)', color: low ? '#f87171' : '#4ade80' }}>
                      {low ? '⚠️ ใกล้หมด' : '✓ ปกติ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/30">{s.last_audit_date || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setForm(s)} className="p-1.5 rounded-lg hover:bg-white/10"><Pencil className="w-3.5 h-3.5 text-white/40" /></button>
                  </td>
                </tr>
              );
            })}
            {stocks.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-white/30 text-sm">ยังไม่มีข้อมูลสต็อก</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)' }}>
            <div className="flex justify-between mb-5">
              <h2 className="text-white font-bold">{form.id ? 'แก้ไขสต็อก' : 'รับสินค้าเข้า'}</h2>
              <button onClick={() => setForm(null)}><X className="w-5 h-5 text-white/40" /></button>
            </div>
            <div className="space-y-3">
              {!form.id && (
                <>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">สินค้า</label>
                    <select value={form.product_id} onChange={e => { const p = products.find(p => p.id === e.target.value); setForm(prev => ({ ...prev, product_id: e.target.value, product_name: p?.name || '' })); }} className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none" style={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                      <option value="" style={{ background: '#0d1626' }}>-- เลือกสินค้า --</option>
                      {products.map(p => <option key={p.id} value={p.id} style={{ background: '#0d1626' }}>{p.name}</option>)}
                    </select>
                  </div>
                  {role === 'owner' && (
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">สาขา</label>
                      <select value={form.school_id} onChange={e => { const sc = schools.find(s => s.id === e.target.value); setForm(prev => ({ ...prev, school_id: e.target.value, school_name: sc?.name || '' })); }} className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none" style={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                        <option value="" style={{ background: '#0d1626' }}>-- เลือกสาขา --</option>
                        {schools.map(s => <option key={s.id} value={s.id} style={{ background: '#0d1626' }}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}
              {[['quantity_box', 'จำนวน กล่อง/ลัง (คลัง)'], ['quantity_unit', 'จำนวน แท่ง/ถ้วย (ตู้แช่)'], ['reorder_point', 'จุดสั่งซื้อขั้นต่ำ']].map(([k, label]) => (
                <div key={k}>
                  <label className="text-xs text-white/50 mb-1 block">{label}</label>
                  <input type="number" value={form[k] || 0} onChange={e => setForm(p => ({ ...p, [k]: +e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
                </div>
              ))}
              <div>
                <label className="text-xs text-white/50 mb-1 block">หมายเหตุการตรวจนับ</label>
                <input value={form.audit_note || ''} onChange={e => setForm(p => ({ ...p, audit_note: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setForm(null)} className="flex-1 py-2.5 rounded-xl text-xs text-white/50" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ยกเลิก</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}>
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}