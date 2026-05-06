import React from 'react';
import { Crown, ShieldCheck, Store } from 'lucide-react';

const ROLES = [
  { id: 'owner', name: 'เจ้าของร้าน', sub: 'Owner', icon: Crown },
  { id: 'admin', name: 'ผู้ดูแลระบบ', sub: 'Admin', icon: ShieldCheck },
  { id: 'staff', name: 'พนักงานขาย', sub: 'Staff', icon: Store },
];

export default function RoleSelection({ selectedSchool, selectedRole, onSelect, onNext, onBack }) {
  const accent = selectedSchool?.color || '#ff6b1a';
  const accentRgb = selectedSchool?.colorRgb || '255, 107, 26';
  const btnGradient = selectedSchool?.gradient || 'linear-gradient(135deg, #ff6b1a, #e84d00)';

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <Crown className="w-4 h-4" style={{ color: accent }} />
          <h2 className="text-base font-bold text-white">เลือกบทบาท</h2>
        </div>
        <div className="flex items-center gap-1.5 ml-6">
          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>สาขา:</span>
          <span className="text-sm font-semibold" style={{ color: accent }}>
            {selectedSchool?.emoji} {selectedSchool?.name}
          </span>
        </div>
      </div>

      {/* Role cards — 3 in a row */}
      <div className="grid grid-cols-3 gap-2.5">
        {ROLES.map((role) => {
          const isSelected = selectedRole?.id === role.id;
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => onSelect(role)}
              className="flex flex-col items-center justify-center gap-2 py-5 px-2 rounded-xl transition-all duration-300"
              style={{
                background: isSelected
                  ? `rgba(${accentRgb}, 0.12)`
                  : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isSelected ? accent : 'rgba(255,255,255,0.09)'}`,
                boxShadow: isSelected ? `0 0 18px rgba(${accentRgb}, 0.25)` : 'none',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: isSelected
                    ? `rgba(${accentRgb}, 0.2)`
                    : 'rgba(255,255,255,0.07)',
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: isSelected ? accent : 'rgba(255,255,255,0.45)' }}
                />
              </div>
              <div className="text-center">
                <p
                  className="text-xs font-semibold"
                  style={{ color: isSelected ? accent : 'rgba(255,255,255,0.8)' }}
                >
                  {role.name}
                </p>
                <p className="text-[10px] text-white/35 mt-0.5">{role.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom row: back + next */}
      <div className="flex gap-2.5">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          ← เปลี่ยนโรงเรียน
        </button>
        <button
          onClick={onNext}
          disabled={!selectedRole}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{
            background: selectedRole ? btnGradient : 'rgba(255,255,255,0.05)',
            color: selectedRole ? '#fff' : 'rgba(255,255,255,0.3)',
            boxShadow: selectedRole ? `0 4px 24px rgba(${accentRgb}, 0.4)` : 'none',
          }}
        >
          ถัดไป →
        </button>
      </div>
    </div>
  );
}