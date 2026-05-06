// Session management for PIN-based login
export function saveSession(school, role) {
  sessionStorage.setItem('pos_school', JSON.stringify(school));
  sessionStorage.setItem('pos_role', role.id || role);
}

export function getSession() {
  try {
    const school = JSON.parse(sessionStorage.getItem('pos_school'));
    const role = sessionStorage.getItem('pos_role');
    if (!school || !role) return null;
    return { school, role };
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem('pos_school');
  sessionStorage.removeItem('pos_role');
}

export function getRoleLabel(role) {
  const map = { owner: 'เจ้าของร้าน', admin: 'ผู้ดูแลระบบ', staff: 'พนักงานขาย' };
  return map[role] || role;
}