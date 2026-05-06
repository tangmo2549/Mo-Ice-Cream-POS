import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IceCreamCone, Mail, Lock, ArrowRight, LogIn } from 'lucide-react';
import BackgroundEffect from '../components/layout/BackgroundEffect';

const ACCENT = 'rgb(0, 200, 200)';

export default function signin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #060b18 0%, #0a0f22 50%, #080d1a 100%)',
      }}
    >
      <BackgroundEffect />

      {/* Header */}
      <div
        className="relative z-50 flex items-center justify-between px-6 py-2.5 border-b shrink-0"
        style={{
          background: 'rgba(8, 13, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(0, 200, 180, 0.3)',
        }}
      >
        <Link to="/" className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(0, 200, 180, 0.12)',
              border: '1px solid rgba(0, 200, 180, 0.5)',
              boxShadow: '0 0 15px rgba(0, 200, 180, 0.35)',
            }}
          >
            <IceCreamCone className="w-4 h-4" style={{ color: 'rgb(0, 200, 180)' }} />
          </div>
          <p className="font-bold text-white text-sm">Mo Ice Cream POS</p>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/50 border border-white/10 px-3 py-1 rounded-full">
            Online
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: 'rgba(10, 16, 38, 0.8)',
              backdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(0, 200, 200, 0.25)',
              boxShadow: '0 0 40px rgba(0, 200, 200, 0.06)',
            }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-10"
              style={{
                background: 'radial-gradient(circle, rgb(0, 200, 200) 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <LogIn className="w-5 h-5" style={{ color: ACCENT }} />
                <h2 className="text-2xl font-bold text-white">เข้าสู่ระบบ</h2>
              </div>
              <p className="text-sm text-white/40 mb-8">
                ลงชื่อเข้าใช้ด้วยอีเมลและรหัสผ่าน
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Mail className="w-4 h-4 text-white/30 shrink-0" />
                  <input
                    type="email"
                    placeholder="อีเมล"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-sm text-white placeholder-white/30 w-full focus:outline-none"
                  />
                </div>

                {/* Password */}
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Lock className="w-4 h-4 text-white/30 shrink-0" />
                  <input
                    type="password"
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent text-sm text-white placeholder-white/30 w-full focus:outline-none"
                  />
                </div>

                {/* Forgot password */}
                <div className="text-right">
                  <button type="button" className="text-xs hover:underline" style={{ color: ACCENT }}>
                    ลืมรหัสผ่าน?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, rgba(0, 160, 180, 1))`,
                    color: '#0a1026',
                    boxShadow: '0 4px 20px rgba(0, 200, 200, 0.3)',
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                  เข้าสู่ระบบ
                </button>
              </form>

              {/* Link to register */}
              <p className="text-center text-xs text-white/40 mt-5">
                ยังไม่มีบัญชี?{' '}
                <Link to="/register" className="font-semibold hover:underline" style={{ color: ACCENT }}>
                  สมัครสมาชิก
                </Link>
              </p>

              {/* Back to PIN login */}
              <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <Link
                  to="/"
                  className="text-xs text-white/30 hover:text-white/50 transition-colors"
                >
                  ← กลับไปหน้าเข้าสู่ระบบด้วย PIN
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}