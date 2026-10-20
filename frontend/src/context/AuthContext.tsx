import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  consentStoreContent: boolean;
  setConsentStoreContent: (val: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, consent?: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [consentStoreContent, setConsentState] = useState<boolean>(() => {
    return localStorage.getItem('scamsense_consent') === 'true';
  });

  const setConsentStoreContent = (val: boolean) => {
    setConsentState(val);
    localStorage.setItem('scamsense_consent', val ? 'true' : 'false');
    if (user) {
      api.updateSettings({ consent_store_content: val }).catch(() => {});
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('scamsense_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await api.getProfile();
      setUser(profile);
      setConsentState(profile.consent_store_content);
    } catch {
      localStorage.removeItem('scamsense_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem('scamsense_token', data.access_token);
    setUser(data.user);
    setConsentState(data.user.consent_store_content);
  };

  const register = async (email: string, password: string, fullName?: string, consent?: boolean) => {
    const data = await api.register({
      email,
      password,
      full_name: fullName,
      consent_store_content: consent,
    });
    localStorage.setItem('scamsense_token', data.access_token);
    setUser(data.user);
    if (consent !== undefined) {
      setConsentStoreContent(consent);
    }
  };

  const logout = () => {
    localStorage.removeItem('scamsense_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        consentStoreContent,
        setConsentStoreContent,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
