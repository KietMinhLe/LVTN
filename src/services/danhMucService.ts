import apiClient from '../lib/api';

// ==================== QUẢN LÝ DANH MỤC ====================

export interface DanhMucCha {
  danh_muc_cha_id: number;
  ten_danh_muc_cha: string;
  mo_ta?: string;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface DanhMuc {
  danh_muc_id: number;
  ten_danh_muc: string;
  mo_ta?: string;
  slug: string;
  danh_muc_cha_id?: number;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
  danhmuccha?: DanhMucCha;
  so_luong_sach?: number;
}

export interface CreateDanhMucRequest {
  ten_danh_muc: string;
  mo_ta?: string;
  slug: string;
  danh_muc_cha_id: number;
}

export type UpdateDanhMucRequest = Partial<CreateDanhMucRequest>;

export interface DanhMucListResponse {
  message: string;
  success: boolean;
  data: DanhMuc[];
}

export interface DanhMucResponse {
  message: string;
  success: boolean;
  data: DanhMuc;
}

// Lấy danh sách danh mục
export const getAllDanhMuc = async (): Promise<DanhMuc[]> => {
  const response = await apiClient.get<DanhMucListResponse>('/danhmuc');
  return response.data.data;
};

// Lấy danh mục theo ID
export const getDanhMucById = async (id: number): Promise<DanhMuc> => {
  const response = await apiClient.get<DanhMucResponse>(`/danhmuc/${id}`);
  return response.data.data;
};

// Tạo danh mục mới
export const createDanhMuc = async (data: CreateDanhMucRequest): Promise<DanhMuc> => {
  const response = await apiClient.post<DanhMucResponse>('/danhmuc', {
    ten_danh_muc: data.ten_danh_muc.trim(),
    mo_ta: data.mo_ta?.trim() || '',
    slug: data.slug.trim(),
    danh_muc_cha_id: data.danh_muc_cha_id
  });
  return response.data.data;
};

// Cập nhật danh mục
export const updateDanhMuc = async (id: number, data: UpdateDanhMucRequest): Promise<DanhMuc> => {
  const updateData: Record<string, string | number> = {};
  if (data.ten_danh_muc) updateData.ten_danh_muc = data.ten_danh_muc.trim();
  if (data.mo_ta !== undefined) updateData.mo_ta = data.mo_ta.trim() || '';
  if (data.slug) updateData.slug = data.slug.trim();
  if (data.danh_muc_cha_id) updateData.danh_muc_cha_id = data.danh_muc_cha_id;
  
  const response = await apiClient.put<DanhMucResponse>(`/danhmuc/${id}`, updateData);
  return response.data.data;
};

// Xóa danh mục
export const deleteDanhMuc = async (id: number): Promise<void> => {
  await apiClient.delete(`/danhmuc/${id}`);
};

// Lấy danh sách danh mục cha
export const getAllDanhMucCha = async (): Promise<DanhMucCha[]> => {
  const response = await apiClient.get<{ success: boolean; data: DanhMucCha[] }>('/danhmuccha');
  return response.data.data;
};

// Sắp xếp danh mục
export interface SortDanhMucParams {
  sortBy: 'ten_danh_muc' | 'ngay_tao';
  order: 'asc' | 'desc';
}

export const sortDanhMuc = async (params: SortDanhMucParams): Promise<DanhMuc[]> => {
  const response = await apiClient.get<DanhMucListResponse>('/danhmuc/sort', {
    params
  });
  return response.data.data;
};

