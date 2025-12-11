import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AdminInfo } from '../services/adminService';
import { loginAdmin as apiLoginAdmin, logoutAdmin as apiLogoutAdmin, verifyAdminToken } from '../services/adminService';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

// Giải thích:
// - useState: useState là một hook trong React để quản lý state của component.
// - useEffect: useEffect là một hook trong React để quản lý side effects của component.
// - localStorage: localStorage là một API trong browser để lưu trữ dữ liệu trong browser.
// - toast: toast là một library để hiển thị toast notifications.
// - AxiosError: AxiosError là một class trong axios để xử lý lỗi của axios.
// - AuthContext: AuthContext là một context để quản lý authentication state của component.
// - AuthProvider: AuthProvider là một component để cung cấp authentication state cho các component con.
// - AuthProviderProps: AuthProviderProps là một interface để quản lý props của AuthProvider.
// - children: children là một prop để quản lý các component con của AuthProvider.
// - React.FC: React.FC là một type để quản lý component của React.
// - <AuthProviderProps> là một generic type để quản lý props của AuthProvider.
// - ({ children }: AuthProviderProps) là một destructuring assignment để quản lý props của AuthProvider.
// - children: children là một prop để quản lý các component con của AuthProvider.

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminInfo | null>(null); // State admin
  const [token, setToken] = useState<string | null>(null); // State token
  const [loading, setLoading] = useState(true); // State loading

  // Khôi phục trạng thái từ localStorage khi component mount
  // Khởi tạo state từ localStorage khi component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token'); // Lấy token từ localStorage
    const storedAdmin = localStorage.getItem('admin_info'); // Lấy admin từ localStorage

    if (storedToken && storedAdmin) {
      setToken(storedToken); // Set token
      try {
        setAdmin(JSON.parse(storedAdmin)); // Set admin
        // Xác thực token với server
        verifyAdminToken()
          .then(() => {
            setLoading(false); // Set loading false         
          })
          .catch(() => {
            // Token không hợp lệ, xóa dữ liệu
            localStorage.removeItem('admin_token'); // Xóa token từ localStorage
            localStorage.removeItem('admin_info'); // Xóa admin từ localStorage
            setToken(null); // Set token null
            setAdmin(null); // Set admin null
            setLoading(false); // Set loading false
          });
      } catch {
        localStorage.removeItem('admin_token'); // Xóa token từ localStorage
        localStorage.removeItem('admin_info'); // Xóa admin từ localStorage
        setLoading(false); // Set loading false
      }
    } else {
      setLoading(false); // Set loading false
    }
  }, []);

  // Đăng nhập
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with email:', email); // Debug console.log();
      // Gọi API đăng nhập
      const response = await apiLoginAdmin({ email, mat_khau: password });
      
      console.log('Login response:', response); // Debug log
      
      // Kiểm tra response đầy đủ
      console.log('Checking response:', {
        hasResponse: !!response,
        hasSuccess: !!response?.success,
        hasToken: !!response?.token,
        hasAdmin: !!response?.admin,
        successValue: response?.success,
        tokenLength: response?.token?.length,
        adminKeys: response?.admin ? Object.keys(response.admin) : []
      });

      // Kiểm tra response đầy đủ
      if (response && response.success === true && response.token && response.admin) {
        // Lưu vào localStorage trước
        localStorage.setItem('admin_token', response.token);
        localStorage.setItem('admin_info', JSON.stringify(response.admin));
        
        // Update state - đảm bảo cả hai được set cùng lúc
        setToken(response.token);
        setAdmin(response.admin);
        
        console.log('✅ Login successful! Token and admin saved');
        console.log('Token preview:', response.token.substring(0, 20) + '...');
        console.log('Admin info:', JSON.stringify(response.admin, null, 2));
        
        // Đảm bảo state đã được update
        setTimeout(() => {
          const verifyToken = localStorage.getItem('admin_token');
          const verifyAdmin = localStorage.getItem('admin_info');
          console.log('Verification - Token in storage:', !!verifyToken);
          console.log('Verification - Admin in storage:', !!verifyAdmin);
        }, 100);
        
        toast.success(response.message || 'Đăng nhập thành công');
        return true;
      } else {
        const errorMsg = response?.message || 'Đăng nhập thất bại - Response không hợp lệ';
        toast.error(errorMsg);
        console.error('❌ Login failed - Invalid response structure:', {
          response,
          checks: {
            hasResponse: !!response,
            success: response?.success,
            hasToken: !!response?.token,
            hasAdmin: !!response?.admin
          }
        });
        return false;
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; success?: boolean }>;
      console.error('❌ Login error:', error);
      
      // Kiểm tra loại lỗi
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message.includes('Network Error')) {
        errorMessage = 'Không thể kết nối đến server. Hãy kiểm tra xem backend có đang chạy không.';
        console.error('❌ Network Error - Backend không phản hồi');
        console.error('Vui lòng kiểm tra:');
        console.error('1. Backend có đang chạy không? (http://localhost:5000)');
        console.error('2. Có lỗi CORS không?');
        console.error('3. URL API có đúng không?');
      } else if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        errorMessage = 'Server phản hồi quá chậm. Vui lòng thử lại.';
        console.error('❌ Timeout - Server phản hồi quá chậm');
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
      
      console.error('Error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message,
        code: axiosError.code
      });
      
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiLogoutAdmin();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setAdmin(null);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_info');
      toast.success('Đăng xuất thành công');
    }
  };

  // Tính toán isAuthenticated dựa trên cả token và admin
  const isAuthenticated = Boolean(token && admin);

  const value = {
    admin,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

