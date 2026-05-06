import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, School, Store, Package, CreditCard,
  Users, LogOut, ChevronLeft, ChevronRight, IceCreamCone,
  ShoppingCart, BarChart3, Calendar, Box, Shield
} from 'lucide-react';
import { clearSession, getRoleLabel } from '@/lib/session';

const ALL_MENU = [
  { id: 'dashboard', label: 'แผงควบคุม', icon: LayoutDashboard, path: '/dashboard', roles: ['owner', 'admin', 'staff'] },
  { id: 'pos', label: 'ขายสินค้า (POS)', icon: ShoppingCart, path: '/pos', roles: ['owner', 'admin', 'staff'] },
  { id: 'schools', label: 'จัดการโรงเรียน', icon: School, path: '/schools', roles: ['owner'] },
  { id: 'products', label: 'จัดการร้านค้า', icon: Store, path: '/products', roles: ['owner', 'admin'] },
  { id: 'stock', label: 'สต็อกสินค้า', icon: Package, path: '/stock', roles: ['owner', 'admin', 'staff'] },
  { id: 'finance', label: 'บัญชีรายรับ-จ่าย', icon: CreditCard, path: '/finance', roles: ['owner', 'admin'] },
  { id: 'reports', label: 'รายงานยอดขาย', icon: BarChart3, path: '/reports', roles: ['owner', 'admin'] },
  { id: 'seasons', label: 'ปฏิทินการศึกษา', icon: Calendar, path: '/seasons', roles: ['owner', 'admin'] },
  { id: 'packaging', label: 'บรรจุภัณฑ์', icon: Box, path: '/packaging', roles: ['owner', 'admin', 'staff'] },
  { id: 'users', label: 'จัดการผู้ใช้', icon: Users, path: '/users', roles: ['owner'] },
];

export default function Sidebar({ school, role, collapsed, onToggle }) {
  const location = useLocation();
  const accent = school?.color || '#ff6b1a';
  const accentRgb = school?.color_rgb || school?.colorRgb || '255, 107, 26';

  const menu = ALL_MENU.filter(m => m.roles.includes(role));

  const handleLogout = () => {
    clearSession();
    window.location.href = '/';
  };

  return (
    <div
      className="flex flex-col h-full transition-all duration-300 shrink-0"
      style={{
        width: collapsed ? '64px' : '220px',
        background: 'rgba(5, 8, 20, 0.97)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent}, rgba(${accentRgb},0.6))`, boxShadow: `0 0 14px rgba(${accentRgb},0.45)` }}
        >
          <IceCreamCone className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-white text-xs leading-tight truncate">MO ICE CREAM</p>
            <p className="text-[10px] text-white/35 truncate">{getRoleLabel(role)}</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl transition-all duration-200 group"
              style={{
                background: isActive ? `rgba(${accentRgb}, 0.15)` : 'transparent',
                borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
              }}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                style={{ color: isActive ? accent : 'rgba(255,255,255,0.45)' }}
              />
              {!collapsed && (
                <span
                  className="text-xs font-medium truncate"
                  style={{ color: isActive ? accent : 'rgba(255,255,255,0.65)' }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* School info */}
      {!collapsed && school && (
        <div className="mx-3 mb-2 px-3 py-2.5 rounded-xl" style={{ background: `rgba(${accentRgb},0.08)`, border: `1px solid rgba(${accentRgb},0.2)` }}>
          <p className="text-[10px] text-white/40 mb-0.5">สาขาปัจจุบัน</p>
          <p className="text-xs font-semibold text-white truncate">{school.name}</p>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 mx-2 mb-3 px-3 py-2.5 rounded-xl transition-all hover:bg-red-500/10 group"
      >
        <LogOut className="w-4 h-4 shrink-0 text-red-400/70 group-hover:text-red-400" />
        {!collapsed && <span className="text-xs font-medium text-red-400/70 group-hover:text-red-400">ออกจากระบบ</span>}
      </button>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t transition-all hover:bg-white/5"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {collapsed
          ? <ChevronRight className="w-4 h-4 text-white/30" />
          : <ChevronLeft className="w-4 h-4 text-white/30" />
        }
      </button>
    </div>
  );
}