import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepIndicator from './StepIndicator';
import SchoolSelection from './SchoolSelection';
import RoleSelection from './RoleSelection';
import PinEntry from './PinEntry';

export default function LoginFlow({ onSchoolChange }) {
  const [step, setStep] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSelectSchool = (school) => {
    setSelectedSchool(school);
    onSchoolChange?.(school);
  };

  const accent = selectedSchool?.color || '#ff6b1a';
  const accentRgb = selectedSchool?.colorRgb || '255, 107, 26';

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full" style={{ maxWidth: '580px' }}>
        <div
          className="rounded-2xl p-7 relative overflow-hidden"
          style={{
            background: 'rgba(8, 14, 30, 0.88)',
            backdropFilter: 'blur(24px)',
            border: `1.5px solid rgba(${accentRgb}, 0.35)`,
            boxShadow: `0 0 50px rgba(${accentRgb}, 0.1), inset 0 1px 0 rgba(255,255,255,0.04)`,
            transition: 'border-color 0.5s, box-shadow 0.5s',
          }}
        >
          {/* Corner glow */}
          <div
            className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, rgba(${accentRgb}, 0.15) 0%, transparent 70%)`,
              transition: 'background 0.5s',
            }}
          />

          <div className="relative z-10">
            <StepIndicator currentStep={step} school={selectedSchool} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.18 }}
                >
                  <SchoolSelection
                    selectedSchool={selectedSchool}
                    onSelect={handleSelectSchool}
                    onNext={() => setStep(2)}
                  />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.18 }}
                >
                  <RoleSelection
                    selectedSchool={selectedSchool}
                    selectedRole={selectedRole}
                    onSelect={setSelectedRole}
                    onNext={() => setStep(3)}
                    onBack={() => { setStep(1); setSelectedRole(null); }}
                  />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.18 }}
                >
                  <PinEntry
                    selectedSchool={selectedSchool}
                    selectedRole={selectedRole}
                    onChangeRole={() => { setStep(2); setSelectedRole(null); }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}