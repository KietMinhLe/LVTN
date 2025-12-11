import apiClient from '../lib/api';

// ==================== QUẢN LÝ KHÁCH HÀNG ====================

export interface KhachHang {
  khach_hang_id: number;
  email: string;
  ho_ten: string;
  so_dien_thoai?: string;
  ngay_sinh?: string;
  diem_fpoint: number;
  ngay_tham_gia?: string;
  trang_thai: boolean;
  donhang?: Array<{
    don_hang_id: number;
    ma_don_hang: string;
    tong_tien: number;
    trang_thai: string;
    ngay_dat_hang: string;
  }>;
}

export interface CreateKhachHangRequest {
  email: string;
  mat_khau: string;
  ho_ten: string;
  so_dien_thoai?: string;
  ngay_sinh?: string;
}

export interface UpdateKhachHangRequest {
  ho_ten?: string;
  so_dien_thoai?: string;
  ngay_sinh?: string;
}

export interface KhachHangListResponse {
  message: string;
  success: boolean;
  data: KhachHang[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface KhachHangResponse {
  message: string;
  success: boolean;
  data: KhachHang;
}

export interface SearchKhachHangParams {
  ho_ten?: string;
  email?: string;
  so_dien_thoai?: string;
}

export interface SortKhachHangParams {
  sortBy: 'khach_hang_id' | 'ho_ten' | 'email' | 'so_dien_thoai' | 'ngay_tham_gia' | 'diem_fpoint';
  order: 'asc' | 'desc';
}

// Lấy danh sách khách hàng (có phân trang)
export const getAllKhachHang = async (page: number = 1, limit: number = 10): Promise<KhachHangListResponse> => {
  const response = await apiClient.get<KhachHangListResponse>('/khachhang', {
    params: { page, limit }
  });
  return response.data;
};

// Lấy khách hàng theo ID
export const getKhachHangById = async (id: number): Promise<KhachHang> => {
  const response = await apiClient.get<KhachHangResponse>(`/khachhang/${id}`);
  return response.data.data;
};

// Tìm kiếm khách hàng
export const searchKhachHang = async (params: SearchKhachHangParams): Promise<KhachHang[]> => {
  const response = await apiClient.get<KhachHangListResponse>('/khachhang/search', {
    params
  });
  return response.data.data;
};

// Sắp xếp khách hàng
export const sortKhachHang = async (params: SortKhachHangParams): Promise<KhachHang[]> => {
  const response = await apiClient.get<KhachHangListResponse>('/khachhang/sort', {
    params
  });
  return response.data.data;
};

// Cập nhật thông tin khách hàng
export const updateKhachHang = async (id: number, data: UpdateKhachHangRequest): Promise<KhachHang> => {
  const response = await apiClient.put<KhachHangResponse>(`/khachhang/${id}`, data);
  return response.data.data;
};

// Khóa/Mở khóa khách hàng
export const toggleKhachHangStatus = async (id: number): Promise<KhachHang> => {
  const response = await apiClient.patch<KhachHangResponse>(`/khachhang/${id}/toggle-status`);
  return response.data.data;
};

// Xóa khách hàng (soft delete)
export const deleteKhachHang = async (id: number): Promise<KhachHang> => {
  const response = await apiClient.delete<KhachHangResponse>(`/khachhang/${id}`);
  return response.data.data;
};

// ==================== AUTHENTICATION ====================

export interface UserLoginRequest {
  email: string;
  mat_khau: string;
}

export interface UserRegisterRequest {
  email: string;
  mat_khau: string;
  ho_ten: string;
  so_dien_thoai?: string;
  ngay_sinh?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  ho_ten: string;
  so_dien_thoai?: string;
  ngay_sinh?: string;
  diem_fpoint: number;
  ngay_tham_gia?: string;
}

export interface UserLoginResponse {
  message: string;
  success: boolean;
  token: string;
  khach_hang: UserInfo;
}

export interface UserRegisterResponse {
  message: string;
  success: boolean;
  token: string;
  khach_hang: UserInfo;
}

// Đăng ký khách hàng
export const registerKhachHang = async (data: UserRegisterRequest): Promise<UserRegisterResponse> => {
  try {
    console.log('Sending register request to:', '/khachhang/register', 'with:', { email: data.email });
    const response = await apiClient.post<UserRegisterResponse>('/khachhang/register', data);
    console.log('Register response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in registerKhachHang service:', error);
    throw error;
  }
};

// Đăng nhập khách hàng
export const loginKhachHang = async (credentials: UserLoginRequest): Promise<UserLoginResponse> => {
  try {
    console.log('Sending login request to:', '/khachhang/login', 'with:', { email: credentials.email });
    const response = await apiClient.post<UserLoginResponse>('/khachhang/login', credentials);
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in loginKhachHang service:', error);
    throw error;
  }
};

// Đổi mật khẩu
export interface ChangePasswordRequest {
  mat_khau_cu: string;
  mat_khau_moi: string;
}

export interface ChangePasswordResponse {
  message: string;
  success: boolean;
}

export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  try {
    const response = await apiClient.put<ChangePasswordResponse>('/khachhang/change-password', data);
    return response.data;
  } catch (error) {
    console.error('Error in changePassword service:', error);
    throw error;
  }
};

// Cập nhật profile của chính khách hàng (từ token)
export interface UpdateMyProfileRequest {
  ho_ten?: string;
  so_dien_thoai?: string;
  ngay_sinh?: string;
}

export interface UpdateMyProfileResponse {
  message: string;
  success: boolean;
  data: KhachHang;
}

export const updateMyProfile = async (data: UpdateMyProfileRequest): Promise<KhachHang> => {
  try {
    const response = await apiClient.put<UpdateMyProfileResponse>('/khachhang/profile', data);
    return response.data.data;
  } catch (error) {
    console.error('Error in updateMyProfile service:', error);
    throw error;
  }
};

