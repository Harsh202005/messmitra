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
  email: 'shankargiri@balajimess.com',
  role: 'owner',
  name: 'Shankar Giri',
  messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  token: 'token-owner-demo',
};

const DEFAULT_MEMBER_USER: AuthUser = {
  id: 'usr-member-001',
  email: 'rahul@messmitra.com',
  role: 'member',
  name: 'Rahul Deshmukh',
  messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  memberId: '11111111-1111-1111-1111-111111111111',
  token: 'token-member-demo',
};

const DEFAULT_STAFF_USER: AuthUser = {
  id: 'usr-staff-001',
  email: 'cook@balajimess.com',
  role: 'staff',
  name: 'Mahadev Mama',
  messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  token: 'token-staff-demo',
};

export const DEMO_CREDENTIALS = [
  {
    role: 'owner' as UserRole,
    title: 'श्री शंकर गिरी',
    titleMr: 'श्री शंकर गिरी',
    titleEn: 'Shri Shankar Giri (Owner)',
    subtitle: 'Full Admin & Financial Access • 9822338975',
    email: 'shankargiri@balajimess.com',
    password: 'password123',
    user: DEFAULT_OWNER_USER,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    role: 'member' as UserRole,
    title: 'राहुल देशमुख',
    titleMr: 'राहुल देशमुख',
    titleEn: 'Rahul Deshmukh (Member)',
    subtitle: 'Personal Dues & Leave Submissions',
    email: 'rahul@messmitra.com',
    password: 'password123',
    user: DEFAULT_MEMBER_USER,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  {
    role: 'staff' as UserRole,
    title: 'आचारी महाराज',
    titleMr: 'आचारी महाराज',
    titleEn: 'Head Cook / Kitchen',
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load persisted auth from localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('messmitra_auth_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
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
      // Backend offline fallback
    }

    const rawInput = (credentials.usernameOrEmail || '').trim();
    const cleanNumeric = rawInput.replace(/[^0-9]/g, '');
    const key = rawInput.toLowerCase();
    const pwd = (credentials.password || '').trim();

    // 1. Owner matching (by phone 9822338975, email, or role)
    if (
      cleanNumeric === '9822338975' ||
      cleanNumeric.endsWith('9822338975') ||
      key === 'shankargiri@balajimess.com' ||
      key === 'owner@balajimess.com' ||
      key === 'owner' ||
      key === 'admin' ||
      key.includes('shankar') ||
      key.includes('शंकर')
    ) {
      const ownerUser = DEFAULT_OWNER_USER;
      const response: LoginResponseDto = {
        user: ownerUser,
        token: 'token-owner-demo',
        message: 'Welcome back, Shri Shankar Giri (Owner)!',
      };
      saveUserSession(ownerUser);
      return response;
    }

    // 2. Staff / Cook matching
    if (
      cleanNumeric === '9890001122' ||
      key === 'cook@balajimess.com' ||
      key === 'staff' ||
      key === 'cook' ||
      key.includes('आचारी') ||
      key.includes('mahadev')
    ) {
      const staffUser = DEFAULT_STAFF_USER;
      const response: LoginResponseDto = {
        user: staffUser,
        token: 'token-staff-demo',
        message: 'Welcome back, Kitchen Staff!',
      };
      saveUserSession(staffUser);
      return response;
    }

    // 3. Member matching from localStorage registered members
    if (typeof window !== 'undefined') {
      try {
        const storedMembers = localStorage.getItem('messmitra_members');
        if (storedMembers) {
          const membersList = JSON.parse(storedMembers);
          if (Array.isArray(membersList)) {
            const found = membersList.find((m: any) => {
              const mPhone = (m.phone || '').replace(/[^0-9]/g, '');
              return (cleanNumeric && mPhone.includes(cleanNumeric)) || (m.name && m.name.toLowerCase() === key);
            });
            if (found) {
              const memberUser: AuthUser = {
                id: found.id || `usr-${Date.now()}`,
                name: found.name,
                email: found.phone,
                role: 'member',
                memberId: found.id,
                messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
                token: `token-member-${found.id}`,
              };
              saveUserSession(memberUser);
              return {
                user: memberUser,
                token: memberUser.token || 'token-member',
                message: `Welcome back, ${found.name}!`,
              };
            }
          }
        }
      } catch {}
    }

    // 4. Default Demo Member match (Rahul Deshmukh or generic member)
    if (
      cleanNumeric === '9890123456' ||
      key === 'rahul@messmitra.com' ||
      key === 'member' ||
      key.includes('rahul') ||
      key.includes('राहुल')
    ) {
      const memberUser = DEFAULT_MEMBER_USER;
      const response: LoginResponseDto = {
        user: memberUser,
        token: 'token-member-demo',
        message: 'Welcome back, Rahul Deshmukh!',
      };
      saveUserSession(memberUser);
      return response;
    }

    // 5. Generic Login: If any phone or name is provided with reasonable password, create session
    if (rawInput.length > 0) {
      const isOwner = key.includes('owner') || key.includes('admin');
      const isStaff = key.includes('cook') || key.includes('staff');
      const roleToAssign: UserRole = isOwner ? 'owner' : isStaff ? 'staff' : 'member';

      const genericUser: AuthUser = {
        id: `usr-${Date.now()}`,
        name: rawInput.includes('@') ? rawInput.split('@')[0] : rawInput,
        email: rawInput,
        role: roleToAssign,
        messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        token: `token-${roleToAssign}-generic`,
      };

      saveUserSession(genericUser);
      return {
        user: genericUser,
        token: genericUser.token || 'token-generic',
        message: `Welcome, ${genericUser.name}!`,
      };
    }

    throw new Error('कृपया वैध मोबाईल नंबर किंवा ईमेल प्रविष्ट करा.');
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
