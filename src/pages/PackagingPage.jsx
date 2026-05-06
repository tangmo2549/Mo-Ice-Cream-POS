import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Package, Plus, Pencil, Trash2, X, Bell, AlertTriangle } from 'lucide-react';

const LINE_TOKEN_KEY = 'line_notify_token';
const TYPES = ['โคนไอติม', 'ถ้วยไอศกรีม', 'ถุง', 'อื่นๆ'];
const TYPE_EMOJI = { 'โคนไอติม': '🍦', 'ถ้วยไอศกรีม': '🥤', 'ถุง': '🛍️', 'อื่นๆ': '📦' };
const EMPTY = { school_id: '', school_name: '', type: 'โคนไอติม', name: '', quantity_box: 0, quantity_unit: 0, reorder_point: 50, cost_per_unit: 0, note: '' };

async function sendLineAlert(lowItems, school) {
  const token = localStorage.getItem(LINE_TOKEN_KEY);
  if (!token || !lowItems.length) return;
  const items = lowItems.map(i => `  ⚠️ ${TYPE_EMOJI[i.type]} ${i.name}: เหลือ ${i.quantity_unit} ชิ้น`).join('\n');
  const msg = `\n📦 Packaging Alert — ${school?.name || ''}\nบรรจุภัณฑ์ใกล้หมด ${lowItems.length} รายการ:\n${items}\n\nกรุณาสั่งเพิ่มทันที!`;
  try {
    await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `message=${encodeURIComponent(msg)}`,
    });
  } catch { }
}

export default function PackagingPage() {
  const { school, role } = useOutletContext();
  const [items, setItems] = useState([]);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [filterType, setFilterType] = useState('ทั้งหมด');
  const accent = school?.color || '#ff6b1a';

  const load = async () => {
    const filter = role !== 'owner' ? { school_id: school?.id } : {};
    const [data, sc] = await Promise.all([
      base44.entities.PackagingItem.filter(filter, 'name', 200),
      base44.entities.School.list('name', 20),
    ]);
    setItems(data || []);
    setSchools(sc || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const data = { ...form, last_audit_date: new Date().toISOString().split('T')[0] };
    if (form.id) await base44.entities.PackagingItem.update(form.id, data);
    else await base44.entities.PackagingItem.create(data);
    setSaving(false);
    setForm(null);
    load();
  };

  const del = async (id) => {
    if (!confirm('ลบรายการนี้?')) return;
    await base44.entities.PackagingItem.delete(id);
    load();
  };

  const lowItems = items.filter(i => i.quantity_unit < (i.reorder_point || 50));
  const filtered = filterType === 'ทั้งหมด' ? items : items.filter(i => i.type === filterType);
  const totalCost = items.reduce((s, i) => s + (i.quantity_unit * i.cost_per_unit || 0), 0);

  const handleAlert = async () => {
    await sendLineAlert(lowItems, school);
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5" style={{ color: accent }} /> บรรจุภัณฑ์ (Packaging Control)
        </h1>
        <div className="flex flex-wrap gap-2">
          {lowItems.length > 0 && (
            <button onClick={handleAlert} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap" style={{ background: alertSent ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.12)', border: alertSent ? '1px solid #4ade80' : '1px solid rgba(239,68,68,0.4)', color: alertSent ? '#4ade80' : '#f87171' }}>
              <Bell className="w-3.5 h-3.5 shrink-0" /> {alertSent ? '✓ แจ้งแล้ว' : `LINE (${lowItems.length})`}
            </button>
          )}
          {role !== 'staff' && (
            <button onClick={() => setForm({ ...EMPTY, school_id: school?.id || '', school_name: school?.name || '' })} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap" style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}>
              <Plus className="w-3.5 h-3.5 shrink-0" /> เพิ่มบรรจุภัณฑ์
            </button>
          )}
        </div>
      </div>

      {lowItems.length > 0 && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300">⚠️ บรรจุภัณฑ์ใกล้หมด {lowItems.length} รายการ: {lowItems.map(i => i.name).join(', ')}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {['ทั้งหมด', ...TYPES].map(t => {
          const count = t === 'ทั้งหมด' ? items.length : items.filter(i => i.type === t).length;
          const emoji = t === 'ทั้งหมด' ? '📦' : TYPE_EMOJI[t];
          return (
            <button key={t} onClick={() => setFilterType(t)} className="rounded-xl p-3 text-left transition-all" style={{ background: filterType === t ? `rgba(${accent === '#ff6b1a' ? '255,107,26' : '0,212,255'},0.15)` : 'rgba(255,255,255,0.04)', border: filterType === t ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-lg mb-1">{emoji}</p>
              <p className="text-[11px] text-white/50">{t}</p>
              <p className="text-lg font-bold text-white">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Cost summary */}
      <div className="mb-5 p-4 rounded-2xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs text-white/50">มูลค่าบรรจุภัณฑ์คงเหลือทั้งหมด (ต้นทุน)</p>
        <p className="text-xl font-extrabold" style={{ color: accent }}>฿{totalCost.toLocaleString()}</p>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['ประเภท', 'ชื่อ', 'สาขา', 'กล่อง/แพ็ค', 'จำนวน (ชิ้น)', 'จุดสั่ง', 'ต้นทุน/ชิ้น', 'มูลค่า', 'สถานะ', ''].map(h => (
                <th key={h} className="text-left px-3 py-3 text-xs text-white/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const low = item.quantity_unit < (item.reorder_point || 50);
              return (
                <tr key={item.id} className="border-t hover:bg-white/[0.02] group" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <td className="px-3 py-3 text-sm">{TYPE_EMOJI[item.type]} {item.type}</td>
                  <td className="px-3 py-3 text-sm text-white font-medium">{item.name}</td>
                  <td className="px-3 py-3 text-xs text-white/50">{item.school_name || '-'}</td>
                  <td className="px-3 py-3 text-sm text-white/70">{item.quantity_box}</td>
                  <td className="px-3 py-3 text-sm font-semibold" style={{ color: low ? '#f87171' : '#4ade80' }}>{item.quantity_unit}</td>
                  <td className="px-3 py-3 text-xs text-white/40">{item.reorder_point}</td>
                  <td className="px-3 py-3 text-xs text-white/50">฿{item.cost_per_unit}</td>
                  <td className="px-3 py-3 text-xs font-semibold" style={{ color: accent }}>฿{(item.quantity_unit * item.cost_per_unit).toLocaleString()}</td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: low ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.12)', color: low ? '#f87171' : '#4ade80' }}>
                      {low ? '⚠️ ใกล้หมด' : '✓ ปกติ'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {role !== 'staff' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => setForm(item)} className="p-1.5 rounded hover:bg-white/10"><Pencil className="w-3.5 h-3.5 text-white/40" /></button>
                        <button onClick={() => del(item.id)} className="p-1.5 rounded hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-red-400/50" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={10} className="text-center py-10 text-white/30 text-sm">ยังไม่มีข้อมูล</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl w-full max-w-sm flex flex-col" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)', maxHeight: '90vh' }}>
            <div className="flex justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <h2 className="text-white font-bold">{form.id ? 'แก้ไขบรรจุภัณฑ์' : 'เพิ่มบรรจุภัณฑ์'}</h2>
              <button onClick={() => setForm(null)}><X className="w-5 h-5 text-white/40" /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">ประเภท</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none" style={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                  {TYPES.map(t => <option key={t} value={t} style={{ background: '#0d1626' }}>{TYPE_EMOJI[t]} {t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">ชื่อ</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="เช่น โคนเล็ก, ถ้วย 8oz" className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
              {role === 'owner' && (
                <div>
                  <label className="text-xs text-white/50 mb-1 block">สาขา</label>
                  <select value={form.school_id} onChange={e => { const s = schools.find(s => s.id === e.target.value); setForm(p => ({ ...p, school_id: e.target.value, school_name: s?.name || '' })); }} className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none" style={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                    <option value="" style={{ background: '#0d1626' }}>-- เลือกสาขา --</option>
                    {schools.map(s => <option key={s.id} value={s.id} style={{ background: '#0d1626' }}>{s.name}</option>)}
                  </select>
                </div>
              )}
              {[['quantity_box', 'จำนวน กล่อง/แพ็ค'], ['quantity_unit', 'จำนวน ชิ้น'], ['reorder_point', 'จุดสั่งซื้อขั้นต่ำ (ชิ้น)'], ['cost_per_unit', 'ต้นทุนต่อชิ้น (฿)']].map(([k, label]) => (
                <div key={k}>
                  <label className="text-xs text-white/50 mb-1 block">{label}</label>
                  <input type="number" value={form[k] || 0} onChange={e => setForm(p => ({ ...p, [k]: +e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
                </div>
              ))}
              <div>
                <label className="text-xs text-white/50 mb-1 block">หมายเหตุ</label>
                <input value={form.note || ''} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button onClick={() => setForm(null)} className="flex-1 py-2.5 rounded-xl text-xs text-white/50" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ยกเลิก</button>
              <button onClick={save} disabled={saving || !form.name} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}>
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}