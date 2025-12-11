import apiClient from "../lib/api";

// ==================== QUẢN LÝ ĐƠN HÀNG ====================

export interface ChiTietDonHang {
    chi_tiet_don_hang_id: number;
    don_hang_id: number;
    sach_id: number;
    so_luong: number;
    gia_luc_mua: number;
    sach?: {
        sach_id: number;
        ten_sach: string;
        anh_bia_url?: string | null;
        anhsach?: Array<{
            anh_sach_id: number;
            url: string;
            thu_tu?: number;
        }>;
    };
}

export interface DonHang {
    don_hang_id: number;
    ma_don_hang: string;
    ten_nguoi_nhan: string;
    email_nguoi_nhan: string | null;
    sdt_nguoi_nhan: string;
    dia_chi_giao_hang: string;
    tam_tinh: number;
    phi_van_chuyen: number | null;
    giam_gia_voucher: number | null;
    tong_tien: number;
    trang_thai: string;
    ngay_dat_hang: string | null;
    ngay_cap_nhat: string | null;
    voucher_id: number | null;
    phuong_thuc_thanh_toan_id: number | null;
    khach_hang_id: number | null;
    phuong_thuc_van_chuyen_id: number | null;
    khachhang?: {
        khach_hang_id: number;
        ho_ten: string;
        email: string;
    } | null;
    phuongthucthanhtoan?: {
        phuong_thuc_thanh_toan_id: number;
        ten_phuong_thuc: string;
    } | null;
    phuongthucvanchuyen?: {
        phuong_thuc_van_chuyen_id: number;
        ten_phuong_thuc: string;
    } | null;
    voucher?: {
        voucher_id: number;
        ma_voucher: string;
    } | null;
    chitietdonhang?: ChiTietDonHang[];
}

export interface DonHangListResponse {
    message: string;
    success: boolean;
    data: DonHang[];
}

export interface DonHangResponse {
    message: string;
    success: boolean;
    data: DonHang;
}

export interface CreateDonHangRequest {
    khach_hang_id?: number | null;
    ten_nguoi_nhan: string;
    email_nguoi_nhan: string | null;
    sdt_nguoi_nhan: string;
    dia_chi_giao_hang: string;
    phuong_thuc_thanh_toan_id: number;
    phuong_thuc_van_chuyen_id: number;
    voucher_id?: number | null;
    tam_tinh: number;
    phi_van_chuyen?: number | null;
    giam_gia_voucher?: number | null;
    tong_tien: number;
    chi_tiet_don_hang: Array<{
        sach_id: number;
        so_luong: number;
        gia_luc_mua: number;
    }>;
}

export interface UpdateDonHangRequest {
    ten_nguoi_nhan?: string;
    email_nguoi_nhan?: string | null;
    sdt_nguoi_nhan?: string;
    dia_chi_giao_hang?: string;
    phuong_thuc_thanh_toan_id?: number;
    phuong_thuc_van_chuyen_id?: number;
    voucher_id?: number | null;
    tam_tinh?: number;
    phi_van_chuyen?: number;
    giam_gia_voucher?: number;
    tong_tien?: number;
    trang_thai?: string;
}

// Tạo đơn hàng mới
export const createDonHang = async (data: CreateDonHangRequest): Promise<DonHang> => {
    const response = await apiClient.post<DonHangResponse>('/donhang', data);
    return response.data.data;
}

// Lấy tất cả đơn hàng
export const getAllDonHang = async (): Promise<DonHang[]> => {
    const response = await apiClient.get<DonHangListResponse>('/donhang');
    return response.data.data;
}

// Lấy đơn hàng theo ID
export const getDonHangById = async (id: number): Promise<DonHang> => {
    const response = await apiClient.get<DonHangResponse>(`/donhang/${id}`);
    return response.data.data;
}

// Cập nhật đơn hàng
export const updateDonHang = async (id: number, data: UpdateDonHangRequest): Promise<DonHang> => {
    const response = await apiClient.put<DonHangResponse>(`/donhang/${id}`, data);
    return response.data.data;
}

// Xóa đơn hàng
export const deleteDonHang = async (id: number): Promise<void> => {
    await apiClient.delete(`/donhang/${id}`);
}

