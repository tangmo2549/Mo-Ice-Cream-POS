import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';

export default function ReceiptModal({ order, school, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=400,height=600');
    win.document.write(`
      <html><head><title>ใบเสร็จ</title>
      <style>
        body { font-family: 'Noto Sans Thai', sans-serif; padding: 20px; font-size: 13px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 3px 0; }
        .total { font-size: 16px; font-weight: bold; }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="rounded-2xl w-full max-w-sm overflow-hidden" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-white font-bold flex items-center gap-2"><Printer className="w-4 h-4" /> ใบเสร็จรับเงิน</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-white/40 hover:text-white/70" /></button>
        </div>

        {/* Receipt content */}
        <div ref={printRef} className="p-5 space-y-3" style={{ fontFamily: 'Noto Sans Thai, sans-serif' }}>
          <div className="center bold" style={{ fontSize: 15, color: '#fff', textAlign: 'center' }}>🍦 MO ICE CREAM</div>
          <div className="center" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{school?.name}</div>
          <div className="line" style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', margin: '8px 0' }} />
          <div className="row" style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
            <span>วันที่: {dateStr}</span>
            <span>เวลา: {timeStr}</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>ชำระด้วย: <strong style={{ color: '#fff' }}>{order.payment_method}</strong></div>
          <div className="line" style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', margin: '8px 0' }} />

          {/* Items */}
          <div className="space-y-1">
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item.product_name} × {item.quantity}</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>฿{item.subtotal?.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="line" style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 15 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>รวมทั้งหมด</span>
            <span style={{ color: school?.color || '#ff6b1a' }}>฿{order.total_amount?.toLocaleString()}</span>
          </div>
          <div className="line" style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', margin: '8px 0' }} />
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>ขอบคุณที่ใช้บริการ 🍦</div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs text-white/50" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ปิด</button>
          <button
            onClick={handlePrint}
            className="flex-[2] py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${school?.color || '#ff6b1a'}, rgba(255,107,26,0.6))` }}
          >
            <Printer className="w-3.5 h-3.5" /> พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>
    </div>
  );
}