// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/axios'; // The Axios bridge we built earlier

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if the user already has a valid session cookie when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // We will hit a quick route to verify the token
        const response = await apiClient.get('/auth/me'); 
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    setUser(response.data.user);
    return response.data;
  };

  const signup = async (username, email, password) => {
    const response = await apiClient.post('/auth/signup', { username, email, password });
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};