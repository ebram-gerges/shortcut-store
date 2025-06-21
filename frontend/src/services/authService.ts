import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post('/api/token/', credentials);
    const { access, refresh } = response.data;
    
    // Store tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Get user profile
    const userResponse = await api.get('/api/accounts/profile/');
    
    return {
      access,
      refresh,
      user: userResponse.data
    };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    // First register the user
    await api.post('/api/accounts/register/', userData);
    
    // Then log them in
    return login({
      username: userData.username,
      password: userData.password
    });
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // Redirect to login page
  window.location.href = '/login';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCurrentUser = async (): Promise<any> => {
  try {
    const response = await api.get('/api/accounts/profile/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};
