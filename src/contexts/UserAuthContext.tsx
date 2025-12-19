import { createContext } from 'react';
import type { UserInfo } from '../services/khachHangService';

// Interface để quản lý authentication state của user
export interface UserAuthContextType {
  user: UserInfo | null; // User info
  token: string | null; // Token
  loading: boolean; // Loading
  isAuthenticated: boolean; // Is authenticated
  login: (email: string, password: string) => Promise<boolean>; // Login
  loginFacebook: () => Promise<boolean>; // Login with Facebook
  register: (email: string, password: string, ho_ten: string, so_dien_thoai?: string, ngay_sinh?: string) => Promise<boolean>; // Register
  logout: () => void; // Logout
  updateUser: (userData: UserInfo) => void; // Update user info
}

export const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined); // User Auth context

