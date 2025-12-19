import apiClient from '../lib/api';

// ==================== QUẢN LÝ TÁC GIẢ ====================
export interface TacGia {
    tac_gia_id: number;
    ten_tac_gia: string;
    tieu_su?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
    so_luong_sach?: number;
}

export interface TacGiaListResponse {
    message: string;
    success: boolean;
    data: TacGia[];     
}

export interface TacGiaResponse {
    message: string;
    success: boolean;
    data: TacGia;
}

export interface CreateTacGiaRequest {
    ten_tac_gia: string;
    tieu_su?: string;
}

export interface UpdateTacGiaRequest {
    ten_tac_gia?: string;
    tieu_su?: string;
}

// Lấy danh sách tác giả
export const getAllTacGia = async (): Promise<TacGia[]> => {
    const response = await apiClient.get<TacGiaListResponse>('/tacgia');
    return response.data.data;
}

// Lấy tác giả theo ID
export const getTacGiaById = async (id: number): Promise<TacGia> => {
    const response = await apiClient.get<TacGiaResponse>(`/tacgia/${id}`);
    return response.data.data;
}

// Tìm kiếm tác giả theo tên
export const searchTacGia = async (ten_tac_gia: string): Promise<TacGia[]> => {
    const response = await apiClient.get<TacGiaListResponse>('/tacgia/search', {
        params: {
            ten_tac_gia: ten_tac_gia
        }
    });
    return response.data.data;
}

// Tạo tác giả
export const createTacGia = async (data: CreateTacGiaRequest): Promise<TacGia> => {
    const response = await apiClient.post<TacGiaResponse>('/tacgia', {
        ten_tac_gia: data.ten_tac_gia.trim(),
        tieu_su: data.tieu_su?.trim() || ''
    });
    return response.data.data;
}

// Cập nhật tác giả
export const updateTacGia = async (id: number, data: UpdateTacGiaRequest): Promise<TacGia> => {
    const updateData: Record<string, string> = {};
    if (data.ten_tac_gia) updateData.ten_tac_gia = data.ten_tac_gia.trim();
    if (data.tieu_su !== undefined) updateData.tieu_su = data.tieu_su.trim() || '';
    
    const response = await apiClient.put<TacGiaResponse>(`/tacgia/${id}`, updateData);
    return response.data.data;
}

// Xóa tác giả
export const deleteTacGia = async (id: number): Promise<void> => {
    await apiClient.delete(`/tacgia/${id}`);
}