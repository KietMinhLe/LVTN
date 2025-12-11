import apiClient from '../lib/api';

// ==================== QUẢN LÝ PHƯƠNG THỨC VẬN CHUYỂN ====================
export interface PhuongThucVanChuyen {
    phuong_thuc_van_chuyen_id: number;
    ten_phuong_thuc: string;
    mo_ta: string | null;
    phi_co_ban: number | null;
    trang_thai: boolean | null;
    ngay_tao: string | null;
    ngay_cap_nhat: string | null;
}

export interface PhuongThucVanChuyenListResponse {
    message: string;
    success: boolean;
    data: PhuongThucVanChuyen[];
}

export interface PhuongThucVanChuyenResponse {
    message: string;
    success: boolean;
    data: PhuongThucVanChuyen;
}

export interface CreatePhuongThucVanChuyenRequest {
    ten_phuong_thuc: string;
    mo_ta: string | null;
    phi_co_ban: number | null;
    trang_thai: boolean | null;
}

export interface UpdatePhuongThucVanChuyenRequest {
    ten_phuong_thuc?: string;
    mo_ta?: string | null;
    phi_co_ban?: number | null;
    trang_thai?: boolean | null;
}

//Lấy tất cả phương thức vận chuyển
export const getAllPhuongThucVanChuyen = async () : Promise<PhuongThucVanChuyen[]> => {
    try {
        const response = await apiClient.get<PhuongThucVanChuyenListResponse>('/phuongthucgiaohang');
        return response.data.data || [];
    } catch (error) {
        // Nếu là lỗi 404 và có data: [] trong response, trả về mảng rỗng
        const axiosError = error as { response?: { status?: number; data?: { data?: PhuongThucVanChuyen[] } } };
        if (axiosError?.response?.status === 404) {
            if (axiosError.response.data?.data) {
                return axiosError.response.data.data;
            }
            return [];
        }
        throw error;
    }
}

//Lấy phương thức vận chuyển theo ID
export const getPhuongThucVanChuyenById = async (id: number) : Promise<PhuongThucVanChuyen> => {
    const response = await apiClient.get<PhuongThucVanChuyenResponse>(`/phuongthucgiaohang/${id}`);
    return response.data.data;
}

//Tạo phương thức vận chuyển mới
export const createPhuongThucVanChuyen = async (data: CreatePhuongThucVanChuyenRequest) : Promise<PhuongThucVanChuyen> => {
    const response = await apiClient.post<PhuongThucVanChuyenResponse>('/phuongthucgiaohang', data);
    return response.data.data;
}

//Cập nhật phương thức vận chuyển
export const updatePhuongThucVanChuyen = async (id: number, data: UpdatePhuongThucVanChuyenRequest) : Promise<PhuongThucVanChuyen> => {
    const response = await apiClient.put<PhuongThucVanChuyenResponse>(`/phuongthucgiaohang/${id}`, data);
    return response.data.data;
}

//Xóa phương thức vận chuyển
export const deletePhuongThucVanChuyen = async (id: number) : Promise<void> => {
    await apiClient.delete(`/phuongthucgiaohang/${id}`);
}