import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { BarChart3, Plus, X, Download, FileText } from 'lucide-react';
import DailyPerformanceChart from "@/components/dashboard/DailyPerformanceChart.jsx";

const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
const EMPTY_DS = { school_id: '', school_name: '', date: new Date().toISOString().split('T')[0], day_of_week: '', total_revenue: 0, total_orders: 0, is_submitted: false };

export default function ReportsPage() {
  const { school, role } = useOutletContext();
  const [dailySales, setDailySales] = useState([]);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const accent = school?.color || '#ff6b1a';

  const load = async () => {
    const [ds, sc] = await Promise.all([
      base44.entities.DailySales.list('-date', 100),
      base44.entities.School.list('name', 20),
    ]);
    setDailySales(ds || []);
    setSchools(sc || []);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const save = async () => {
    setSaving(true);
    if (form.id) await base44.entities.DailySales.update(form.id, form);
    else await base44.entities.DailySales.create(form);
    setSaving(false);
    setForm(null);
    load();
  };

  function buildChartData(ds) {
    return DAYS.map(day => {
      const entry = { day };
      ['วัดดอนไก่ดี', 'วัดท่าพูด', 'พระตำหนักฯ'].forEach(schoolName => {
        const found = ds.find(d => d.day_of_week === day && d.school_name && d.school_name.includes(schoolName.replace('ฯ', '')));
        entry[schoolName] = found && found.is_submitted ? (found.total_revenue || 0) : 0;
      });
      return entry;
    });
  }

  const exportCSV = () => {
    const headers = ['วันที่', 'วัน', 'สาขา', 'รายได้', 'ออเดอร์', 'สถานะ'];
    const rows = dailySales.map(d => [d.date, d.day_of_week, d.school_name, d.total_revenue, d.total_orders, d.is_submitted ? 'บันทึกแล้ว' : 'รอบันทึก']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_sales_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
  };

  const printReport = () => {
    const totalRevenue = dailySales.filter(d => d.is_submitted).reduce((s, d) => s + (d.total_revenue || 0), 0);
    const totalOrders = dailySales.filter(d => d.is_submitted).reduce((s, d) => s + (d.total_orders || 0), 0);
    const win = window.open('', '_blank', 'width=700,height=800');
    win.document.write(
      '<html><head><title>รายงานยอดขาย</title>' +
      '<style>body{font-family:sans-serif;padding:24px;font-size:13px}h1{font-size:18px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0f0f0}.total{font-weight:bold;font-size:15px}</style></head>' +
      '<body>' +
      '<h1>🍦 MO ICE CREAM — รายงานยอดขายรายวัน</h1>' +
      '<p>พิมพ์: ' + new Date().toLocaleDateString('th-TH') + ' | ทั้งหมด ' + dailySales.length + ' วัน</p>' +
      '<hr/>' +
      '<table>' +
      '<thead><tr><th>วันที่</th><th>วัน</th><th>สาขา</th><th>รายได้</th><th>ออเดอร์</th><th>สถานะ</th></tr></thead>' +
      '<tbody>' +
      dailySales.map(d => '<tr><td>' + d.date + '</td><td>' + d.day_of_week + '</td><td>' + d.school_name + '</td><td>฿' + (d.total_revenue ? d.total_revenue.toLocaleString() : 0) + '</td><td>' + d.total_orders + '</td><td>' + (d.is_submitted ? '✓ บันทึกแล้ว' : '⏳ รอ') + '</td></tr>').join('') +
      '</tbody>' +
      '</table>' +
      '<br/><div class="total">รวมรายได้ทั้งหมด: ฿' + totalRevenue.toLocaleString() + ' | รวม ' + totalOrders + ' ออเดอร์</div>' +
      '</body></html>'
    );
    win.document.close();
    win.print();
    win.close();
  };

  const chartData = buildChartData(dailySales);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: accent }} /> รายงานยอดขาย
        </h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-green-300 whitespace-nowrap" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <Download className="w-3.5 h-3.5 shrink-0" /> CSV
          </button>
          <button onClick={printReport} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 whitespace-nowrap" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <FileText className="w-3.5 h-3.5 shrink-0" /> PDF
          </button>
          <button
            onClick={() => setForm({ ...EMPTY_DS, school_id: school ? school.id : '', school_name: school ? school.name : '' })}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, ' + accent + ', rgba(255,107,26,0.7))' }}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" /> บันทึกยอดขาย
          </button>
        </div>
      </div>

      <div className="mb-6">
        <DailyPerformanceChart data={chartData} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          ['รายได้รวม (บันทึกแล้ว)', '฿' + dailySales.filter(d => d.is_submitted).reduce((s, d) => s + (d.total_revenue || 0), 0).toLocaleString(), '#4ade80'],
          ['ออเดอร์รวม', dailySales.filter(d => d.is_submitted).reduce((s, d) => s + (d.total_orders || 0), 0).toLocaleString() + ' รายการ', '#00d4ff'],
          ['วันที่บันทึก', dailySales.filter(d => d.is_submitted).length + ' วัน', '#facc15'],
        ].map(function(item) {
          const label = item[0];
          const val = item[1];
          const color = item[2];
          return (
            <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-white/40 mb-1">{label}</p>
              <p className="text-lg font-bold" style={{ color: color }}>{val}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['วันที่', 'วัน', 'สาขา', 'รายได้', 'ออเดอร์', 'สถานะ', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dailySales.map(d => (
              <tr key={d.id} className="border-t hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-3 text-xs text-white/60">{d.date}</td>
                <td className="px-4 py-3 text-xs text-white/60">{d.day_of_week}</td>
                <td className="px-4 py-3 text-xs text-white/70">{d.school_name}</td>
                <td className="px-4 py-3 text-sm font-bold" style={{ color: accent }}>฿{d.total_revenue ? d.total_revenue.toLocaleString() : 0}</td>
                <td className="px-4 py-3 text-xs text-white/60">{d.total_orders} รายการ</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: d.is_submitted ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', color: d.is_submitted ? '#4ade80' : '#f87171' }}>
                    {d.is_submitted ? '✓ บันทึกแล้ว' : '⏳ รอบันทึก'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setForm(d)} className="text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded-lg hover:bg-white/5">แก้ไข</button>
                </td>
              </tr>
            ))}
            {dailySales.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-white/30 text-sm">ยังไม่มีข้อมูล</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)' }}>
            <div className="flex justify-between mb-5">
              <h2 className="text-white font-bold">บันทึกยอดขายรายวัน</h2>
              <button onClick={() => setForm(null)}><X className="w-5 h-5 text-white/40" /></button>
            </div>
            <div className="space-y-3">
              {role === 'owner' && (
                <div>
                  <label className="text-xs text-white/50 mb-1 block">สาขา</label>
                  <select
                    value={form.school_id}
                    onChange={e => {
                      const s = schools.find(s => s.id === e.target.value);
                      setForm(p => ({ ...p, school_id: e.target.value, school_name: s ? s.name : '' }));
                    }}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
                    style={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option value="" style={{ background: '#0d1626' }}>-- เลือกสาขา --</option>
                    {schools.map(s => <option key={s.id} value={s.id} style={{ background: '#0d1626' }}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-white/50 mb-1 block">วันที่</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">วัน (ภาษาไทย)</label>
                <select
                  value={form.day_of_week}
                  onChange={e => setForm(p => ({ ...p, day_of_week: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
                  style={{ background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                >
                  <option value="" style={{ background: '#0d1626' }}>-- เลือกวัน --</option>
                  {DAYS.map(d => <option key={d} value={d} style={{ background: '#0d1626' }}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">ยอดรายได้รวม (฿)</label>
                <input type="number" value={form.total_revenue} onChange={e => setForm(p => ({ ...p, total_revenue: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">จำนวนออเดอร์</label>
                <input type="number" value={form.total_orders} onChange={e => setForm(p => ({ ...p, total_orders: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_submitted} onChange={e => setForm(p => ({ ...p, is_submitted: e.target.checked }))} />
                <span className="text-xs text-white/60">บันทึกยอดแล้ว (ก่อน 20:00 น.)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setForm(null)} className="flex-1 py-2.5 rounded-xl text-xs text-white/50" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ยกเลิก</button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, ' + accent + ', rgba(255,107,26,0.7))' }}
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}