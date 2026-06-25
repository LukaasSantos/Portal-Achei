'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockDb, User } from './mockDb';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('auth_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // Simular delay do BD PostgreSQL
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const users = mockDb.getUsers();
    const found = users.find((u: any) => u.email === email && u.password === pass);
    
    if (found) {
      const sessionUser: User = {
        id: found.id,
        email: found.email,
        name: found.name,
        role: found.role
      };
      localStorage.setItem('auth_session', JSON.stringify(sessionUser));
      setUser(sessionUser);
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth_session');
    setUser(null);
    router.push('/login');
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const users = mockDb.getUsers();
    const exists = users.some((u: any) => u.email === email);
    
    if (exists) {
      setLoading(false);
      return false;
    }
    
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      password: pass,
      role: 'Funcionário'
    };
    
    mockDb.addUser(newUser);
    
    const sessionUser: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };
    
    localStorage.setItem('auth_session', JSON.stringify(sessionUser));
    setUser(sessionUser);
    setLoading(false);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
