import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

// Strips fields that should never sit in localStorage (e.g. the password hash
// your backend currently includes in the user object).
function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

function persist(session) {
  localStorage.setItem('ledger_token', session.accessToken);
  if (session.refreshToken) {
    localStorage.setItem('ledger_refresh_token', session.refreshToken);
  }
  localStorage.setItem('ledger_user', JSON.stringify(session.user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ledger_token');
    const storedUser = localStorage.getItem('ledger_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('ledger_user');
      }
    }
    setLoading(false);
  }, []);

  // Matches your backend's response shape exactly:
  // { success, message, statusCode, data: { user, accessToken, refreshToken } }
  const applySession = (res) => {
    const { user: rawUser, accessToken, refreshToken } = res?.data || {};

    if (!accessToken) {
      throw new Error('Login response did not include an accessToken.');
    }

    const safeUser = sanitizeUser(rawUser);
    persist({ accessToken, refreshToken, user: safeUser });
    setUser(safeUser);
    return safeUser;
  };

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    return applySession(res);
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
   // return applySession(res);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ledger_token');
    localStorage.removeItem('ledger_refresh_token');
    localStorage.removeItem('ledger_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
