import apiClient from '../lib/api';
import type { GioHang } from './gioHangService';
import type { Sach } from './sachService';

// ==================== QUẢN LÝ CHI TIẾT GIỎ HÀNG ====================
export interface ChiTietGioHang {
  chi_tiet_gio_hang_id: number;
  gio_hang_id: number;
  sach_id: number;
  so_luong: number;
  ngay_tao?: string;
  sach?: Sach;
  giohang?: GioHang;
}

export interface ChiTietGioHangListResponse {
  message: string;
  success: boolean;
  data: ChiTietGioHang[];
}

export interface ChiTietGioHangResponse {
  message: string;
  success: boolean;
  data: ChiTietGioHang;
}

export interface CreateChiTietGioHangRequest {
  gio_hang_id: number;
  sach_id: number;
  so_luong: number;
}

export interface UpdateChiTietGioHangRequest {
  so_luong: number;
}

// Lấy tất cả chi tiết giỏ hàng
export const getAllChiTietGioHang = async (): Promise<ChiTietGioHang[]> => {
  const response = await apiClient.get<ChiTietGioHangListResponse>('/chitietgiohang');
  return response.data.data || [];
};

// Lấy chi tiết giỏ hàng theo ID
export const getChiTietGioHangById = async (id: number): Promise<ChiTietGioHang> => {
  const response = await apiClient.get<ChiTietGioHangResponse>(`/chitietgiohang/${id}`);
  return response.data.data;
};

// Lấy chi tiết giỏ hàng theo giỏ hàng ID
export const getChiTietGioHangByGioHangId = async (gioHangId: number): Promise<ChiTietGioHang[]> => {
  try {
    const response = await apiClient.get<ChiTietGioHangListResponse>(`/chitietgiohang/giohang/${gioHangId}`);
    return response.data.data || [];
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

// Thêm sách vào giỏ hàng
export const createChiTietGioHang = async (data: CreateChiTietGioHangRequest): Promise<ChiTietGioHang> => {
  const response = await apiClient.post<ChiTietGioHangResponse>('/chitietgiohang', {
    gio_hang_id: data.gio_hang_id,
    sach_id: data.sach_id,
    so_luong: data.so_luong
  });
  return response.data.data;
};

// Cập nhật số lượng sách trong giỏ hàng
export const updateChiTietGioHang = async (id: number, data: UpdateChiTietGioHangRequest): Promise<ChiTietGioHang> => {
  const response = await apiClient.put<ChiTietGioHangResponse>(`/chitietgiohang/${id}`, {
    so_luong: data.so_luong
  });
  return response.data.data;
};

// Xóa sách khỏi giỏ hàng
export const deleteChiTietGioHang = async (id: number): Promise<void> => {
  await apiClient.delete(`/chitietgiohang/${id}`);
};

// Xóa tất cả sách trong giỏ hàng
export const deleteAllChiTietGioHangByGioHangId = async (gioHangId: number): Promise<void> => {
  await apiClient.delete(`/chitietgiohang/giohang/${gioHangId}/all`);
};

