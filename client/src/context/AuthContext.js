import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'clinic' | 'patient'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dv_token');
    const savedUser = localStorage.getItem('dv_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setRole(parsed.role);
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('dv_token', token);
    localStorage.setItem('dv_user', JSON.stringify(userData));
    setUser(userData);
    setRole(userData.role);
  };

  const logout = () => {
    localStorage.removeItem('dv_token');
    localStorage.removeItem('dv_user');
    setUser(null);
    setRole(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('dv_user', JSON.stringify(data.user));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
