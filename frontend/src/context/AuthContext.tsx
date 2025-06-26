import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  login as loginService,
  register as registerService,
  getCurrentUser,
  logout as logoutService,
  isAuthenticated,
  LoginCredentials,
  RegisterData
} from '../services/authService';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';

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
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    name: string,
    height: string,
    weight: string,
    address: string,
    city: string,
    governorate: string,
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

// Extend context types for sync functions
interface CartContextWithSync extends ReturnType<typeof useCart> {
  syncCartWithBackend: () => Promise<void>;
}
interface WishlistContextWithSync extends ReturnType<typeof useWishlist> {
  syncWishlistWithBackend: () => Promise<void>;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { syncCartWithBackend } = useCart() as CartContextWithSync;
  const { syncWishlistWithBackend } = useWishlist() as WishlistContextWithSync;

  useEffect(() => {
    const checkLoggedIn = async () => {
      setIsLoading(true);
      if (isAuthenticated()) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          setIsAuth(true);
          setToken(localStorage.getItem('access_token'));
        } catch (error) {
          console.error('Failed to fetch user on mount', error);
          logoutService();
          setUser(null);
          setIsAuth(false);
          setToken(null);
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
    setToken(response.access);
    localStorage.setItem('access_token', response.access);
    // Sync cart and wishlist after login
    await syncCartWithBackend();
    await syncWishlistWithBackend();
  };

  const register = async (userData: RegisterData) => {
    await registerService(userData);
    return true;
  };

  // New signup function for the signup page
  const signup = async (
    email: string,
    password: string,
    name: string,
    height: string,
    weight: string,
    address: string,
    city: string,
    governorate: string,
    phone: string,
    secondaryPhone: string
  ): Promise<boolean | string> => {
    try {
      // Split the full name into first and last name
      const nameParts = name.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';
      
      await register({
        username: email,
        email,
        password,
        password_confirm: password,
        first_name,
        last_name,
        height,
        weight,
        address,
        city,
        governorate,
        phone,
        secondary_phone: secondaryPhone,
      } as RegisterData & { password_confirm: string; height: string; weight: string; address: string; city: string; governorate: string; phone: string; secondary_phone: string });
      return true;
    } catch (err: unknown) {
      // Try to extract backend error message
      if (err instanceof Error && err.message) {
        return err.message;
    }
    return false;
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setIsAuth(false);
    setToken(null);
    localStorage.removeItem('access_token');
  };

  const authContextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: isAuth,
    login,
    register,
    signup,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};