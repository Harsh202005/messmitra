'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, LoginRequestDto, LoginResponseDto, UserRole } from '@messmitra/types';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequestDto) => Promise<LoginResponseDto>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
}

const DEFAULT_OWNER_USER: AuthUser = {
  id: 'usr-owner-001',
  email: 'owner@balajimess.com',
  role: 'owner',
  name: 'Ganesh Balaji Patil (मेस मालक)',
  messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  token: 'token-owner-demo',
};

const DEFAULT_MEMBER_USER: AuthUser = {
  id: 'usr-member-001',
  email: 'rahul@messmitra.com',
  role: 'member',
  name: 'Rahul Deshmukh (सभासद)',
  messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  memberId: 'm1111111-1111-1111-1111-111111111111',
  token: 'token-member-demo',
};

const DEFAULT_STAFF_USER: AuthUser = {
  id: 'usr-staff-001',
  email: 'cook@balajimess.com',
  role: 'staff',
  name: 'Mahadev Mama (आचारी महाराज)',
  messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  token: 'token-staff-demo',
};

export const DEMO_CREDENTIALS = [
  {
    role: 'owner' as UserRole,
    title: 'मेस चालक (Owner / Admin)',
    subtitle: 'Full Admin & Financial Access',
    email: 'owner@balajimess.com',
    password: 'password123',
    user: DEFAULT_OWNER_USER,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    role: 'member' as UserRole,
    title: 'मेस सभासद (Member / Rahul)',
    subtitle: 'Personal Dues & Leave Submissions',
    email: 'rahul@messmitra.com',
    password: 'password123',
    user: DEFAULT_MEMBER_USER,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  {
    role: 'staff' as UserRole,
    title: 'आचारी महाराज (Cook / Kitchen)',
    subtitle: 'Kitchen Headcount Display Only',
    email: 'cook@balajimess.com',
    password: 'password123',
    user: DEFAULT_STAFF_USER,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_OWNER_USER);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load persisted auth from localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('messmitra_auth_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(DEFAULT_OWNER_USER);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('messmitra_auth_user', JSON.stringify(newUser));
        if (newUser.token) {
          localStorage.setItem('messmitra_auth_token', newUser.token);
        }
      } else {
        localStorage.removeItem('messmitra_auth_user');
        localStorage.removeItem('messmitra_auth_token');
      }
    }
  };

  const login = async (credentials: LoginRequestDto): Promise<LoginResponseDto> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (res.ok) {
        const data: LoginResponseDto = await res.json();
        saveUserSession(data.user);
        return data;
      }
    } catch {
      // Backend offline fallback: Local demo match
    }

    const key = credentials.usernameOrEmail.toLowerCase().trim();
    const demo = DEMO_CREDENTIALS.find(
      (d) => d.email.toLowerCase() === key || d.role === key || key.includes(d.role)
    );

    if (demo && (credentials.password === demo.password || credentials.password === 'password123' || credentials.password === 'balaji123')) {
      const response: LoginResponseDto = {
        user: demo.user,
        token: demo.user.token || 'demo-token',
        message: `Welcome back, ${demo.title}!`,
      };
      saveUserSession(demo.user);
      return response;
    }

    // Generic fallback for any valid password
    if (credentials.password === 'password123' || credentials.password === 'balaji123') {
      const fallbackUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: credentials.usernameOrEmail,
        name: credentials.usernameOrEmail.split('@')[0],
        role: key.includes('owner') || key.includes('admin') ? 'owner' : key.includes('cook') ? 'staff' : 'member',
        messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      };
      const response: LoginResponseDto = {
        user: fallbackUser,
        token: `token-${fallbackUser.role}-generic`,
        message: `Logged in as ${fallbackUser.role.toUpperCase()}`,
      };
      saveUserSession(fallbackUser);
      return response;
    }

    throw new Error('अवैध आयडी किंवा पासवर्ड (Invalid ID or Password). Demo Password: password123');
  };

  const logout = () => {
    saveUserSession(null);
  };

  const switchDemoRole = (role: UserRole) => {
    const demo = DEMO_CREDENTIALS.find((d) => d.role === role);
    if (demo) {
      saveUserSession(demo.user);
    }
  };

  const role: UserRole = user?.role || 'owner';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
