import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('localmarket_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on initial mount if token exists
  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await authService.getMe();
          setCurrentUser(res.data.user);
        } catch (error) {
          console.error('Failed to authenticate token:', error);
          localStorage.removeItem('localmarket_token');
          setToken(null);
          setCurrentUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { token: newToken, user } = res.data;
    localStorage.setItem('localmarket_token', newToken);
    setToken(newToken);
    setCurrentUser(user);
    return user;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token: newToken, user } = res.data;
    localStorage.setItem('localmarket_token', newToken);
    setToken(newToken);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore logout API error
    } finally {
      localStorage.removeItem('localmarket_token');
      setToken(null);
      setCurrentUser(null);
    }
  };

  const changePassword = async (passwords) => {
    const res = await authService.changePassword(passwords);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        login,
        register,
        logout,
        changePassword,
        isAuthenticated: !!currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
