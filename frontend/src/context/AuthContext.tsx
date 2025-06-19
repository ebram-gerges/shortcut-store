import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  verifyEmail: (code: string) => Promise<boolean>;
  isVerified: boolean;
  pendingEmail: string | null;
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
  const [isVerified, setIsVerified] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    setUser({
      id: '1',
      email,
      name: email.split('@')[0],
    });
    setIsVerified(true);
    return true;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful signup - set pending email for verification
    setPendingEmail(email);
    setIsVerified(false);
    return true;
  };

  const verifyEmail = async (code: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful verification
    if (code === '123456' && pendingEmail) {
      setUser({
        id: '1',
        email: pendingEmail,
        name: pendingEmail.split('@')[0],
      });
      setIsVerified(true);
      setPendingEmail(null);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsVerified(false);
    setPendingEmail(null);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    verifyEmail,
    isVerified,
    pendingEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};