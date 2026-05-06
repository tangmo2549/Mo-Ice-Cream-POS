import React from 'react';
// Header stays as-is on /login page
import { IceCreamCone, Key } from 'lucide-react';

export default function Header({ onAdvancedLogin }) {
  return (
    <div
      className="relative z-50 flex items-center justify-between px-6 py-2.5 border-b shrink-0"
      style={{
        background: 'rgba(6, 10, 22, 0.95)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.07)'
      }}>
      
      <div className="flex items-center gap-3">
        <div className="bg-sky-400 rounded-[13px] w-9 h-9 flex items-center justify-center"

        style={{
          background: 'linear-gradient(135deg, #ff6b1a, #e84d00)',
          boxShadow: '0 0 18px rgba(255, 107, 26, 0.5)'
        }}>
          
          <IceCreamCone className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm tracking-wide">
            MO ICE CREAM{' '}
            <span className="text-white/35 font-normal text-xs">| ระบบจัดการร้านค้า</span>
          </p>
          <p className="text-[11px] text-white/25">POS · Multi-school management</p>
        </div>
      </div>

      <button
        onClick={onAdvancedLogin}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/70 transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
        
        <Key className="w-3.5 h-3.5 text-white/40" />
        <span>เข้าสู่ระบบขั้นสูง</span>
      </button>
    </div>);

}