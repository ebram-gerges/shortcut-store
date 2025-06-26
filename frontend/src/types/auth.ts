import { User } from './user';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  verifyEmail: (code: string) => Promise<boolean>;
  isVerified: boolean;
  pendingEmail: string | null;
  loading: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  access_token: string;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}
