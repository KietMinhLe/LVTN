import apiClient from "../lib/api";

// ==================== QUẢN LÝ ĐÁNH GIÁ ====================
export interface DanhGia {
  danh_gia_id: number;
  sach_id: number;
  khach_hang_id: number;
  don_hang_id: number;
  xep_hang: number; // 1-5 sao
  binh_luan?: string;
  ngay_danh_gia?: string;
  duyet_admin?: boolean;
  khachhang?: {
    khach_hang_id: number;
    ho_ten: string;
    email: string;
  };
  sach?: {
    sach_id: number;
    ten_sach: string;
  };
}

export interface DanhGiaResponse {
    message:string;
    success:boolean;
    data:DanhGia;
}

export interface DanhGiaListResponse {
    message:string;
    success:boolean;
    data:DanhGia[];
}

// Response khi lấy đánh giá theo sách (có thêm thống kê)
export interface DanhGiaBySachResponse {
    message:string;
    success:boolean;
    data:{
        danh_gia: DanhGia[];
        diem_trung_binh: number;
        tong_so_danh_gia: number;
        thong_ke_sao: {
            5: number;
            4: number;
            3: number;
            2: number;
            1: number;
        };
    };
}

//  Tạo đánh giá
export interface CreateDanhGiaRequest {
    sach_id:number;
    don_hang_id:number;
    xep_hang:number;
    binh_luan?:string;
}


// Cập nhật đánh giá
export interface UpdateDanhGiaRequest {
    xep_hang:number;
    binh_luan?:string;
}

// Xóa đánh giá response
export interface DeleteDanhGiaResponse {
    message:string;
    success:boolean;
}

// Lấy danh sách đánh giá theo sách_id 
export const getDanhGiaBySachId = async (sach_id: number) => {
    const response = await apiClient.get<DanhGiaBySachResponse>(`/danhgia/sach/${sach_id}`);
    return response.data.data;
}

//Tạo đánh giá
export const createDanhGia = async (data : CreateDanhGiaRequest): Promise<DanhGia> => {
    const response = await apiClient.post<DanhGiaResponse>('/danhgia', data);
    return response.data.data;
}

//Cập nhật đánh giá
export const updateDanhGia = async (danh_gia_id: number, data: UpdateDanhGiaRequest): Promise<DanhGia> => {
    const response = await apiClient.put<DanhGiaResponse>(`/danhgia/${danh_gia_id}`, data);
    return response.data.data;
}

// Admin: Lấy tất cả đánh giá
export interface GetAllDanhGiaParams {
    page?: number;
    limit?: number;
    sach_id?: number;
    khach_hang_id?: number;
    search?: string;
}

export interface GetAllDanhGiaResponse {
    message: string;
    success: boolean;
    data: {
        danh_gia: DanhGia[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export const getAllDanhGia = async (params?: GetAllDanhGiaParams) => {
    const response = await apiClient.get<GetAllDanhGiaResponse>('/danhgia/admin', {
        params
    });
    return response.data.data;
};

// Admin: Xóa đánh giá (chỉ admin mới có quyền)
export const deleteDanhGiaByAdmin = async (id: number): Promise<void> => {
    await apiClient.delete(`/danhgia/admin/${id}`);
}
