import apiClient from '../lib/api';

export interface AdminLoginRequest {
  email: string;
  mat_khau: string;
}

export interface AdminInfo {
  id: number;
  ten_dang_nhap: string;
  ten_hien_thi: string;
  email: string;
}

export interface AdminLoginResponse {
  message: string;
  success: boolean;
  token: string;
  admin: AdminInfo;
}

// Đăng nhập admin
export const loginAdmin = async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
  try {
    console.log('Sending login request to:', '/admin/login', 'with:', { email: credentials.email });
    const response = await apiClient.post<AdminLoginResponse>('/admin/login', credentials);
    console.log('Raw response:', response);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in loginAdmin service:', error);
    throw error;
  }
};

// Xác thực token
export const verifyAdminToken = async () => {
  const response = await apiClient.get<{ success: boolean; admin: AdminInfo }>('/admin/verify');
  return response.data;
};

// Lấy thông tin admin hiện tại
export const getCurrentAdmin = async (): Promise<AdminInfo> => {
  const response = await apiClient.get<{ success: boolean; admin: AdminInfo }>('/admin/profile');
  return response.data.admin;
};

// Đăng xuất admin
export const logoutAdmin = async () => {
  const response = await apiClient.post<{ success: boolean; message: string }>('/admin/logout');
  return response.data;
};

// Lấy thống kê dashboard
export interface DashboardStats {
  totalSach: number;
  totalDonHang: number;
  totalKhachHang: number;
  totalDoanhThu: number;
  changeSach: string;
  changeDonHang: string;
  changeKhachHang: string;
  changeDoanhThu: string;
}

export interface DashboardStatsResponse {
  message: string;
  success: boolean;
  data: DashboardStats;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStatsResponse>('/admin/stats');
  return response.data.data;
};

