import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CreditCard, Plus, Trash2, X } from 'lucide-react';

const EMPTY = { type: 'รายรับ', category: 'ยอดขาย', amount: '', description: '', date: new Date().toISOString().split('T')[0] };

export default function FinancePage() {
  const { school, role } = useOutletContext();
  const [txns, setTxns] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const accent = school?.color || '#ff6b1a';

  const load = async () => {
    const filter = role !== 'owner' ? { school_id: school?.id } : {};
    const data = await base44.entities.Transaction.filter(filter, '-date', 200);
    setTxns(data || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    await base44.entities.Transaction.create({ ...form, school_id: school?.id || 'default', school_name: school?.name || '', recorded_by: role });
    setSaving(false);
    setForm(null);
    load();
  };

  const del = async (id) => {
    if (!confirm('ลบรายการนี้?')) return;
    await base44.entities.Transaction.delete(id);
    load();
  };

  const income = txns.filter(t => t.type === 'รายรับ').reduce((s, t) => s + (t.amount || 0), 0);
  const expense = txns.filter(t => t.type === 'รายจ่าย').reduce((s, t) => s + (t.amount || 0), 0);
  const profit = income - expense;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5" style={{ color: accent }} /> บัญชีรายรับ-รายจ่าย
        </h1>
        <button onClick={() => setForm({ ...EMPTY })} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}>
          <Plus className="w-3.5 h-3.5" /> บันทึกรายการ
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['💚 รายรับรวม', income, '#4ade80'],['🔴 รายจ่ายรวม', expense, '#f87171'],['💰 กำไรสุทธิ', profit, profit >= 0 ? '#4ade80' : '#f87171']].map(([label, val, color]) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-white/45 mb-2">{label}</p>
            <p className="text-2xl font-extrabold" style={{ color }}>฿{val.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['วันที่', 'ประเภท', 'หมวดหมู่', 'คำอธิบาย', 'สาขา', 'จำนวน', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {txns.map(t => (
              <tr key={t.id} className="border-t hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-3 text-xs text-white/60">{t.date}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: t.type === 'รายรับ' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', color: t.type === 'รายรับ' ? '#4ade80' : '#f87171' }}>{t.type}</span>
                </td>
                <td className="px-4 py-3 text-xs text-white/60">{t.category}</td>
                <td className="px-4 py-3 text-xs text-white/70">{t.description || '-'}</td>
                <td className="px-4 py-3 text-xs text-white/40">{t.school_name || '-'}</td>
                <td className="px-4 py-3 text-sm font-bold" style={{ color: t.type === 'รายรับ' ? '#4ade80' : '#f87171' }}>
                  {t.type === 'รายรับ' ? '+' : '-'}฿{t.amount?.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => del(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-red-400/50" /></button>
                </td>
              </tr>
            ))}
            {txns.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-white/30 text-sm">ยังไม่มีรายการ</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)' }}>
            <div className="flex justify-between mb-5">
              <h2 className="text-white font-bold">บันทึกรายการ</h2>
              <button onClick={() => setForm(null)}><X className="w-5 h-5 text-white/40" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                {['รายรับ','รายจ่าย'].map(t => (
                  <button key={t} onClick={() => setForm(p => ({ ...p, type: t, category: t === 'รายรับ' ? 'ยอดขาย' : 'วัตถุดิบ' }))} className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all" style={{ background: form.type === t ? (t === 'รายรับ' ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)') : 'rgba(255,255,255,0.05)', color: form.type === t ? (t === 'รายรับ' ? '#4ade80' : '#f87171') : 'rgba(255,255,255,0.4)', border: `1px solid ${form.type === t ? (t === 'รายรับ' ? '#4ade80' : '#f87171') : 'rgba(255,255,255,0.1)'}` }}>{t}</button>
                ))}
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">หมวดหมู่</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none" style={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                  {(form.type === 'รายรับ' ? ['ยอดขาย','อื่นๆ'] : ['วัตถุดิบ','ค่าแรง','ค่าเช่า','ค่าสาธารณูปโภค','อื่นๆ']).map(v => <option key={v} value={v} style={{ background: '#0d1626' }}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">จำนวนเงิน (฿)</label>
                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: +e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">คำอธิบาย</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">วันที่</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setForm(null)} className="flex-1 py-2.5 rounded-xl text-xs text-white/50" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ยกเลิก</button>
              <button onClick={save} disabled={saving || !form.amount} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}>
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}