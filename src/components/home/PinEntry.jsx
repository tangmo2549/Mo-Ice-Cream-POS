import React, { useState, useRef, useEffect } from 'react';
import { Lock, ArrowRight, RefreshCw, X, Phone } from 'lucide-react';
import { saveSession } from '@/lib/session';
import { useNavigate } from 'react-router-dom';

// ✅ รหัส PIN ของแต่ละบทบาท (แก้ได้ตรงนี้)
const PIN_MAP = {
  owner: '1111',
  admin:  '2222',
  staff:  '3333',
};

export default function PinEntry({ selectedSchool, selectedRole, onChangeRole }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const accent      = selectedSchool?.color     || '#ff6b1a';
  const accentRgb   = selectedSchool?.colorRgb  || selectedSchool?.color_rgb || '255, 107, 26';
  const btnGradient = selectedSchool?.gradient  || 'linear-gradient(135deg, #ff6b1a, #e84d00)';
  const pinFull     = pin.every((p) => p !== '');

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ ตรวจสอบ PIN แบบ local ไม่ต้องเรียก API
  const handleSubmit = async () => {
    if (!pinFull) return;
    setIsLoading(true);
    setError('');

    const enteredPin  = pin.join('');
    const correctPin  = PIN_MAP[selectedRole?.id];

    // จำลอง delay เล็กน้อยเพื่อให้ UX ดูเป็นธรรมชาติ
    await new Promise((r) => setTimeout(r, 300));

    if (correctPin && enteredPin === correctPin) {
      saveSession(selectedSchool, selectedRole);
      navigate('/dashboard');
    } else {
      setError('รหัส PIN ไม่ถูกต้อง กรุณาลองอีกครั้ง');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }

    setIsLoading(false);
  };

  const roleLabel =
    selectedRole?.id === 'owner' ? 'เจ้าของร้าน'
    : selectedRole?.id === 'admin' ? 'ผู้ดูแลระบบ'
    : 'พนักงานขาย';

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4" style={{ color: accent }} />
          <h2 className="text-base font-bold text-white">ใส่รหัส PIN 4 หลัก</h2>
        </div>
        <div className="flex items-center gap-2 ml-6">
          <span className="text-xs text-white/40">{roleLabel}</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-xs" style={{ color: accent }}>
            {selectedSchool?.emoji} {selectedSchool?.name}
          </span>
        </div>
      </div>

      {/* PIN boxes */}
      <div className="flex items-center justify-center gap-4 py-3">
        {pin.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handlePinChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-14 h-16 rounded-2xl text-center text-2xl font-bold text-white focus:outline-none transition-all duration-300"
            style={{
              background: digit ? `rgba(${accentRgb}, 0.1)` : 'rgba(255,255,255,0.05)',
              border: `2px solid ${digit ? accent : 'rgba(255,255,255,0.12)'}`,
              boxShadow: digit ? `0 0 14px rgba(${accentRgb}, 0.25)` : 'none',
            }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-center text-xs text-red-400 bg-red-500/10 py-2 px-3 rounded-xl border border-red-500/20">
          {error}
        </p>
      )}

      {/* Forgot PIN */}
      <div className="text-left pl-1">
        <button onClick={() => setShowForgot(true)} className="text-xs font-medium" style={{ color: accent }}>
          ลืมรหัส PIN?
        </button>
      </div>

      {/* Forgot PIN Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#0a0f22', border: `1.5px solid rgba(${accentRgb},0.3)` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" style={{ color: accent }} />
                <h3 className="text-white font-bold text-sm">แจ้งลืมรหัสผ่าน / ขอรหัสใหม่</h3>
              </div>
              <button onClick={() => setShowForgot(false)}><X className="w-5 h-5 text-white/40 hover:text-white/70" /></button>
            </div>
            <div className="px-4 py-3 rounded-xl mb-4" style={{ background: `rgba(${accentRgb},0.07)`, border: `1px solid rgba(${accentRgb},0.2)` }}>
              <p className="text-xs text-white/70 leading-relaxed">
                เนื่องจากรหัส PIN เป็นส่วนสำคัญในการเข้าถึงรายได้และสต็อกสินค้า<br /><br />
                <span className="font-semibold text-white/90">กรุณาติดต่อเจ้าของร้าน (Owner) หรือผู้ดูแลระบบ</span> เพื่อทำการรีเซ็ตรหัสผ่านใหม่ผ่านหน้าจัดการผู้ใช้งาน
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForgot(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:bg-white/5 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                ตกลง
              </button>
              <a
                href="tel:0952373398"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${accent}, rgba(${accentRgb},0.6))` }}
              >
                <Phone className="w-3.5 h-3.5" /> ติดต่อเจ้าของร้าน
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Login button */}
      <button
        onClick={handleSubmit}
        disabled={!pinFull || isLoading}
        className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: pinFull ? btnGradient : 'rgba(255,255,255,0.06)',
          color: '#fff',
          boxShadow: pinFull ? `0 4px 24px rgba(${accentRgb}, 0.45)` : 'none',
        }}
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <ArrowRight className="w-4 h-4" />
            เข้าสู่ระบบ
          </>
        )}
      </button>

      {/* Change role */}
      <button
        onClick={onChangeRole}
        className="w-full text-center text-xs text-white/35 hover:text-white/55 transition-colors py-1"
      >
        ← เปลี่ยนบทบาท
      </button>
    </div>
  );
}