import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Fallback default schools if none in DB yet
const DEFAULT_SCHOOLS = [
  { id: 'default1', name: 'รร.วัดดอนไก่ดี', branch: 'สาขา: วัดดอนไก่ดี', emoji: '🔥', color: '#ff6b1a', color_rgb: '255, 107, 26', gradient: 'linear-gradient(135deg, #ff6b1a, #e84d00)' },
  { id: 'default2', name: 'รร.วัดท่าพูด', branch: 'สาขา: วัดท่าพูด', emoji: '🐬', color: '#00d4ff', color_rgb: '0, 212, 255', gradient: 'linear-gradient(135deg, #00d4ff, #0099cc)' },
  { id: 'default3', name: 'รร.พระตำหนักฯ นครปฐม', branch: 'สาขา: พระตำหนักฯ นครปฐม', emoji: '👑', color: '#e040fb', color_rgb: '224, 64, 251', gradient: 'linear-gradient(135deg, #e040fb, #b000d0)' },
];

export default function SchoolSelection({ selectedSchool, onSelect, onNext }) {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    base44.entities.School.filter({ is_active: true }, 'name', 20)
      .then(data => setSchools(data?.length ? data : DEFAULT_SCHOOLS))
      .catch(() => setSchools(DEFAULT_SCHOOLS));
  }, []);

  const displaySchools = schools.length ? schools : DEFAULT_SCHOOLS;
  const accent = selectedSchool?.color || '#ff6b1a';
  const accentRgb = selectedSchool?.color_rgb || selectedSchool?.colorRgb || '255, 107, 26';
  const btnGradient = selectedSchool?.gradient || 'linear-gradient(135deg, #ff6b1a, #e84d00)';

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <Building2 className="w-4 h-4" style={{ color: accent }} />
          <h2 className="text-base font-bold text-white">เลือกสาขาโรงเรียน</h2>
        </div>
        <p className="text-xs ml-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          เลือกโรงเรียนที่คุณดูแล (รีมสั่งเปลี่ยนตามสาขา)
        </p>
      </div>

      <div className="space-y-2.5">
        {displaySchools.map((school) => {
          const isSelected = selectedSchool?.id === school.id;
          const colorRgb = school.color_rgb || school.colorRgb || '255,107,26';
          return (
            <button
              key={school.id}
              onClick={() => onSelect(school)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300"
              style={{
                background: isSelected ? `rgba(${colorRgb}, 0.12)` : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isSelected ? school.color : 'rgba(255,255,255,0.09)'}`,
                boxShadow: isSelected ? `0 0 16px rgba(${colorRgb}, 0.2)` : 'none',
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: isSelected ? `rgba(${colorRgb}, 0.18)` : 'rgba(255,255,255,0.06)' }}
              >
                {isSelected ? <span>{school.emoji}</span> : <Building2 className="w-4 h-4 text-white/30" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{school.name}</p>
                <p className="text-xs text-white/40">{school.branch || `สาขา: ${school.location || ''}`}</p>
              </div>
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: school.color, boxShadow: `0 0 8px ${school.color}` }} />
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!selectedSchool}
        className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
        style={{
          background: selectedSchool ? btnGradient : 'rgba(255,255,255,0.05)',
          color: '#fff',
          boxShadow: selectedSchool ? `0 4px 24px rgba(${accentRgb}, 0.4)` : 'none',
        }}
      >
        ถัดไป →
      </button>
    </div>
  );
}