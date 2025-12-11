import apiClient from '../lib/api';

// ==================== QUẢN LÝ NGƯỜI BIÊN DỊCH ====================
export interface NguoiBienDich {
    nguoi_bien_dich_id: number;
    ten_nguoi_bien_dich: string;
    tieu_su?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
}

export interface NguoiBienDichListResponse {
    message: string;
    success: boolean;
    data: NguoiBienDich[];
}

export interface NguoiBienDichResponse {
    message: string;
    success: boolean;
    data: NguoiBienDich;
}

export interface CreateNguoiBienDichRequest {
    ten_nguoi_bien_dich: string;
    tieu_su?: string;
}

export interface UpdateNguoiBienDichRequest {
    ten_nguoi_bien_dich?: string;
    tieu_su?: string;
}

// Lấy danh sách người biên dịch
export const getAllNguoiBienDich = async (): Promise<NguoiBienDich[]> => {
    try {
        const response = await apiClient.get<NguoiBienDichListResponse>('/nguoibiendich');
        return response.data.data || [];
    } catch (error) {
        // Nếu là lỗi 404 và có data: [] trong response, trả về mảng rỗng
        const axiosError = error as { response?: { status?: number; data?: { data?: NguoiBienDich[] } } };
        if (axiosError?.response?.status === 404) {
            if (axiosError.response.data?.data) {
                return axiosError.response.data.data;
            }
            return [];
        }
        throw error;
    }
}

// Lấy người biên dịch theo ID
export const getNguoiBienDichById = async (id: number): Promise<NguoiBienDich> => {
    const response = await apiClient.get<NguoiBienDichResponse>(`/nguoibiendich/${id}`);
    return response.data.data;
}

// Tìm kiếm người biên dịch theo tên
export const searchNguoiBienDich = async (ten_nguoi_bien_dich: string): Promise<NguoiBienDich[]> => {
    const response = await apiClient.get<NguoiBienDichListResponse>('/nguoibiendich/search', {
        params: {
            ten_nguoi_bien_dich: ten_nguoi_bien_dich
        }
    });
    return response.data.data;
}

// Tạo người biên dịch
export const createNguoiBienDich = async (data: CreateNguoiBienDichRequest): Promise<NguoiBienDich> => {
    const response = await apiClient.post<NguoiBienDichResponse>('/nguoibiendich', {
        ten_nguoi_bien_dich: data.ten_nguoi_bien_dich.trim()
    });
    return response.data.data;
}

// Cập nhật người biên dịch
export const updateNguoiBienDich = async (id: number, data: UpdateNguoiBienDichRequest): Promise<NguoiBienDich> => {
    const updateData: Record<string, string> = {};
    if (data.ten_nguoi_bien_dich) updateData.ten_nguoi_bien_dich = data.ten_nguoi_bien_dich.trim();
    
    const response = await apiClient.put<NguoiBienDichResponse>(`/nguoibiendich/${id}`, updateData);
    return response.data.data;
}

// Xóa người biên dịch
export const deleteNguoiBienDich = async (id: number): Promise<void> => {
    await apiClient.delete(`/nguoibiendich/${id}`);
}

// Sắp xếp người biên dịch
export interface SortNguoiBienDichParams {
    sortBy: 'nguoi_bien_dich_id' | 'ten_nguoi_bien_dich' | 'ngay_tao';
    order: 'asc' | 'desc';
}

export const sortNguoiBienDich = async (params: SortNguoiBienDichParams): Promise<NguoiBienDich[]> => {
    const response = await apiClient.get<NguoiBienDichListResponse>('/nguoibiendich/sort', {
        params
    });
    return response.data.data;
}

