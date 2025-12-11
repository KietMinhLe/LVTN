import apiClient from '../lib/api';

// ==================== QUẢN LÝ ĐỘ TUỔI ====================
export interface DoTuoi {
    do_tuoi_id: number;
    ten_do_tuoi: string;
    tuoi_toi_thieu?: number;
    tuoi_toi_da?: number;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
}

export interface DoTuoiListResponse {
    message: string;
    success: boolean;
    data: DoTuoi[];
}

export interface DoTuoiResponse {
    message: string;
    success: boolean;
    data: DoTuoi;
}

export interface CreateDoTuoiRequest {
    ten_do_tuoi: string;
    tuoi_toi_thieu?: number;
    tuoi_toi_da?: number;
}

export interface UpdateDoTuoiRequest {
    ten_do_tuoi?: string;
    tuoi_toi_thieu?: number;
    tuoi_toi_da?: number;
}

// Lấy danh sách độ tuổi
export const getAllDoTuoi = async (): Promise<DoTuoi[]> => {
    try {
        const response = await apiClient.get<DoTuoiListResponse>('/dotuoi');
        return response.data.data || [];
    } catch (error) {
        const axiosError = error as { response?: { status?: number; data?: { data?: DoTuoi[] } } };
        // Nếu là lỗi 404 và có data: [] trong response, trả về mảng rỗng
        if (axiosError?.response?.status === 404 && axiosError.response.data?.data) {
            return axiosError.response.data.data;
        }
        // Nếu là lỗi 404 nhưng không có data, trả về mảng rỗng
        if (axiosError?.response?.status === 404) {
            return [];
        }
        throw error;
    }
}

// Lấy độ tuổi theo ID
export const getDoTuoiById = async (id: number): Promise<DoTuoi> => {
    const response = await apiClient.get<DoTuoiResponse>(`/dotuoi/${id}`);
    return response.data.data;
}

// Tìm kiếm độ tuổi theo tên
export const searchDoTuoi = async (ten_do_tuoi: string): Promise<DoTuoi[]> => {
    const response = await apiClient.get<DoTuoiListResponse>('/dotuoi/search', {
        params: {
            ten_do_tuoi: ten_do_tuoi
        }
    });
    return response.data.data;
}

// Tạo độ tuổi
export const createDoTuoi = async (data: CreateDoTuoiRequest): Promise<DoTuoi> => {
    const response = await apiClient.post<DoTuoiResponse>('/dotuoi', {
        ten_do_tuoi: data.ten_do_tuoi.trim(),
        tuoi_toi_thieu: data.tuoi_toi_thieu,
        tuoi_toi_da: data.tuoi_toi_da
    });
    return response.data.data;
}

// Cập nhật độ tuổi
export const updateDoTuoi = async (id: number, data: UpdateDoTuoiRequest): Promise<DoTuoi> => {
    const updateData: Record<string, string | number> = {};
    if (data.ten_do_tuoi) updateData.ten_do_tuoi = data.ten_do_tuoi.trim();
    if (data.tuoi_toi_thieu !== undefined) updateData.tuoi_toi_thieu = data.tuoi_toi_thieu;
    if (data.tuoi_toi_da !== undefined) updateData.tuoi_toi_da = data.tuoi_toi_da;
    
    const response = await apiClient.put<DoTuoiResponse>(`/dotuoi/${id}`, updateData);
    return response.data.data;
}

// Xóa độ tuổi
export const deleteDoTuoi = async (id: number): Promise<void> => {
    await apiClient.delete(`/dotuoi/${id}`);
}

// Sắp xếp độ tuổi
export interface SortDoTuoiParams {
    sortBy: 'do_tuoi_id' | 'ten_do_tuoi' | 'ngay_tao';
    order: 'asc' | 'desc';
}

export const sortDoTuoi = async (params: SortDoTuoiParams): Promise<DoTuoi[]> => {
    const response = await apiClient.get<DoTuoiListResponse>('/dotuoi/sort', {
        params
    });
    return response.data.data;
}

