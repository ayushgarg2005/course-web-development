import { createContext, useContext, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'https://course-web-development.onrender.com';

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

  // Handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
        window.location.href = '/signin';
      }
      return Promise.reject(error);
    }
  );

  const handleAuthSuccess = ({ accessToken, userId, name, role }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('userId',      userId);
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
