import apiClient from '../lib/api';

// ==================== QUẢN LÝ THƯƠNG HIỆU ====================
export interface ThuongHieu {
    thuong_hieu_id: number;
    ten_thuong_hieu: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
    so_luong_sach?: number;
}

export interface ThuongHieuListResponse {
    message: string;
    success: boolean;
    data: ThuongHieu[];
}

export interface ThuongHieuResponse {
    message: string;
    success: boolean;
    data: ThuongHieu;
}

export interface CreateThuongHieuRequest {
    ten_thuong_hieu: string;
}

export interface UpdateThuongHieuRequest {
    ten_thuong_hieu?: string;
}

// Lấy danh sách thương hiệu
export const getAllThuongHieu = async (): Promise<ThuongHieu[]> => {
    const response = await apiClient.get<ThuongHieuListResponse>('/thuonghieu');
    return response.data.data;
}

// Lấy thương hiệu theo ID
export const getThuongHieuById = async (id: number): Promise<ThuongHieu> => {
    const response = await apiClient.get<ThuongHieuResponse>(`/thuonghieu/${id}`);
    return response.data.data;
}

// Tìm kiếm thương hiệu theo tên
export const searchThuongHieu = async (ten_thuong_hieu: string): Promise<ThuongHieu[]> => {
    const response = await apiClient.get<ThuongHieuListResponse>('/thuonghieu/search', {
        params: {
            ten_thuong_hieu: ten_thuong_hieu
        }
    });
    return response.data.data;
}

// Tạo thương hiệu
export const createThuongHieu = async (data: CreateThuongHieuRequest): Promise<ThuongHieu> => {
    const response = await apiClient.post<ThuongHieuResponse>('/thuonghieu', {
        ten_thuong_hieu: data.ten_thuong_hieu.trim()
    });
    return response.data.data;
}

// Cập nhật thương hiệu
export const updateThuongHieu = async (id: number, data: UpdateThuongHieuRequest): Promise<ThuongHieu> => {
    const updateData: Record<string, string> = {};
    if (data.ten_thuong_hieu) updateData.ten_thuong_hieu = data.ten_thuong_hieu.trim();
    const response = await apiClient.put<ThuongHieuResponse>(`/thuonghieu/${id}`, updateData);
    return response.data.data;
}

// Xóa thương hiệu
export const deleteThuongHieu = async (id: number): Promise<void> => {
    await apiClient.delete(`/thuonghieu/${id}`);
}