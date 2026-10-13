import { createContext, useContext, useEffect, useState } from 'react';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('auth') || 'null'));
  useEffect(() => { if (user) document.documentElement.dataset.role = user.role; else delete document.documentElement.dataset.role; }, [user]);
  const login = d => { localStorage.setItem('auth', JSON.stringify(d)); setUser(d); };
  const logout = () => { localStorage.removeItem('auth'); setUser(null); };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}