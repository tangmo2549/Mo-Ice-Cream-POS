import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getSession } from '@/lib/session';
import { useNavigate } from 'react-router-dom';

export default function Dashboardlayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const session = getSession();

  if (!session) {
    navigate('/');
    return null;
  }

  const { school, role } = session;

  return (
    <div className="h-screen flex overflow-hidden relative" style={{ background: 'linear-gradient(160deg, #050c1a 0%, #070d1e 40%, #050a18 100%)' }}>
      <Sidebar
        school={school}
        role={role}
        collapsed={collapsed}
        onToggle={() => setCollapsed(p => !p)}
      />
      {/* Floating toggle button */}
      <button
        onClick={() => setCollapsed(p => !p)}
        className="fixed z-50 top-1/2 -translate-y-1/2 w-5 h-10 flex items-center justify-center rounded-r-lg transition-all duration-300"
        style={{
          left: collapsed ? '64px' : '220px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderLeft: 'none',
        }}
      >
        {collapsed
          ? <span className="text-white/50 text-xs">›</span>
          : <span className="text-white/50 text-xs">‹</span>
        }
      </button>
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ school, role }} />
      </main>
    </div>
  );
}