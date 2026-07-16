import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8000/api' 
  : 'https://interview-rag-backend.onrender.com/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/signup`, { email, password });
    return res.data;
  };

  const verifyOtp = async (email, otp, password) => {
    const res = await axios.post(`${API_BASE}/auth/verify-otp`, { email, otp });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const signIn = async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const resendOtp = async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/resend-otp`, { email, password });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await axios.post(`${API_BASE}/auth/forgot-password`, { email });
    return res.data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await axios.post(`${API_BASE}/auth/reset-password`, { email, otp, new_password: newPassword });
    return res.data;
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    signUp,
    verifyOtp,
    resendOtp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
