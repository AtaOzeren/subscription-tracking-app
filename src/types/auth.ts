export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  currency?: string;
  region?: string;
  avatar?: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
  subscription_count?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponseData {
  id: number;
  name: string;
  email: string;
  role: string;
  region?: string;
  currency?: string;
  last_login_at?: string;
  token: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isFirstTimeUser: boolean;
}