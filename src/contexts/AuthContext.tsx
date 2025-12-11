import { createContext } from 'react';
import type { AdminInfo } from '../services/adminService';

//Interface để quản lý authentication state của component
interface AuthContextType {
  admin: AdminInfo | null; // Admin info
  token: string | null; // Token
  loading: boolean; // Loading
  isAuthenticated: boolean; // Is authenticated
  login: (email: string, password: string) => Promise<boolean>; // Login
  logout: () => void; // Logout
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); // Auth context

