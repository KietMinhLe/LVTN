import apiClient from '../lib/api';

// ==================== QUẢN LÝ DANH MỤC CHA ====================
export interface DanhMucCha {
    danh_muc_cha_id: number;
    ten_danh_muc_cha: string;
    mo_ta?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
}

export interface DanhMucChaListResponse {
    message: string;
    success: boolean;
    data: DanhMucCha[];
}

export interface DanhMucChaResponse {
    message: string;
    success: boolean;
    data: DanhMucCha;
}

export interface CreateDanhMucChaRequest {
    ten_danh_muc_cha: string;
    mo_ta?: string;
}

export interface UpdateDanhMucChaRequest {
    ten_danh_muc_cha?: string;
    mo_ta?: string;
}

// Lấy danh sách danh mục cha
export const getAllDanhMucCha = async (): Promise<DanhMucCha[]> => {
    const response = await apiClient.get<DanhMucChaListResponse>('/danhmuccha');
    return response.data.data;
}

// Lấy danh mục cha theo ID
export const getDanhMucChaById = async (id: number): Promise<DanhMucCha> => {
    const response = await apiClient.get<DanhMucChaResponse>(`/danhmuccha/${id}`);
    return response.data.data;
}

// Tìm kiếm danh mục cha theo tên
export const searchDanhMucCha = async (ten_danh_muc_cha: string): Promise<DanhMucCha[]> => {
    const response = await apiClient.get<DanhMucChaListResponse>('/danhmuccha/search', {
        params: {
            ten_danh_muc_cha: ten_danh_muc_cha
        }
    });
    return response.data.data;
}

// Tạo danh mục cha
export const createDanhMucCha = async (data: CreateDanhMucChaRequest): Promise<DanhMucCha> => {
    const response = await apiClient.post<DanhMucChaResponse>('/danhmuccha', {
        ten_danh_muc_cha: data.ten_danh_muc_cha.trim(),
        mo_ta: data.mo_ta?.trim() || ''
    });
    return response.data.data;
}

// Cập nhật danh mục cha
export const updateDanhMucCha = async (id: number, data: UpdateDanhMucChaRequest): Promise<DanhMucCha> => {
    const updateData: Record<string, string> = {};
    if (data.ten_danh_muc_cha) updateData.ten_danh_muc_cha = data.ten_danh_muc_cha.trim();
    if (data.mo_ta !== undefined) updateData.mo_ta = data.mo_ta.trim() || '';
    
    const response = await apiClient.put<DanhMucChaResponse>(`/danhmuccha/${id}`, updateData);
    return response.data.data;
}

// Xóa danh mục cha
export const deleteDanhMucCha = async (id: number): Promise<void> => {
    await apiClient.delete(`/danhmuccha/${id}`);
}

// Sắp xếp danh mục cha
export interface SortDanhMucChaParams {
    sortBy: 'ten_danh_muc_cha' | 'ngay_tao';
    order: 'asc' | 'desc';
}

export const sortDanhMucCha = async (params: SortDanhMucChaParams): Promise<DanhMucCha[]> => {
    const response = await apiClient.get<DanhMucChaListResponse>('/danhmuccha/sort', {
        params
    });
    return response.data.data;
}

