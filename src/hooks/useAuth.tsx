
import { useState, useEffect, createContext, useContext } from 'react';
import { apiClient } from '@/utils/apiClient';

interface User {
  id: number;
  email: string;
  type: 'papa' | 'maman' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier la session au chargement
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      verifySession(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifySession = async (authToken: string) => {
    try {
      const response = await apiClient.verifyToken(authToken);
      
      if (response.success && response.data) {
        setUser(response.data);
        setToken(authToken);
      } else {
        // Session expirée
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Erreur de vérification de session:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = (authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('auth_token', authToken);
  };

  const logout = async () => {
    if (token) {
      try {
        await apiClient.logout(token);
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    }
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
