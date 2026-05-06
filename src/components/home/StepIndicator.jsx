import React from 'react';
import { Check } from 'lucide-react';

export default function StepIndicator({ currentStep, totalSteps = 3, school }) {
  const accent = school?.color || '#ff6b1a';

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <div
                  className="w-10 h-[2px] transition-all duration-500"
                  style={{
                    background: isCompleted ? accent : 'rgba(255,255,255,0.1)',
                  }}
                />
              )}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500"
                style={{
                  background: isCompleted
                    ? accent
                    : isActive
                    ? `rgba(${school?.colorRgb || '255,107,26'}, 0.15)`
                    : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${
                    isCompleted || isActive ? accent : 'rgba(255,255,255,0.15)'
                  }`,
                  color: isCompleted
                    ? '#fff'
                    : isActive
                    ? accent
                    : 'rgba(255,255,255,0.35)',
                  boxShadow:
                    isCompleted || isActive
                      ? `0 0 16px rgba(${school?.colorRgb || '255,107,26'}, 0.4)`
                      : 'none',
                }}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>
        ขั้นตอน {currentStep}/{totalSteps}
      </span>
    </div>
  );
}