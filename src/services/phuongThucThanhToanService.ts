import apiClient from '../lib/api';

// ==================== QUẢN LÝ PHƯƠNG THỨC THANH TOÁN ====================
export interface PhuongThucThanhToan {
    phuong_thuc_thanh_toan_id: number;
    ten_phuong_thuc: string;
    trang_thai: boolean;
    mo_ta: string;
}

export interface PhuongThucThanhToanListResponse {
    message: string;
    success: boolean;
    data: PhuongThucThanhToan[];
}

export interface PhuongThucThanhToanResponse {
    message: string;
    success: boolean;
    data: PhuongThucThanhToan;
}

export interface CreatePhuongThucThanhToanRequest {
    ten_phuong_thuc: string;
    trang_thai: boolean;
    mo_ta: string | null;
}

export interface UpdatePhuongThucThanhToanRequest {
    ten_phuong_thuc?: string;
    trang_thai?: boolean;
    mo_ta?: string | null;
}


// Lấy tất cả phương thức thanh toán
export const getAllPhuongThucThanhToan = async (): Promise<PhuongThucThanhToan[]> => {
    try {
        const response = await apiClient.get<PhuongThucThanhToanListResponse>('/phuongthucthanhtoan');
        return response.data.data || [];
    } catch (error) {
        // Nếu là lỗi 404 và có data: [] trong response, trả về mảng rỗng
        const axiosError = error as { response?: { status?: number; data?: { data?: PhuongThucThanhToan[] } } };
        if (axiosError?.response?.status === 404) {
            if (axiosError.response.data?.data) {
                return axiosError.response.data.data;
            }
            return [];
        }
        throw error;
    }
}

// Lấy phương thức thanh toán theo ID
export const getPhuongThucThanhToanById = async (id: number): Promise<PhuongThucThanhToan> => {
    const response = await apiClient.get<PhuongThucThanhToanResponse>(`/phuongthucthanhtoan/${id}`);
    return response.data.data;
}

// Tạo phương thức thanh toán mới
export const createPhuongThucThanhToan = async (data: CreatePhuongThucThanhToanRequest): Promise<PhuongThucThanhToan> => {
    const response = await apiClient.post<PhuongThucThanhToanResponse>('/phuongthucthanhtoan', data);
    return response.data.data;
}

// Cập nhật phương thức thanh toán
export const updatePhuongThucThanhToan = async (id: number, data: UpdatePhuongThucThanhToanRequest): Promise<PhuongThucThanhToan> => {
    const response = await apiClient.put<PhuongThucThanhToanResponse>(`/phuongthucthanhtoan/${id}`, data);
    return response.data.data;
}

// Xóa phương thức thanh toán
export const deletePhuongThucThanhToan = async (id: number): Promise<void> => {
    await apiClient.delete(`/phuongthucthanhtoan/${id}`);
}

