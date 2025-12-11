import apiClient from '../lib/api';
import type { KhachHang } from './khachHangService';

// ==================== QUẢN LÝ GIỎ HÀNG ====================
export interface GioHang {
  gio_hang_id: number;
  khach_hang_id?: number;
  session_id?: string;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
  khachhang?: KhachHang;
}

export interface GioHangListResponse {
  message: string;
  success: boolean;
  data: GioHang[];
}

export interface GioHangResponse {
  message: string;
  success: boolean;
  data: GioHang;
}

// Lấy giỏ hàng theo ID
export const getGioHangById = async (id: number): Promise<GioHang> => {
  const response = await apiClient.get<GioHangResponse>(`/giohang/${id}`);
  return response.data.data;
};

// Tạo giỏ hàng mới hoặc lấy giỏ hàng hiện có
export const createGioHang = async (khachHangId?: number, sessionId?: string): Promise<GioHang> => {
  const response = await apiClient.post<GioHangResponse>('/giohang', {
    khach_hang_id: khachHangId || null,
    session_id: sessionId || null
  });
  return response.data.data;
};

// Lấy hoặc tạo giỏ hàng
export const getOrCreateGioHang = async (khachHangId?: number, sessionId?: string): Promise<GioHang> => {
  // Tạo hoặc lấy giỏ hàng (backend sẽ tự động kiểm tra và trả về giỏ hàng hiện có nếu đã có)
  return await createGioHang(khachHangId, sessionId);
};

// Xóa giỏ hàng
export const deleteGioHang = async (id: number): Promise<void> => {
  await apiClient.delete(`/giohang/${id}`);
};

