import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  login as loginService,
  register as registerService,
  getCurrentUser,
  logout as logoutService,
  isAuthenticated,
  AuthResponse,
  LoginCredentials,
  RegisterData
} from '../services/authService';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_color: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  signup: (
    email: string,
    password: string,
    name: string,
    height: string,
    weight: string,
    address: string,
    phone: string,
    secondaryPhone: string
  ) => Promise<boolean | string>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      setIsLoading(true);
      if (isAuthenticated()) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          setIsAuth(true);
        } catch (error) {
          console.error('Failed to fetch user on mount', error);
          logoutService();
          setUser(null);
          setIsAuth(false);
        }
      }
      setIsLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await loginService(credentials);
    setUser(response.user);
    setIsAuth(true);
  };

  const register = async (userData: RegisterData) => {
    const response = await registerService(userData);
    setUser(response.user);
    setIsAuth(true);
    return response;
  };

  // New signup function for the signup page
  const signup = async (
    email: string,
    password: string,
    name: string,
    height: string,
    weight: string,
    address: string,
    phone: string,
    secondaryPhone: string
  ): Promise<boolean | string> => {
    try {
      await register({
        username: email,
        email,
        password,
        password_confirm: password,
        first_name: name,
        height,
        weight,
        address,
        phone,
        secondary_phone: secondaryPhone,
      } as RegisterData & { password_confirm: string; height: string; weight: string; address: string; phone: string; secondary_phone: string });
      return true;
    } catch (err: any) {
      // Try to extract backend error message
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') return err.response.data;
        if (typeof err.response.data.detail === 'string') return err.response.data.detail;
        // If it's an object, join all error messages
        if (typeof err.response.data === 'object') {
          return Object.values(err.response.data).flat().join(' ');
        }
      }
      return false;
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setIsAuth(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: isAuth,
    login,
    register,
    signup,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};