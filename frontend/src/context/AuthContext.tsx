import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Business, authApi, LoginRequest, SignupRequest } from '../api/auth';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  signup: (data: SignupRequest) => Promise<User>;
  logout: () => void;
  updateBusinessState: (business: Business) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('bizflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('bizflow_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.getMe();
      setUser(data.user);
      if (data.business) {
        setBusiness(data.business);
      }
      setToken(savedToken);
    } catch {
      localStorage.removeItem('bizflow_token');
      setToken(null);
      setUser(null);
      setBusiness(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem('bizflow_token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      if (data.business) {
        setBusiness(data.business);
      }
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupRequest): Promise<User> => {
    setIsLoading(true);
    try {
      const authData = await authApi.signup(data);
      localStorage.setItem('bizflow_token', authData.accessToken);
      setToken(authData.accessToken);
      setUser(authData.user);
      if (authData.business) {
        setBusiness(authData.business);
      }
      return authData.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    localStorage.removeItem('bizflow_token');
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  const updateBusinessState = (updatedBusiness: Business) => {
    setBusiness(updatedBusiness);
  };

  const refreshUser = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      if (data.business) {
        setBusiness(data.business);
      }
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        logout,
        updateBusinessState,
        refreshUser,
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
