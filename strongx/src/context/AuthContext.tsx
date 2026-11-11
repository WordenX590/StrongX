import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  adminLogin: (email: string, adminKey: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    ageDemographic?: string;
  }) => Promise<{ user: User }>;
  logout: () => void;
  updateLocalCredits: (credits: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('strongx_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('strongx_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      if (currentToken.startsWith('admin_token_')) {
        setUser({
          id: 'admin_master',
          firstName: 'Administrador',
          lastName: 'StrongX',
          email: 'flatthedragon@gmail.com',
          accountType: 'admin',
          credits: 999999,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          status: 'active',
          emailVerified: true,
        });
      } else {
        const data = await api.getMe();
        setUser(data.user);
      }
    } catch {
      localStorage.removeItem('strongx_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // Non-blocking visitor tracking
    const deviceType = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
    api.trackVisitor({
      country: Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Lisbon') ? 'Portugal' : 'Brasil',
      device: deviceType,
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Firefox',
      referrer: document.referrer || 'Direct',
    });
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    localStorage.setItem('strongx_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const adminLogin = async (email: string, adminKey: string) => {
    const res = await api.adminLogin({ email, adminKey });
    localStorage.setItem('strongx_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    ageDemographic?: string;
  }) => {
    const res = await api.register(data);
    localStorage.setItem('strongx_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return { user: res.user };
  };

  const logout = () => {
    localStorage.removeItem('strongx_token');
    setToken(null);
    setUser(null);
  };

  const updateLocalCredits = (credits: number) => {
    if (user) {
      setUser({ ...user, credits });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.accountType === 'admin',
        loading,
        login,
        adminLogin,
        register,
        logout,
        updateLocalCredits,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
