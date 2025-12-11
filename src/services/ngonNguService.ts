import apiClient from '../lib/api';

// ==================== QUẢN LÝ NGÔN NGỮ ====================
export interface NgonNgu {
    ngon_ngu_id: number;
    ten_ngon_ngu: string;
    ma_ngon_ngu?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
}

export interface NgonNguListResponse {
    message: string;
    success: boolean;
    data: NgonNgu[];
}

export interface NgonNguResponse {
    message: string;
    success: boolean;
    data: NgonNgu;
}

export interface CreateNgonNguRequest {
    ten_ngon_ngu: string;
    ma_ngon_ngu?: string;
}

export interface UpdateNgonNguRequest {
    ten_ngon_ngu?: string;
    ma_ngon_ngu?: string;
}

// Lấy danh sách ngôn ngữ
export const getAllNgonNgu = async (): Promise<NgonNgu[]> => {
    try {
        const response = await apiClient.get<NgonNguListResponse>('/ngonngu');
        return response.data.data || [];
    } catch (error) {
        // Nếu là lỗi 404 và có data: [] trong response, trả về mảng rỗng
        const axiosError = error as { response?: { status?: number; data?: { data?: NgonNgu[] } } };
        if (axiosError?.response?.status === 404) {
            if (axiosError.response.data?.data) {
                return axiosError.response.data.data;
            }
            return [];
        }
        throw error;
    }
}

// Lấy ngôn ngữ theo ID
export const getNgonNguById = async (id: number): Promise<NgonNgu> => {
    const response = await apiClient.get<NgonNguResponse>(`/ngonngu/${id}`);
    return response.data.data;
}

// Tìm kiếm ngôn ngữ theo tên
export const searchNgonNgu = async (ten_ngon_ngu: string): Promise<NgonNgu[]> => {
    const response = await apiClient.get<NgonNguListResponse>('/ngonngu/search', {
        params: {
            ten_ngon_ngu: ten_ngon_ngu
        }
    });
    return response.data.data;
}

// Tạo ngôn ngữ
export const createNgonNgu = async (data: CreateNgonNguRequest): Promise<NgonNgu> => {
    const response = await apiClient.post<NgonNguResponse>('/ngonngu', {
        ten_ngon_ngu: data.ten_ngon_ngu.trim(),
        ma_ngon_ngu: data.ma_ngon_ngu?.trim() || ''
    });
    return response.data.data;
}

// Cập nhật ngôn ngữ
export const updateNgonNgu = async (id: number, data: UpdateNgonNguRequest): Promise<NgonNgu> => {
    const updateData: Record<string, string> = {};
    if (data.ten_ngon_ngu) updateData.ten_ngon_ngu = data.ten_ngon_ngu.trim();
    if (data.ma_ngon_ngu !== undefined) updateData.ma_ngon_ngu = data.ma_ngon_ngu.trim() || '';
    
    const response = await apiClient.put<NgonNguResponse>(`/ngonngu/${id}`, updateData);
    return response.data.data;
}

// Xóa ngôn ngữ
export const deleteNgonNgu = async (id: number): Promise<void> => {
    await apiClient.delete(`/ngonngu/${id}`);
}

// Sắp xếp ngôn ngữ
export interface SortNgonNguParams {
    sortBy: 'ngon_ngu_id' | 'ten_ngon_ngu' | 'ma_ngon_ngu' | 'ngay_tao';
    order: 'asc' | 'desc';
}

export const sortNgonNgu = async (params: SortNgonNguParams): Promise<NgonNgu[]> => {
    const response = await apiClient.get<NgonNguListResponse>('/ngonngu/sort', {
        params
    });
    return response.data.data;
}

