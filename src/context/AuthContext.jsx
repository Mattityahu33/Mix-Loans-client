import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginRequest } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('mix_loans_admin');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mix_loans_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('mix_loans_token', token);
    } else {
      localStorage.removeItem('mix_loans_token');
    }
  }, [token]);

  useEffect(() => {
    if (admin) {
      localStorage.setItem('mix_loans_admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('mix_loans_admin');
    }
  }, [admin]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await loginRequest(credentials);
      setToken(data.token);
      setAdmin(data.admin);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: Boolean(token),
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
