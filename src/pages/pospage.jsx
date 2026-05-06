import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Minus, ShoppingCart, Settings2 } from 'lucide-react';
import ReceiptModal from '@/components/pos/ReceiptModal';
import LineNotifySettings from '@/components/pos/LineNotifySettings';

const LINE_TOKEN_KEY = 'line_notify_token';

async function logAudit(action, school, role, detail, amount) {
  try {
    await base44.entities.AuditLog.create({
      school_id: school?.id || 'default',
      school_name: school?.name || '',
      action,
      role,
      detail,
      amount: amount || 0,
    });
  } catch { }
}

async function sendLineNotify(order, school) {
  const token = localStorage.getItem(LINE_TOKEN_KEY);
  if (!token) return;
  const items = order.items?.map(i => `  • ${i.product_name} x${i.quantity} = ฿${i.subtotal}`).join('\n');
  const msg = `\n🍦 ออเดอร์ใหม่ — ${school?.name || ''}\n${items}\n──────────\nรวม: ฿${order.total_amount?.toLocaleString()}\nชำระ: ${order.payment_method}`;
  try {
    await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `message=${encodeURIComponent(msg)}`,
    });
  } catch { /* silent */ }
}

export default function PosPage() {
  const { school, role } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [payMethod, setPayMethod] = useState('เงินสด');
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [showLineSettings, setShowLineSettings] = useState(false);
  const accent = school?.color || '#ff6b1a';
  const accentRgb = school?.color_rgb || school?.colorRgb || '255,107,26';

  useEffect(() => {
    base44.entities.Product.filter({ is_active: true }, 'name', 100).then(setProducts);
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(c => c.product_id === product.id);
      if (ex) return prev.map(c => c.product_id === product.id ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.price } : c);
      return [...prev, { product_id: product.id, product_name: product.name, price: product.price, quantity: 1, subtotal: product.price }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => c.product_id === id ? { ...c, quantity: Math.max(0, c.quantity + delta), subtotal: Math.max(0, c.quantity + delta) * c.price } : c).filter(c => c.quantity > 0));
  };

  const total = cart.reduce((s, c) => s + c.subtotal, 0);

  const handleCheckout = async () => {
    if (!cart.length) return;
    setSaving(true);
    const orderData = {
      school_id: school?.id || 'default',
      school_name: school?.name || '',
      items: cart,
      total_amount: total,
      payment_method: payMethod,
      status: 'completed',
      cashier_role: role,
    };
    await base44.entities.Order.create(orderData);
    sendLineNotify(orderData, school);
    logAudit('create_order', school, role, `${cart.length} รายการ | ${payMethod}`, total);
    setCart([]);
    setSaving(false);
    setReceipt(orderData);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" style={{ color: accent }} />
          ขายสินค้า (POS) — {school?.name}
        </h1>
        <button
          onClick={() => setShowLineSettings(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-white/50 hover:text-white/80 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          title="ตั้งค่า LINE Notify"
        >
          <Settings2 className="w-3.5 h-3.5" /> LINE Notify
        </button>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Products */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="rounded-xl text-left transition-all hover:scale-[1.02] overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                {/* Square image container with contain */}
                <div className="w-full" style={{ aspectRatio: '1/1', background: '#0a0d18' }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full" style={{ objectFit: 'contain' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍦</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-white mb-0.5 truncate">{p.name}</p>
                  <p className="text-[10px] text-white/40 mb-1">{p.category}</p>
                  <p className="text-sm font-bold" style={{ color: accent }}>฿{p.price}</p>
                </div>
              </button>
            ))}
            {products.length === 0 && <p className="text-white/30 text-sm col-span-4">ยังไม่มีสินค้า กรุณาเพิ่มสินค้าในเมนูจัดการร้านค้า</p>}
          </div>
        </div>

        {/* Cart */}
        <div className="w-72 flex flex-col rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-white font-bold text-sm">🛒 ตะกร้า ({cart.length} รายการ)</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex-1">
                  <p className="text-xs text-white font-medium">{item.product_name}</p>
                  <p className="text-xs text-white/40">฿{item.price} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.product_id, -1)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10">
                    <Minus className="w-3 h-3 text-white/60" />
                  </button>
                  <span className="text-xs text-white w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product_id, 1)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10">
                    <Plus className="w-3 h-3 text-white/60" />
                  </button>
                </div>
                <p className="text-xs font-bold w-14 text-right" style={{ color: accent }}>฿{item.subtotal}</p>
              </div>
            ))}
            {cart.length === 0 && <p className="text-white/25 text-xs text-center py-8">กดสินค้าเพื่อเพิ่ม</p>}
          </div>
          <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex gap-2 mb-3">
              {['เงินสด', 'QR Code', 'โอนเงิน'].map(m => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: payMethod === m ? `rgba(${accentRgb},0.2)` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${payMethod === m ? accent : 'rgba(255,255,255,0.1)'}`,
                    color: payMethod === m ? accent : 'rgba(255,255,255,0.5)',
                  }}
                >{m}</button>
              ))}
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-white/60 text-sm">รวมทั้งหมด</span>
              <span className="text-xl font-extrabold" style={{ color: accent }}>฿{total.toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={!cart.length || saving}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-30"
              style={{ background: `linear-gradient(135deg, ${accent}, rgba(${accentRgb},0.6))`, boxShadow: `0 4px 20px rgba(${accentRgb},0.3)` }}
            >
              {saving ? 'กำลังบันทึก...' : '💳 ชำระเงิน'}
            </button>
          </div>
        </div>
      </div>

      {receipt && <ReceiptModal order={receipt} school={school} onClose={() => setReceipt(null)} />}
      {showLineSettings && <LineNotifySettings onClose={() => setShowLineSettings(false)} />}
    </div>
  );
}