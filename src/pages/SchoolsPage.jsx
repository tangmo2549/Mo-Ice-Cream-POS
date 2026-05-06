import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { School, Plus, Pencil, Trash2, X } from 'lucide-react';

const EMPTY = { name: '', branch: '', location: '', emoji: '🏫', color: '#ff6b1a', color_rgb: '255,107,26', gradient: 'linear-gradient(135deg, #ff6b1a, #e84d00)', is_active: true, monthly_target: 50000, order_target: 1000, promptpay_number: '', address: '', phone: '' };

export default function SchoolsPage() {
  const { school: currentSchool } = useOutletContext();
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const accent = currentSchool?.color || '#ff6b1a';

  const load = () => base44.entities.School.list('name', 50).then(setSchools);
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    if (form.id) await base44.entities.School.update(form.id, form);
    else await base44.entities.School.create(form);
    setSaving(false);
    setForm(null);
    load();
  };

  const del = async (id) => {
    if (!confirm('ลบโรงเรียนนี้?')) return;
    await base44.entities.School.delete(id);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <School className="w-5 h-5" style={{ color: accent }} /> จัดการโรงเรียน/สาขา
        </h1>
        <button onClick={() => setForm({ ...EMPTY })} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}>
          <Plus className="w-3.5 h-3.5" /> เพิ่มโรงเรียน
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools.map(s => (
          <div key={s.id} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: `1.5px solid rgba(255,255,255,0.09)` }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${s.color || '#ff6b1a'}18` }}>
                {s.emoji || '🏫'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{s.name}</p>
                <p className="text-xs text-white/40">{s.branch}</p>
                <p className="text-xs text-white/30">{s.location}</p>
              </div>
            </div>
            <div className="flex justify-between text-xs text-white/40 mb-3">
              <span>เป้าหมาย ฿{(s.monthly_target || 50000).toLocaleString()}/เดือน</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-green-400' : 'bg-white/20'}`} />
                {s.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setForm(s)} className="flex-1 py-1.5 rounded-lg text-xs text-white/60 hover:bg-white/5 flex items-center justify-center gap-1" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <Pencil className="w-3 h-3" /> แก้ไข
              </button>
              <button onClick={() => del(s.id)} className="py-1.5 px-3 rounded-lg text-xs text-red-400/60 hover:bg-red-500/10" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 w-full max-w-md my-4" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)' }}>
            <div className="flex justify-between mb-5">
              <h2 className="text-white font-bold">{form.id ? 'แก้ไขโรงเรียน' : 'เพิ่มโรงเรียนใหม่'}</h2>
              <button onClick={() => setForm(null)}><X className="w-5 h-5 text-white/40" /></button>
            </div>
            <div className="space-y-3">
              {[['name','ชื่อโรงเรียน'],['branch','ชื่อสาขา'],['location','จังหวัด/ที่ตั้ง'],['emoji','Emoji สัญลักษณ์'],['color','สีธีม (hex เช่น #ff6b1a)'],['color_rgb','สี RGB (เช่น 255,107,26)']].map(([k,label]) => (
                <div key={k}>
                  <label className="text-xs text-white/50 mb-1 block">{label}</label>
                  <input value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
                </div>
              ))}
              {[['promptpay_number','เลขพร้อมเพย์ (เบอร์มือถือ/เลขบัตร)'],['phone','เบอร์โทรศัพท์'],['address','ที่อยู่สาขา']].map(([k,label]) => (
                <div key={k}>
                  <label className="text-xs text-white/50 mb-1 block">{label}</label>
                  <input value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
                </div>
              ))}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-white/50 mb-1 block">เป้าหมายรายได้/เดือน</label>
                  <input type="number" value={form.monthly_target || 50000} onChange={e => setForm(p => ({ ...p, monthly_target: +e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/50 mb-1 block">เป้าหมายออเดอร์/เดือน</label>
                  <input type="number" value={form.order_target || 1000} onChange={e => setForm(p => ({ ...p, order_target: +e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <span className="text-xs text-white/60">เปิดใช้งาน</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
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