import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from '../services/api.js';

export interface User {
  _id: string;
  name: string;
  email: string;
  educationLevel: string;
  course: string;
  department: string;
  semester: string;
  profileImage: string;
  xp: number;
  level: number;
  streak: number;
  selectedSubjects: string[];
  createdAt: string;
}

export interface Badge {
  _id: string;
  id: string;
  badgeName: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
}

interface AuthContextType {
  user: User | null;
  badges: Badge[];
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  awardXP: (xp: number, badgeName?: string) => void;
  unlockedBadge: string | null;
  clearUnlockedBadge: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  badges: [],
  token: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  demoLogin: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  refreshUser: async () => {},
  awardXP: () => {},
  unlockedBadge: null,
  clearUnlockedBadge: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const data = await api.auth.me();
      if (data.user) {
        setUser(data.user);
        setBadges(data.badges || []);
      }
    } catch (err) {
      console.warn('Session verification error:', err);
      // If error or token expired, auto fallback to demo login for smooth experience
      demoLogin();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const data = await api.auth.login(credentials);
    if (data.token && data.user) {
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user);
      await fetchCurrentUser();
    }
  };

  const register = async (userData: any) => {
    const data = await api.auth.register(userData);
    if (data.token && data.user) {
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user);
      await fetchCurrentUser();
    }
  };

  const demoLogin = async () => {
    try {
      const data = await api.auth.demoLogin();
      if (data.token && data.user) {
        setToken(data.token);
        setTokenState(data.token);
        setUser(data.user);
        const meData = await api.auth.me();
        setBadges(meData.badges || []);
      }
    } catch (e) {
      console.error('Demo login error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    setBadges([]);
  };

  const updateProfile = async (profileData: any) => {
    const data = await api.auth.updateProfile(profileData);
    if (data.user) {
      setUser(data.user);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const awardXP = (xp: number, badgeName?: string) => {
    if (user) {
      const newXp = user.xp + xp;
      const newLevel = Math.floor(newXp / 400) + 1;
      setUser({ ...user, xp: newXp, level: newLevel });
    }
    if (badgeName) {
      setUnlockedBadge(badgeName);
    }
  };

  const clearUnlockedBadge = () => {
    setUnlockedBadge(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        badges,
        token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        refreshUser,
        awardXP,
        unlockedBadge,
        clearUnlockedBadge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
