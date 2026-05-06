import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Users, Plus, Pencil, Trash2, X, Eye, EyeOff, Shield, Crown, UserCheck, Activity } from 'lucide-react';

const EMPTY_PIN = { school_id: '', school_name: '', role: 'staff', pin: '', is_active: true };

const ROLE_META = {
  owner: { label: 'เจ้าของร้าน', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '👑', desc: 'คุมระบบ 100%', access: ['pos', 'sales', 'active', 'stock', 'finance', 'reports', 'franchises', 'users'] },
  admin: { label: 'ผู้ดูแล (Admin)', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '🛡️', desc: 'คุมสต็อก + ยอดขาย', access: ['pos', 'sales', 'active', 'stock'] },
  staff: { label: 'พนักงาน (Staff)', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: '👦', desc: 'บันทึกออเดอร์ POS', access: ['pos'] },
};

const ROLE_MATRIX = [
  { role: 'owner', access: 'คุมระบบ 100%, คอนออเดอร์ เข้าถึงผู้ดู แลยกเว้น POS-รายงาน กำไร-ขาดทุน', resp: 'บริหารผลกำไรสินค้าและเครื่องดื่มในโรงเรียน' },
  { role: 'admin', access: 'คุมสต็อกสาขาที่ดูแล, สรุปออเดอร์รายวัน, ตรวจสอบบทบาท Staff', resp: 'จัดการพื้นที่และปฏิบัติกิจกรรมรายวัน' },
  { role: 'staff', access: 'บันทึกออเดอร์ POS, เช็กสต็อกหน้าร้าน (ถูกล็อกสิทธิ์แก้ไขข้อมูล)', resp: 'งานบริการและการบันทึกข้อมูลหน้าร้าน', icon: '👦' },
];

export default function UsersPage() {
  const { school: currentSchool } = useOutletContext();
  const [pins, setPins] = useState([]);
  const [schools, setSchools] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [form, setForm] = useState(null);
  const [showPin, setShowPin] = useState({});
  const [saving, setSaving] = useState(false);
  const accent = currentSchool?.color || '#10b981';

  const load = async () => {
    const [p, s, al] = await Promise.all([
      base44.entities.PinCode.list('-created_date', 100),
      base44.entities.School.list('name', 20),
      base44.entities.AuditLog.list('-created_date', 30),
    ]);
    setPins(p || []);
    setSchools(s || []);
    setAuditLogs(al || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (form.pin.length !== 4 || !/^\d+$/.test(form.pin)) {
      alert('PIN ต้องเป็นตัวเลข 4 หลัก');
      return;
    }
    setSaving(true);
    if (form.id) await base44.entities.PinCode.update(form.id, form);
    else await base44.entities.PinCode.create(form);
    setSaving(false);
    setForm(null);
    load();
  };

  const del = async (id) => {
    if (!confirm('ลบ PIN นี้?')) return;
    await base44.entities.PinCode.delete(id);
    load();
  };

  const countByRole = (r) => pins.filter(p => p.role === r).length;

  const ACTION_LABELS = {
    login: 'Login', logout: 'Logout', create_order: 'บันทึกออเดอร์',
    delete_order: 'ลบออเดอร์', edit_stock: 'แก้ไขสต็อก', edit_product: 'แก้ไขสินค้า',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: '#10b981' }} />
            จัดการผู้ใช้งาน & Audit Trail
          </h1>
          <p className="text-xs text-white/35 mt-0.5">Advanced Role Management · Work History</p>
        </div>
        <button
          onClick={() => setForm({ ...EMPTY_PIN, school_id: currentSchool?.id || '', school_name: currentSchool?.name || '' })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่ม PIN ใหม่
        </button>
      </div>

      {/* Section 1: Status Cards */}
      <div className="grid grid-cols-3 gap-4">
        {(['owner', 'admin', 'staff']).map(r => {
          const meta = ROLE_META[r];
          const count = countByRole(r);
          return (
            <div key={r} className="rounded-2xl p-4" style={{ background: meta.bg, border: `1px solid ${meta.color}30` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{meta.icon}</span>
                <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
              </div>
              <p className="text-3xl font-extrabold text-white mb-2">{count}</p>
              <div className="space-y-0.5">
                {meta.access.map(a => (
                  <p key={a} className="text-[10px] text-white/40">• {a}</p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 2: Role Matrix */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-bold text-white">Advanced Role Management Matrix</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['บทบาท', 'สิทธิ์การเข้าถึง', 'ความรับผิดชอบ'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-white/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLE_MATRIX.map(row => {
              const meta = ROLE_META[row.role];
              return (
                <tr key={row.role} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span>{meta.icon}</span>
                      <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-white/55 max-w-xs">{row.access}</td>
                  <td className="px-5 py-3.5 text-xs text-white/55">{row.resp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 3: User List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b flex justify-between items-center" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-bold text-white">รายชื่อผู้ใช้งาน</h3>
          <span className="text-xs text-white/30">{pins.length} คน</span>
        </div>
        {pins.length === 0 ? (
          <p className="text-center py-8 text-white/30 text-sm">ยังไม่มี PIN กรุณาเพิ่ม</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {pins.map(p => {
              const meta = ROLE_META[p.role] || ROLE_META.staff;
              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02]">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0" style={{ background: meta.bg }}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{p.school_name || '-'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-white/35 mt-0.5">สร้าง: {p.created_date?.slice(0,10)} · PIN: {showPin[p.id] ? p.pin : '••••'}
                      <button onClick={() => setShowPin(prev => ({ ...prev, [p.id]: !prev[p.id] }))} className="ml-1 text-white/30 hover:text-white/60">
                        {showPin[p.id] ? <EyeOff className="w-3 h-3 inline" /> : <Eye className="w-3 h-3 inline" />}
                      </button>
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: p.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)', color: p.is_active ? '#10b981' : 'rgba(255,255,255,0.3)' }}>
                      {p.is_active ? '● ใช้งาน' : '● ปิด'}
                    </span>
                    <button onClick={() => setForm(p)} className="p-1.5 rounded-lg hover:bg-white/10"><Pencil className="w-3.5 h-3.5 text-white/40" /></button>
                    <button onClick={() => del(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-red-400/50" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 4: Audit Trail */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <Activity className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-bold text-white">Audit Trail — Session ปัจจุบัน</h3>
        </div>
        {auditLogs.length === 0 ? (
          <p className="text-center py-6 text-white/25 text-xs">* Audit Trail จะถูกบันทึกเมื่อมีกิจกรรม</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {auditLogs.slice(0, 15).map((log, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02]">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-white/75 font-medium">{ACTION_LABELS[log.action] || log.action}</span>
                  <span className="text-xs text-white/35 ml-2">{log.role && `บทบาท: ${log.role}`} {log.school_name && `· สาขา: ${log.school_name}`}</span>
                  {log.detail && <p className="text-[10px] text-white/30 mt-0.5 truncate">{log.detail}</p>}
                </div>
                <span className="text-[10px] text-white/25 shrink-0">{log.created_date?.slice(0, 16)?.replace('T', ' ')}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-center py-3 text-[10px] text-white/20">* Audit Trail จะถูกบันทึกเมื่อมีกิจกรรมในระบบ</p>
      </div>

      {/* Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)' }}>
            <div className="flex justify-between mb-5">
              <h2 className="text-white font-bold">{form.id ? 'แก้ไข PIN' : 'เพิ่ม PIN ใหม่'}</h2>
              <button onClick={() => setForm(null)}><X className="w-5 h-5 text-white/40" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">สาขา</label>
                <select
                  value={form.school_id}
                  onChange={e => { const s = schools.find(s => s.id === e.target.value); setForm(p => ({ ...p, school_id: e.target.value, school_name: s?.name || '' })); }}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
                  style={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                >
                  <option value="" style={{ background: '#0d1626' }}>-- เลือกสาขา --</option>
                  {schools.map(s => <option key={s.id} value={s.id} style={{ background: '#0d1626' }}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">บทบาท</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
                  style={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                >
                  <option value="owner" style={{ background: '#0d1626' }}>👑 เจ้าของร้าน (Owner)</option>
                  <option value="admin" style={{ background: '#0d1626' }}>🛡️ ผู้ดูแลระบบ (Admin)</option>
                  <option value="staff" style={{ background: '#0d1626' }}>👦 พนักงานขาย (Staff)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">รหัส PIN (4 หลัก)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={form.pin}
                  onChange={e => setForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="ตัวเลข 4 หลัก"
                  className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none tracking-widest"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <span className="text-xs text-white/60">เปิดใช้งาน</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setForm(null)} className="flex-1 py-2.5 rounded-xl text-xs text-white/50" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ยกเลิก</button>
              <button onClick={save} disabled={saving || !form.pin || !form.school_id} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}