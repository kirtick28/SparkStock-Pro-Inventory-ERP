import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('cracker_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        setUser({ token, ...decodedToken });
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('cracker_token');
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token) => {
    const decodedToken = jwtDecode(token);
    localStorage.setItem('cracker_token', token);
    setUser({ token, ...decodedToken });
  };

  const logout = () => {
    localStorage.removeItem('cracker_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
