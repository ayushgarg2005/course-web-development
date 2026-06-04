import { createContext, useContext, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'https://course-web-development.vercel.app';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('accessToken')
  );
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || null);

  // Attach accessToken to every request automatically
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Auto-refresh when server returns 401 + expired: true
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      const isExpired =
        error.response?.status === 401 && error.response?.data?.expired === true;

      if (isExpired && !original._retry) {
        original._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');

          const { data } = await axios.post('/refresh', { refreshToken });

          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(original);
        } catch {
          localStorage.clear();
          setIsAuthenticated(false);
          setUserRole(null);
          window.location.href = '/signin';
        }
      }

      return Promise.reject(error);
    }
  );

  const handleAuthSuccess = ({ accessToken, refreshToken, userId, name, role }) => {
    localStorage.setItem('accessToken',  accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId',       userId);
    if (name) localStorage.setItem('username', name);
    if (role) {
      localStorage.setItem('role', role);
      setUserRole(role);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
    } catch {
      // Continue logout even if request fails
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, handleAuthSuccess, onLogout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
