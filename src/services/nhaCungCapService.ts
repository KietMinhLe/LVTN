import apiClient from '../lib/api';


// ==================== QUẢN LÝ NHÀ CUNG CẤP ====================
export interface NhaCungCap { // Interface cho nhà cung cấp
    nha_cung_cap_id : number;
    ten_nha_cung_cap : string;
    email: string;
    dia_chi?: string;
    sdt?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
}

export interface NhaCungCapListResponse { // Interface cho danh sách nhà cung cấp
    message: string;
    success: boolean;
    data: NhaCungCap[];
}

export interface NhaCungCapResponse { // Interface cho nhà cung cấp
    message : string;
    success: boolean;
    data: NhaCungCap;
}

// Tạo nhà cung cấp (POST /nhacungcap)
export interface CreateNhaCungCapRequest {
    ten_nha_cung_cap: string;
    email: string;
    dia_chi?: string;
    sdt?: string;
}

// Cập nhật nhà cung cấp (PUT /nhacungcap/:id)
export interface UpdateNhaCungCapRequest {
    ten_nha_cung_cap?: string;
    email?: string;
    dia_chi?: string;
    sdt?: string;
}

// Lấy danh sách nhà cung cấp (GET /nhacungcap)
export const getAllNhaCungCap = async () : Promise<NhaCungCap[]> => {
    const response = await apiClient.get<NhaCungCapListResponse>('/nhacungcap');
    return response.data.data;
}

// Lấy nhà cung cấp theo ID (GET /nhacungcap/:id)
export const getNhaCungCapById = async (id: number) : Promise<NhaCungCap> => {
    const response = await apiClient.get<NhaCungCapResponse>(`/nhacungcap/${id}`);
    return response.data.data;
}

// Tìm kiếm nhà cung cấp theo tên (GET /nhacungcap/search)
export const searchNhaCungCap = async (ten_nha_cung_cap: string) : Promise<NhaCungCap[]> => {
    const response = await apiClient.get<NhaCungCapListResponse>('/nhacungcap/search', {
        params: {
            ten_nha_cung_cap: ten_nha_cung_cap
        }
    });
    return response.data.data;
}

export const createNhaCungCap = async (data: CreateNhaCungCapRequest) : Promise<NhaCungCap> => {
    const response = await apiClient.post<NhaCungCapResponse>('/nhacungcap', {
        ten_nha_cung_cap: data.ten_nha_cung_cap.trim(),
        email: data.email.trim(),
        dia_chi: data.dia_chi?.trim() || '',
        sdt: data.sdt?.trim() || ''
    });
    return response.data.data;
}

export const updateNhaCungCap = async (id: number, data: UpdateNhaCungCapRequest) : Promise<NhaCungCap> => {
    const updateData: Record<string, string> = {};
    if (data.ten_nha_cung_cap) updateData.ten_nha_cung_cap = data.ten_nha_cung_cap.trim();
    if (data.dia_chi !== undefined) updateData.dia_chi = data.dia_chi.trim() || '';
    if (data.email !== undefined) updateData.email = data.email.trim() || '';
    if (data.sdt !== undefined) updateData.sdt = data.sdt.trim() || '';
    
    const response = await apiClient.put<NhaCungCapResponse>(`/nhacungcap/${id}`, updateData);
    return response.data.data;
}

// Xóa nhà cung cấp (DELETE /nhacungcap/:id)
export const deleteNhaCungCap = async (id: number) : Promise<void> => {
    await apiClient.delete(`/nhacungcap/${id}`);
}