import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserInfo } from '../services/khachHangService';
import { loginKhachHang, registerKhachHang } from '../services/khachHangService';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { UserAuthContext } from './UserAuthContext';

interface UserAuthProviderProps {
  children: ReactNode;
}

export const UserAuthProvider: React.FC<UserAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null); // State user
  const [token, setToken] = useState<string | null>(null); // State token
  const [loading, setLoading] = useState(true); // State loading

  // Khôi phục trạng thái từ localStorage khi component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('user_token'); // Lấy token từ localStorage
    const storedUser = localStorage.getItem('user_info'); // Lấy user từ localStorage

    if (storedToken && storedUser) {
      setToken(storedToken); // Set token
      try {
        setUser(JSON.parse(storedUser)); // Set user
      } catch {
        localStorage.removeItem('user_token'); // Xóa token từ localStorage
        localStorage.removeItem('user_info'); // Xóa user từ localStorage
      }
    }
    setLoading(false); // Set loading false
  }, []);

  // Đăng ký
  const register = async (
    email: string,
    password: string,
    ho_ten: string,
    so_dien_thoai?: string,
    ngay_sinh?: string
  ): Promise<boolean> => {
    try {
      console.log('Attempting register with email:', email);
      // Gọi API đăng ký
      const response = await registerKhachHang({
        email,
        mat_khau: password,
        ho_ten,
        so_dien_thoai,
        ngay_sinh
      });

      console.log('Register response:', response);

      // Kiểm tra response đầy đủ
      if (response && response.success === true && response.token && response.khach_hang) {
        // Lưu vào localStorage
        localStorage.setItem('user_token', response.token);
        localStorage.setItem('user_info', JSON.stringify(response.khach_hang));

        // Update state
        setToken(response.token);
        setUser(response.khach_hang);

        console.log('✅ Register successful! Token and user saved');
        toast.success(response.message || 'Đăng ký thành công');
        return true;
      } else {
        const errorMsg = response?.message || 'Đăng ký thất bại - Response không hợp lệ';
        toast.error(errorMsg);
        console.error('❌ Register failed - Invalid response structure:', response);
        return false;
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; success?: boolean }>;
      console.error('❌ Register error:', error);

      // Kiểm tra loại lỗi
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';

      if (axiosError.code === 'ERR_NETWORK' || axiosError.message.includes('Network Error')) {
        errorMessage = 'Không thể kết nối đến server. Hãy kiểm tra xem backend có đang chạy không.';
        console.error('❌ Network Error - Backend không phản hồi');
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

  // Đăng nhập
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with email:', email);
      // Gọi API đăng nhập
      const response = await loginKhachHang({ email, mat_khau: password });

      console.log('Login response:', response);

      // Kiểm tra response đầy đủ
      if (response && response.success === true && response.token && response.khach_hang) {
        // Lưu thông tin khách hàng
        localStorage.setItem('khach_hang_info', JSON.stringify(response.khach_hang));
        
        // Lưu vào localStorage
        localStorage.setItem('user_token', response.token);
        localStorage.setItem('user_info', JSON.stringify(response.khach_hang));

        // Update state
        setToken(response.token);
        setUser(response.khach_hang);

        // Xóa session cũ và gio_hang_id cũ để load lại giỏ hàng của user
        localStorage.removeItem('gio_hang_id');
        sessionStorage.removeItem('session_id');

        // Dispatch event để CartContext load lại giỏ hàng của user
        window.dispatchEvent(new Event('userLogin'));

        console.log('✅ Login successful! Token and user saved');
        toast.success(response.message || 'Đăng nhập thành công');
        return true;
      } else {
        const errorMsg = response?.message || 'Đăng nhập thất bại - Response không hợp lệ';
        toast.error(errorMsg);
        console.error('❌ Login failed - Invalid response structure:', response);
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
      // KHÔNG xóa giỏ hàng trên backend - giữ lại để khi đăng nhập lại vẫn còn
      // Chỉ xóa thông tin đăng nhập và session
      
      // Xóa thông tin đăng nhập
      setToken(null);
      setUser(null);
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('khach_hang_info');
      
      // Xóa session và gio_hang_id để CartContext tự tạo session mới khi cần
      // Giỏ hàng vẫn được lưu trên backend theo khach_hang_id
      localStorage.removeItem('gio_hang_id');
      sessionStorage.removeItem('session_id');
      
      // Dispatch event để CartContext reset (nhưng giỏ hàng vẫn còn trên backend)
      window.dispatchEvent(new Event('userLogout'));
      
      toast.success('Đăng xuất thành công');
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn tiếp tục logout ngay cả khi có lỗi
      setToken(null);
      setUser(null);
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('khach_hang_info');
      localStorage.removeItem('gio_hang_id');
      sessionStorage.removeItem('session_id');
      toast.success('Đăng xuất thành công');
    }
  };

  // Cập nhật thông tin user
  const updateUser = (userData: UserInfo) => {
    setUser(userData);
    localStorage.setItem('user_info', JSON.stringify(userData));
    localStorage.setItem('khach_hang_info', JSON.stringify(userData));
  };

  // Tính toán isAuthenticated dựa trên cả token và user
  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
};

