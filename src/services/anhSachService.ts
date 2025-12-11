import apiClient from '../lib/api';

// ==================== QUẢN LÝ ẢNH SÁCH ====================

export interface AnhSach {
  anh_sach_id: number;
  sach_id: number;
  url: string;
  loai?: string;
  thu_tu?: number;
  mo_ta?: string;
  ngay_tao?: string;
}

export interface CreateAnhSachRequest {
  sach_id: number;
  url: string;
  loai?: string;
  thu_tu?: number;
  mo_ta?: string;
}

export interface CreateManyAnhSachRequest {
  sach_id: number;
  images: Array<{
    url: string;
    loai?: string;
    thu_tu?: number;
    mo_ta?: string;
  }>;
}

export interface AnhSachResponse {
  message: string;
  success: boolean;
  data: AnhSach;
}

export interface AnhSachListResponse {
  message: string;
  success: boolean;
  data: AnhSach[];
}

// Lấy tất cả ảnh sách
export const getAllAnhSach = async (): Promise<AnhSach[]> => {
  const response = await apiClient.get<AnhSachListResponse>('/anhsach');
  return response.data.data;
};

// Lấy ảnh sách theo ID
export const getAnhSachById = async (id: number): Promise<AnhSach> => {
  const response = await apiClient.get<AnhSachResponse>(`/anhsach/${id}`);
  return response.data.data;
};

// Lấy ảnh sách theo sach_id
export const getAnhSachBySachId = async (sach_id: number): Promise<AnhSach[]> => {
  const response = await apiClient.get<AnhSachListResponse>(`/anhsach/sach/${sach_id}`);
  return response.data.data;
};

// Tạo một ảnh sách
export const createAnhSach = async (data: CreateAnhSachRequest): Promise<AnhSach> => {
  const response = await apiClient.post<AnhSachResponse>('/anhsach', data);
  return response.data.data;
};

// Upload nhiều ảnh sách từ file
export const uploadManyAnhSach = async (sach_id: number, files: File[]): Promise<AnhSach[]> => {
  const formData = new FormData();
  formData.append('sach_id', sach_id.toString());
  
  // Thêm tất cả các file vào FormData
  files.forEach((file) => {
    formData.append('hinh_anh', file);
  });

  const response = await apiClient.post<AnhSachListResponse>('/anhsach/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Tạo nhiều ảnh sách cùng lúc (từ URL)
export const createManyAnhSach = async (data: CreateManyAnhSachRequest): Promise<AnhSach[]> => {
  const response = await apiClient.post<AnhSachListResponse>('/anhsach/many', data);
  return response.data.data;
};

// Cập nhật ảnh sách
export const updateAnhSach = async (id: number, data: Partial<CreateAnhSachRequest>): Promise<AnhSach> => {
  const response = await apiClient.put<AnhSachResponse>(`/anhsach/${id}`, data);
  return response.data.data;
};

// Xóa ảnh sách
export const deleteAnhSach = async (id: number): Promise<void> => {
  await apiClient.delete(`/anhsach/${id}`);
};

// Xóa tất cả ảnh sách theo sach_id
export const deleteAllAnhSachBySachId = async (sach_id: number): Promise<void> => {
  await apiClient.delete(`/anhsach/sach/${sach_id}`);
};

