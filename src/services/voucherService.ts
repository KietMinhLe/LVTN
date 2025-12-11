import apiClient from "../lib/api";

// ==================== QUẢN LÝ VOUCHER ====================

export interface Voucher {
    voucher_id: number;
    ma_voucher: string;
    loai_giam_gia: string;
    gia_tri_giam: number;
    don_hang_toi_thieu: number | null;
    giam_toi_da: number | null;
    so_luong_toi_da: number | null;
    so_luong_da_dung: number | null;
    ngay_bat_dau: string | null;
    ngay_het_han: string | null;
    trang_thai: boolean | null;
}

export interface VoucherListResponse {
    message: string;
    success: boolean;
    data: Voucher[];
}

export interface VoucherResponse {
    message: string;
    success: boolean;
    data: Voucher;
}

export interface CreateVoucherRequest {
    ma_voucher: string;
    loai_giam_gia: string;
    gia_tri_giam: number;
    don_hang_toi_thieu?: number | null;
    giam_toi_da?: number | null;
    so_luong_toi_da?: number | null;
    ngay_bat_dau?: string | null;
    ngay_het_han?: string | null;
    trang_thai?: boolean;
}

export interface UpdateVoucherRequest {
    ma_voucher?: string;
    loai_giam_gia?: string;
    gia_tri_giam?: number;
    don_hang_toi_thieu?: number | null;
    giam_toi_da?: number | null;
    so_luong_toi_da?: number | null;
    ngay_bat_dau?: string | null;
    ngay_het_han?: string | null;
    trang_thai?: boolean;
}

export interface SearchVoucherParams {
    ma_voucher?: string;
    trang_thai?: string;
}

// Lấy tất cả voucher
export const getAllVoucher = async (): Promise<Voucher[]> => {
    const response = await apiClient.get<VoucherListResponse>('/voucher');
    return response.data.data;
}

// Lấy voucher theo ID
export const getVoucherById = async (id: number): Promise<Voucher> => {
    const response = await apiClient.get<VoucherResponse>(`/voucher/${id}`);
    return response.data.data;
}

// Lấy voucher theo mã voucher
export const getVoucherByCode = async (ma_voucher: string): Promise<Voucher> => {
    const response = await apiClient.get<VoucherResponse>(`/voucher/code/${ma_voucher}`);
    return response.data.data;
}

// Lấy các voucher đang hoạt động
export const getActiveVouchers = async (): Promise<Voucher[]> => {
    const response = await apiClient.get<VoucherListResponse>('/voucher/active');
    return response.data.data;
}

// Tìm kiếm voucher
export const searchVoucher = async (params: SearchVoucherParams): Promise<Voucher[]> => {
    const response = await apiClient.get<VoucherListResponse>('/voucher/search', {
        params: params
    });
    return response.data.data;
}

// Tạo voucher mới
export const createVoucher = async (data: CreateVoucherRequest): Promise<Voucher> => {
    const response = await apiClient.post<VoucherResponse>('/voucher', data);
    return response.data.data;
}

// Cập nhật voucher
export const updateVoucher = async (id: number, data: UpdateVoucherRequest): Promise<Voucher> => {
    const response = await apiClient.put<VoucherResponse>(`/voucher/${id}`, data);
    return response.data.data;
}

// Xóa voucher
export const deleteVoucher = async (id: number): Promise<void> => {
    await apiClient.delete(`/voucher/${id}`);
}