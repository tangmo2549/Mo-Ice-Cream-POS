import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Shield, Trash2, Download } from 'lucide-react';

const ACTION_LABEL = {
  login: '🔑 เข้าสู่ระบบ',
  logout: '🚪 ออกจากระบบ',
  create_order: '🛒 สร้างออเดอร์',
  delete_order: '🗑️ ลบออเดอร์',
  edit_stock: '📦 แก้ไขสต็อก',
  edit_product: '✏️ แก้ไขสินค้า',
};
const ACTION_COLOR = {
  login: '#4ade80', logout: '#facc15', create_order: '#00d4ff',
  delete_order: '#f87171', edit_stock: '#e040fb', edit_product: '#ff6b1a',
};

export default function AuditPage() {
  const { school, role } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ทั้งหมด');
  const accent = school?.color || '#ff6b1a';

  const load = async () => {
    const query = role !== 'owner' ? { school_id: school?.id } : {};
    const data = await base44.entities.AuditLog.filter(query, '-created_date', 200);
    setLogs(data || []);
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm('ลบ log นี้?')) return;
    await base44.entities.AuditLog.delete(id);
    load();
  };

  const exportCSV = () => {
    const headers = ['วันที่', 'เวลา', 'สาขา', 'บทบาท', 'การกระทำ', 'รายละเอียด', 'ยอด'];
    const rows = logs.map(l => [
      l.created_date?.slice(0, 10), l.created_date?.slice(11, 16),
      l.school_name, l.role, ACTION_LABEL[l.action] || l.action, l.detail, l.amount || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  const actions = ['ทั้งหมด', ...Object.keys(ACTION_LABEL)];
  const filtered = filter === 'ทั้งหมด' ? logs : logs.filter(l => l.action === filter);

  // Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.created_date?.startsWith(todayStr));
  const orderCount = logs.filter(l => l.action === 'create_order').length;
  const deleteCount = logs.filter(l => l.action === 'delete_order').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: accent }} /> Audit Trail — ประวัติการใช้งาน
        </h1>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-green-300" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          ['กิจกรรมวันนี้', todayLogs.length, '#00d4ff'],
          ['ออเดอร์ทั้งหมด', orderCount, '#4ade80'],
          ['ออเดอร์ที่ถูกลบ', deleteCount, '#f87171'],
        ].map(([label, val, color]) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/40 mb-1">{label}</p>
            <p className="text-2xl font-extrabold" style={{ color }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {actions.map(a => (
          <button key={a} onClick={() => setFilter(a)} className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all" style={{ background: filter === a ? `rgba(${accent === '#ff6b1a' ? '255,107,26' : '0,212,255'},0.15)` : 'rgba(255,255,255,0.05)', border: filter === a ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.1)', color: filter === a ? accent : 'rgba(255,255,255,0.5)' }}>
            {a === 'ทั้งหมด' ? `ทั้งหมด (${logs.length})` : ACTION_LABEL[a]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['วันที่/เวลา', 'สาขา', 'บทบาท', 'การกระทำ', 'รายละเอียด', 'ยอดเงิน', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="border-t hover:bg-white/[0.02] group" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-2.5">
                  <p className="text-xs text-white/70">{log.created_date?.slice(0, 10)}</p>
                  <p className="text-[10px] text-white/30">{log.created_date?.slice(11, 16)}</p>
                </td>
                <td className="px-4 py-2.5 text-xs text-white/60">{log.school_name || '-'}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: log.role === 'owner' ? 'rgba(250,204,21,0.12)' : log.role === 'admin' ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.06)', color: log.role === 'owner' ? '#facc15' : log.role === 'admin' ? '#00d4ff' : '#aaa' }}>
                    {log.role || '-'}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs font-medium" style={{ color: ACTION_COLOR[log.action] || '#fff' }}>
                    {ACTION_LABEL[log.action] || log.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-white/50 max-w-xs truncate">{log.detail || '-'}</td>
                <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: accent }}>
                  {log.amount ? `฿${log.amount.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-2.5">
                  {role === 'owner' && (
                    <button onClick={() => del(log.id)} className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5 text-red-400/50" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-white/30 text-sm">ยังไม่มีประวัติ</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}