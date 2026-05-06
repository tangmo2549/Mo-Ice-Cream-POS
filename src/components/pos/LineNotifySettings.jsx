import React, { useEffect, useState } from 'react';
import { MessageCircle, X, Eye, EyeOff } from 'lucide-react';

const STORAGE_KEY = 'line_notify_token';

export default function LineNotifySettings({ onClose }) {
  const [token, setToken] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setToken(saved); setEnabled(true); }
  }, []);

  const save = () => {
    if (token) { localStorage.setItem(STORAGE_KEY, token); setEnabled(true); }
    else { localStorage.removeItem(STORAGE_KEY); setEnabled(false); }
    onClose();
  };

  const test = async () => {
    if (!token) return;
    setTesting(true);
    setTestMsg('');
    try {
      const res = await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'message=🍦 ทดสอบแจ้งเตือน MO ICE CREAM สำเร็จ!',
      });
      setTestMsg(res.ok ? '✓ ส่งสำเร็จ! ตรวจสอบ LINE ของคุณ' : '✗ Token ไม่ถูกต้อง หรือ LINE Notify หมดอายุ');
    } catch {
      setTestMsg('✗ ไม่สามารถเชื่อมต่อได้ (CORS) — ลองบน production domain');
    }
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="rounded-2xl w-full max-w-sm" style={{ background: '#0a0f22', border: '1.5px solid rgba(255,255,255,0.12)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-white font-bold flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-400" /> ตั้งค่า LINE Notify
          </h2>
          <button onClick={onClose}><X className="w-5 h-5 text-white/40" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl text-xs text-white/60 space-y-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white/80 font-semibold">วิธีขอ Token:</p>
            <p>1. ไปที่ <span className="text-green-400">notify-bot.line.me/th</span></p>
            <p>2. เข้าสู่ระบบ → My page → Generate token</p>
            <p>3. ตั้งชื่อและเลือก Chat/Group ที่ต้องการ</p>
            <p>4. คัดลอก Token มาวางด้านล่าง</p>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">LINE Notify Token</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="วาง Token ที่นี่..."
                className="w-full px-3 py-2 pr-9 rounded-xl text-sm text-white bg-transparent focus:outline-none"
                style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
              />
              <button onClick={() => setShowToken(p => !p)} className="absolute right-2.5 top-2.5 text-white/30 hover:text-white/60">
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          {testMsg && (
            <p className={`text-xs px-3 py-2 rounded-lg ${testMsg.startsWith('✓') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{testMsg}</p>
          )}
          <div className="flex gap-3">
            <button onClick={test} disabled={!token || testing} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white/70 disabled:opacity-40" style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
              {testing ? 'กำลังส่ง...' : 'ทดสอบ'}
            </button>
            <button onClick={save} className="flex-[2] py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #4ade80, #16a34a)' }}>
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}