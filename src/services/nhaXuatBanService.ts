import apiClient from '../lib/api';

// ==================== QUẢN LÝ NHÀ XUẤT BẢN ====================
export interface NhaXuatBan {
    nha_xuat_ban_id: number;
    ten_nha_xuat_ban: string;
    email: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
    so_luong_sach?: number;
}

export interface NhaXuatBanListResponse {
    message: string;
    success: boolean;
    data: NhaXuatBan[];
}

export interface NhaXuatBanResponse {
    message: string;
    success: boolean;
    data: NhaXuatBan;
}

export interface CreateNhaXuatBanRequest {
    ten_nha_xuat_ban: string;
    email: string;
}

export interface UpdateNhaXuatBanRequest {
    ten_nha_xuat_ban?: string;
    email?: string;
}

// Lấy danh sách nhà xuất bản
export const getAllNhaXuatBan = async (): Promise<NhaXuatBan[]> => {
    const response = await apiClient.get<NhaXuatBanListResponse>('/nhaxuatban');
    return response.data.data;
}

// Lấy nhà xuất bản theo ID
export const getNhaXuatBanById = async (id: number): Promise<NhaXuatBan> => {
    const response = await apiClient.get<NhaXuatBanResponse>(`/nhaxuatban/${id}`);
    return response.data.data;
}

// Tìm kiếm nhà xuất bản theo tên
export const searchNhaXuatBan = async (ten_nha_xuat_ban: string): Promise<NhaXuatBan[]> => {
    const response = await apiClient.get<NhaXuatBanListResponse>('/nhaxuatban/search', {
        params: {
            ten_nha_xuat_ban: ten_nha_xuat_ban
        }
    });
    return response.data.data;
}

// Tạo nhà xuất bản
export const createNhaXuatBan = async (data: CreateNhaXuatBanRequest): Promise<NhaXuatBan> => {
    const response = await apiClient.post<NhaXuatBanResponse>('/nhaxuatban', {
        ten_nha_xuat_ban: data.ten_nha_xuat_ban.trim(),
        email: data.email.trim()
    });
    return response.data.data;
}

// Cập nhật nhà xuất bản
export const updateNhaXuatBan = async (id: number, data: UpdateNhaXuatBanRequest): Promise<NhaXuatBan> => {
    const updateData: Record<string, string> = {};
    if (data.ten_nha_xuat_ban) updateData.ten_nha_xuat_ban = data.ten_nha_xuat_ban.trim();
    if (data.email) updateData.email = data.email.trim();
    
    const response = await apiClient.put<NhaXuatBanResponse>(`/nhaxuatban/${id}`, updateData);
    return response.data.data;
}

// Xóa nhà xuất bản
export const deleteNhaXuatBan = async (id: number): Promise<void> => {
    await apiClient.delete(`/nhaxuatban/${id}`);
}