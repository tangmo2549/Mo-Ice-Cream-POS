import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Store, X, Check, Camera, ImageIcon } from 'lucide-react';

const EMPTY = { name: '', sku: '', category: 'ไอศกรีม', price: '', cost: '', unit: 'แท่ง', units_per_box: 24, reorder_point: 20, is_active: true, image_url: '', branch_ids: [], description: '' };
const SCHOOLS_DEFAULT = [
  { id: 'default1', name: 'วัดดอนไก่ดี', emoji: '🔥' },
  { id: 'default2', name: 'วัดท่าพูด', emoji: '🐬' },
  { id: 'default3', name: 'พระตำหนักฯ', emoji: '👑' },
];

export default function ProductsPage() {
  const { school, role } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [schools, setSchools] = useState(SCHOOLS_DEFAULT);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const accent = school?.color || '#ff6b1a';

  const load = () => base44.entities.Product.list('name', 100).then(setProducts);

  useEffect(() => {
    load();
    base44.entities.School.filter({ is_active: true }, 'name', 20)
      .then(data => { if (data?.length) setSchools(data); })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    if (form.id) await base44.entities.Product.update(form.id, form);
    else await base44.entities.Product.create(form);
    setSaving(false);
    setForm(null);
    load();
  };

  const del = async (id) => {
    if (!confirm('ลบสินค้านี้?')) return;
    await base44.entities.Product.delete(id);
    load();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, image_url: file_url }));
    setUploading(false);
  };

  const toggleBranch = (id) => {
    setForm(p => {
      const ids = p.branch_ids || [];
      return { ...p, branch_ids: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id] };
    });
  };

  const inputStyle = { border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' };
  const selectStyle = { background: '#0d1626', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Store className="w-5 h-5" style={{ color: accent }} /> จัดการร้านค้า / เมนูสินค้า
        </h1>
        <button
          onClick={() => setForm({ ...EMPTY })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มสินค้า
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map(p => (
          <div key={p.id} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-full" style={{ aspectRatio: '1/1', background: '#0a0d18' }}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-full" style={{ objectFit: 'contain' }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white/15" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-xs text-white/40">{p.sku ? `#${p.sku} · ` : ''}{p.category}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setForm({ ...EMPTY, ...p, branch_ids: p.branch_ids || [] })} className="p-1.5 rounded-lg hover:bg-white/10"><Pencil className="w-3.5 h-3.5 text-white/50" /></button>
                  <button onClick={() => del(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-red-400/60" /></button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-extrabold" style={{ color: accent }}>฿{p.price}</span>
                <span className="text-xs text-white/30">ต้นทุน ฿{p.cost || '-'}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-green-400' : 'bg-white/20'}`} />
                  <span className="text-xs text-white/40">{p.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'} · {p.unit}</span>
                </div>
                {p.units_per_box > 0 && (
                  <span className="text-xs text-white/30">📦 {p.units_per_box}/{p.unit}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl w-full max-w-md flex flex-col" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)', maxHeight: '90vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <h2 className="text-white font-bold">{form.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
              <div className="flex items-center gap-3">
                {/* Active toggle in header */}
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                  <span className="text-xs text-white/50">เปิดใช้งาน</span>
                </label>
                <button onClick={() => setForm(null)}><X className="w-5 h-5 text-white/40 hover:text-white/70" /></button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

              {/* Row 1: Image + Name + SKU */}
              <div className="flex gap-3 items-start">
                {/* Image with camera overlay */}
                <label className="relative cursor-pointer shrink-0 group">
                  {form.image_url ? (
                    <img src={form.image_url} alt="preview" className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)' }}>
                      <ImageIcon className="w-7 h-7 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploading ? (
                      <span className="text-white text-[10px]">กำลังอัปโหลด...</span>
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>

                {/* Name + SKU */}
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">ชื่อสินค้า <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.name || ''}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="เช่น ไอศกรีมวนิลา"
                      className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">รหัสสินค้า / บาร์โค้ด (SKU)</label>
                    <input
                      type="text"
                      value={form.sku || ''}
                      onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                      placeholder="เช่น IC-001"
                      className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Price | Cost + Margin */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-white/50 mb-1 block">ราคาขาย (฿) <span className="text-red-400">*</span></label>
                  <input type="number" value={form.price || ''} onChange={e => setForm(p => ({ ...p, price: +e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={inputStyle} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/50 mb-1 block">ต้นทุน (฿)</label>
                  <input type="number" value={form.cost || ''} onChange={e => setForm(p => ({ ...p, cost: +e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={inputStyle} />
                </div>
              </div>
              {/* Margin display */}
              {form.price > 0 && form.cost > 0 && (
                <div className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}>
                  Margin กำไร: {(((form.price - form.cost) / form.cost) * 100).toFixed(1)}% &nbsp;·&nbsp; กำไร/ชิ้น: ฿{(form.price - form.cost).toFixed(2)}
                </div>
              )}

              {/* Row 3: Units per box | Reorder point */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-white/50 mb-1 block">ชิ้น/กล่อง</label>
                  <input type="number" value={form.units_per_box || 24} onChange={e => setForm(p => ({ ...p, units_per_box: +e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={inputStyle} />
                  <p className="text-[10px] text-white/25 mt-1">1 กล่อง = {form.units_per_box || 24} {form.unit}</p>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/50 mb-1 block">จุดสั่งซื้อขั้นต่ำ</label>
                  <input type="number" value={form.reorder_point || 20} onChange={e => setForm(p => ({ ...p, reorder_point: +e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent focus:outline-none" style={inputStyle} />
                  <p className="text-[10px] text-white/25 mt-1">แจ้งเตือนเมื่อสต็อก ≤ ค่านี้</p>
                </div>
              </div>

              {/* Row 4: Category | Unit */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-white/50 mb-1 block">หมวดหมู่</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none" style={selectStyle}>
                    {['ไอศกรีม','เครื่องดื่ม','ขนม','อื่นๆ'].map(v => <option key={v} value={v} style={{ background: '#0d1626' }}>{v}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/50 mb-1 block">หน่วยขาย</label>
                  <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none" style={selectStyle}>
                    {['แท่ง','ชิ้น','กล่อง','ลัง','ถ้วย'].map(v => <option key={v} value={v} style={{ background: '#0d1626' }}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 5: Branch mapping */}
              <div>
                <label className="text-xs text-white/50 mb-2 block">สาขาที่วางขาย</label>
                <div className="flex flex-wrap gap-2">
                  {schools.map(s => {
                    const selected = (form.branch_ids || []).includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleBranch(s.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: selected ? `rgba(${s.color_rgb || '255,107,26'},0.15)` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${selected ? (s.color || accent) : 'rgba(255,255,255,0.1)'}`,
                          color: selected ? (s.color || accent) : 'rgba(255,255,255,0.45)',
                        }}
                      >
                        <span>{s.emoji || '🏫'}</span>
                        {s.name}
                        {selected && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-white/25 mt-1.5">หากไม่เลือก = วางขายทุกสาขา</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button onClick={() => setForm(null)} className="flex-1 py-2.5 rounded-xl text-xs text-white/50 hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ยกเลิก</button>
              <button onClick={save} disabled={saving || !form.name || !form.price || uploading}
                className="flex-[2] py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40 transition-all"
                style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,107,26,0.7))` }}>
                {saving ? 'กำลังบันทึก...' : <><Check className="w-3.5 h-3.5 inline mr-1" />บันทึก</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}