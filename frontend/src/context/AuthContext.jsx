import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error('Session expired:', error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data);
      return res.data.data;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data);
      return res.data.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success) {
      setUser(prev => ({ ...prev, ...res.data.data }));
      return res.data.data;
    }
  };

  const addAddress = async (addressData) => {
    const res = await api.post('/auth/address', addressData);
    if (res.data.success) {
      setUser(prev => ({ ...prev, addresses: res.data.data }));
      return res.data.data;
    }
  };

  const updateAddress = async (id, addressData) => {
    const res = await api.put(`/auth/address/${id}`, addressData);
    if (res.data.success) {
      setUser(prev => ({ ...prev, addresses: res.data.data }));
      return res.data.data;
    }
  };

  const deleteAddress = async (id) => {
    const res = await api.delete(`/auth/address/${id}`);
    if (res.data.success) {
      setUser(prev => ({ ...prev, addresses: res.data.data }));
      return res.data.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        isSuperAdmin: user?.role === 'super_admin',
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
