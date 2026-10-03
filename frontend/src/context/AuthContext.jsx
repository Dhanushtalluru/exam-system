import { createContext, useContext, useState } from 'react';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('auth') || 'null'));
  const login = d => { localStorage.setItem('auth', JSON.stringify(d)); setUser(d); };
  const logout = () => { localStorage.removeItem('auth'); setUser(null); };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
