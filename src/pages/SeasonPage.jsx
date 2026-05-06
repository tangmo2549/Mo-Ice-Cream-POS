import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Calendar, Plus, Pencil, Trash2, X } from 'lucide-react';

const TYPES = ['เทอม 1', 'เทอม 2', 'ปิดเทอมเล็ก', 'ปิดเทอมใหญ่'];
const TYPE_COLOR = {
  'เทอม 1': '#4ade80',
  'เทอม 2': '#00d4ff',
  'ปิดเทอมเล็ก': '#facc15',
  'ปิดเทอมใหญ่': '#f87171',
};
const EMPTY = { name: '', type: 'เทอม 1', start_date: '', end_date: '', summary_date: '', note: '', is_active: true };

export default function SeasonPage() {
  const { school, role } = useOutletContext();
  const [seasons, setSeasons] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const accent = school?.color || '#ff6b1a';

  const load = async () => {
    const data = await base44.entities.AcademicSeason.list('-start_date', 50);
    setSeasons(data || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    if (form.id) await base44.entities.AcademicSeason.update(form.id, form);
    else await base44.entities.AcademicSeason.create(form);
    setSaving(false);
    setForm(null);
    load();
  };

  const del = async (id) => {
    if (!confirm('ลบช่วงเวลานี้?')) return;
    await base44.entities.AcademicSeason.delete(id);
    load();
  };

  const today = new Date().toISOString().split('T')[0];
  const currentSeason = seasons.find(s => s.start_date <= today && s.end_date >= today && s.is_active);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: accent }} /> ปฏิทินการศึกษา (Academic Seasonality)
        </h1>
        {role !== 'staff' && (
          <button onClick={() => setForm({ ...EMPTY })} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap" style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}>
            <Plus className="w-3.5 h-3.5 shrink-0" /> เพิ่มช่วงเวลา
          </button>
        )}
      </div>

      {/* Current season banner */}
      {currentSeason && (
        <div className="mb-5 p-4 rounded-2xl flex items-center gap-3" style={{ background: `rgba(${currentSeason.type === 'ปิดเทอมใหญ่' || currentSeason.type === 'ปิดเทอมเล็ก' ? '248,113,113' : '74,222,128'},0.1)`, border: `1px solid ${TYPE_COLOR[currentSeason.type]}40` }}>
          <span className="text-2xl">📅</span>
          <div>
            <p className="text-white font-bold text-sm">{currentSeason.type.includes('ปิด') ? '⚠️ ช่วงปิดเทอม' : '✅ ช่วงเปิดเทอม'}: {currentSeason.name}</p>
            <p className="text-white/50 text-xs">{currentSeason.start_date} — {currentSeason.end_date} {currentSeason.summary_date ? `| สรุปผล: ${currentSeason.summary_date}` : ''}</p>
          </div>
        </div>
      )}

      {/* Timeline view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {TYPES.map(type => {
          const items = seasons.filter(s => s.type === type);
          const color = TYPE_COLOR[type];
          return (
            <div key={type} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}30` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <h3 className="text-sm font-bold" style={{ color }}>{type}</h3>
                <span className="text-xs text-white/30">({items.length} รายการ)</span>
              </div>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-white/25 text-xs">ยังไม่มีข้อมูล</p>
                ) : items.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl group" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div>
                      <p className="text-xs text-white font-medium">{s.name}</p>
                      <p className="text-[11px] text-white/40">{s.start_date} → {s.end_date}</p>
                      {s.summary_date && <p className="text-[10px] text-yellow-400/60">สรุปผล: {s.summary_date}</p>}
                      {s.note && <p className="text-[10px] text-white/30 mt-0.5">{s.note}</p>}
                    </div>
                    {role !== 'staff' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setForm(s)} className="p-1.5 rounded-lg hover:bg-white/10"><Pencil className="w-3 h-3 text-white/40" /></button>
                        <button onClick={() => del(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-3 h-3 text-red-400/50" /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* All seasons table */}
      <div className="rounded-2xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['ชื่อ', 'ประเภท', 'เริ่ม', 'สิ้นสุด', 'สรุปผล', 'หมายเหตุ', 'สถานะ', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seasons.map(s => (
              <tr key={s.id} className="border-t hover:bg-white/[0.02] group" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-3 text-sm text-white font-medium">{s.name}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${TYPE_COLOR[s.type]}20`, color: TYPE_COLOR[s.type] }}>{s.type}</span>
                </td>
                <td className="px-4 py-3 text-xs text-white/60">{s.start_date}</td>
                <td className="px-4 py-3 text-xs text-white/60">{s.end_date}</td>
                <td className="px-4 py-3 text-xs text-yellow-400/70">{s.summary_date || '-'}</td>
                <td className="px-4 py-3 text-xs text-white/40">{s.note || '-'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: s.is_active ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)', color: s.is_active ? '#4ade80' : '#666' }}>{s.is_active ? 'ใช้งาน' : 'ปิด'}</span>
                </td>
                <td className="px-4 py-3">
                  {role !== 'staff' && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => setForm(s)} className="p-1.5 rounded hover:bg-white/10"><Pencil className="w-3.5 h-3.5 text-white/40" /></button>
                      <button onClick={() => del(s.id)} className="p-1.5 rounded hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-red-400/50" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {seasons.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-white/30 text-sm">ยังไม่มีข้อมูลปฏิทิน</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)' }}>
            <div className="flex justify-between mb-5">
              <h2 className="text-white font-bold">{form.id ? 'แก้ไขช่วงเวลา' : 'เพิ่มช่วงเวลา'}</h2>
              <button onClick={() => setForm(null)}><X className="w-5 h-5 text-white/40" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">ชื่อช่วงเวลา</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="เช่น เทอม 1/2568" className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">ประเภท</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none" style={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                  {TYPES.map(t => <option key={t} value={t} style={{ background: '#0d1626' }}>{t}</option>)}
                </select>
              </div>
              {[['start_date', 'วันเริ่มต้น'], ['end_date', 'วันสิ้นสุด'], ['summary_date', 'วันสรุปผล (ถ้ามี)']].map(([k, label]) => (
                <div key={k}>
                  <label className="text-xs text-white/50 mb-1 block">{label}</label>
                  <input type="date" value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
                </div>
              ))}
              <div>
                <label className="text-xs text-white/50 mb-1 block">หมายเหตุ</label>
                <input value={form.note || ''} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <span className="text-xs text-white/60">เปิดใช้งาน</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setForm(null)} className="flex-1 py-2.5 rounded-xl text-xs text-white/50" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ยกเลิก</button>
              <button onClick={save} disabled={saving || !form.name || !form.start_date || !form.end_date} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}>
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}