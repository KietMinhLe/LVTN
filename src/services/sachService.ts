import apiClient from '../lib/api';

// ==================== QUẢN LÝ SÁCH ====================

export interface Sach {
  sach_id: number;
  ma_sach: string;
  ten_sach: string;
  mo_ta?: string;
  gia_bia: number;
  gia_ban: number;
  anh_bia_url?: string;
  trong_luong: number;
  ngay_xuat_ban?: string;
  so_trang?: number;
  isbn?: string;
  nguoi_dich?: string;
  trang_thai?: boolean;
  sl_da_ban?: number;
  so_luong?: number; 
  tac_gia_id: number;
  nha_xuat_ban_id: number;
  thuong_hieu_id: number;
  nha_cung_cap_id: number;
  ngon_ngu_id: number;
  do_tuoi_id: number;
  nguoi_bien_dich_id: number;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
  tacgia?: {
    tac_gia_id: number;
    ten_tac_gia: string;
    tieu_su?: string;
  };
  nhaxuatban?: {
    nha_xuat_ban_id: number;
    ten_nha_xuat_ban: string;
  };
  thuonghieu?: {
    thuong_hieu_id: number;
    ten_thuong_hieu: string;
  };
  nhacungcap?: {
    nha_cung_cap_id: number;
    ten_nha_cung_cap: string;
    dia_chi?: string;
    sdt?: string;
  };
  ngonngu?: {
    ngon_ngu_id: number;
    ten_ngon_ngu: string;
    ma_ngon_ngu?: string;
  };
  dotuoi?: {
    do_tuoi_id: number;
    ten_do_tuoi: string;
  };
  nguoibiendich?: {
    nguoi_bien_dich_id: number;
    ten_nguoi_bien_dich: string;
    email?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
  };
  sach_danhmuc?: Array<{
    danhmuc: {
      danh_muc_id: number;
      ten_danh_muc: string;
    };
  }>;
  anhsach?: Array<{
    anh_sach_id: number;
    sach_id: number;
    url: string;
    loai?: string;
    thu_tu?: number;
    mo_ta?: string;
    ngay_tao?: string;
  }>;
}

export interface CreateSachRequest {
  ten_sach: string;
  ma_sach: string;
  mo_ta?: string;
  gia_bia: number;
  gia_ban: number;
  trong_luong: number;
  ngay_xuat_ban?: string;
  so_trang?: number;
  isbn?: string;
  nguoi_dich?: string;
  so_luong?: number;
  trang_thai?: boolean;
  tac_gia_id: number;
  nha_xuat_ban_id: number;
  thuong_hieu_id: number;
  nha_cung_cap_id: number;
  ngon_ngu_id: number;
  do_tuoi_id: number;
  nguoi_bien_dich_id: number;
  anh_bia?: File;
}

export interface UpdateSachRequest extends Partial<CreateSachRequest> {
  anh_bia?: File;
}

export interface SachListResponse {
  message: string;
  success: boolean;
  data: Sach[];
}

export interface SachResponse {
  message: string;
  success: boolean;
  data: Sach;
}

// Lấy danh sách sách
export const getAllSach = async (): Promise<Sach[]> => {
  try {
    const response = await apiClient.get<SachListResponse>('/sach');
    return response.data?.data || [];
  } catch (error: unknown) {
    console.error('Error getting all books:', error as Error);
    // Trả về mảng rỗng thay vì throw error để UI không bị crash
    return [];
  }
};

// Lấy sách theo ID
export const getSachById = async (id: number): Promise<Sach> => {
  try {
    const response = await apiClient.get<SachResponse>(`/sach/${id}`);
    return response.data?.data;
  } catch (error: unknown) {
    console.error('Error getting book by ID:', error as Error);
    throw error;
  }
};

// Tìm kiếm sách
export const searchSach = async (ten_sach: string): Promise<Sach[]> => {
  try {
    const response = await apiClient.get<SachListResponse>('/sach/search', {
      params: { keyword: ten_sach, ten_sach: ten_sach }
    });
    return response.data?.data || [];
  } catch (error: unknown) {
    console.error('Error searching books:', error);
    // Trả về mảng rỗng thay vì throw error để UI không bị crash
    return [];
  }
};

// Tạo sách mới
export const createSach = async (data: CreateSachRequest): Promise<Sach> => {
  const formData = new FormData();
  
  // Các trường bắt buộc
  formData.append('ten_sach', String(data.ten_sach || '').trim());
  formData.append('ma_sach', String(data.ma_sach || '').trim());
  formData.append('gia_bia', data.gia_bia.toString());
  formData.append('gia_ban', data.gia_ban.toString());
  formData.append('trong_luong', data.trong_luong.toString());
  formData.append('tac_gia_id', data.tac_gia_id.toString());
  formData.append('nha_xuat_ban_id', data.nha_xuat_ban_id.toString());
  formData.append('thuong_hieu_id', data.thuong_hieu_id.toString());
  formData.append('nha_cung_cap_id', data.nha_cung_cap_id.toString());
  formData.append('ngon_ngu_id', data.ngon_ngu_id.toString());
  formData.append('do_tuoi_id', data.do_tuoi_id.toString());
  formData.append('nguoi_bien_dich_id', data.nguoi_bien_dich_id.toString());
  
  // Debug: Log FormData values
  console.log('FormData being sent:', {
    ten_sach: String(data.ten_sach || '').trim(),
    ma_sach: String(data.ma_sach || '').trim(),
    gia_bia: data.gia_bia,
    gia_ban: data.gia_ban,
    trong_luong: data.trong_luong,
    tac_gia_id: data.tac_gia_id,
    nha_xuat_ban_id: data.nha_xuat_ban_id,
    thuong_hieu_id: data.thuong_hieu_id,
    nha_cung_cap_id: data.nha_cung_cap_id,
    ngon_ngu_id: data.ngon_ngu_id,
    do_tuoi_id: data.do_tuoi_id,
    nguoi_bien_dich_id: data.nguoi_bien_dich_id,
    so_luong: data.so_luong
  });
  
  // Các trường optional (chỉ gửi nếu có giá trị)
  if (data.mo_ta && String(data.mo_ta).trim()) {
    formData.append('mo_ta', String(data.mo_ta).trim());
  }
  
  // Chuyển ngay_xuat_ban sang timestamp nếu có (chỉ gửi nếu có giá trị)
  if (data.ngay_xuat_ban && String(data.ngay_xuat_ban).trim() !== '') {
    const dateTimestamp = new Date(data.ngay_xuat_ban).getTime();
    if (!isNaN(dateTimestamp)) {
      formData.append('ngay_xuat_ban', dateTimestamp.toString());
    }
  }
  
  if (data.so_trang && data.so_trang > 0) {
    formData.append('so_trang', data.so_trang.toString());
  }
  
  if (data.isbn && String(data.isbn).trim()) {
    formData.append('isbn', String(data.isbn).trim());
  }
  
  if (data.nguoi_dich && String(data.nguoi_dich).trim()) {
    formData.append('nguoi_dich', String(data.nguoi_dich).trim());
  }
  
  // Thêm so_luong (luôn gửi, mặc định là 0)
  if (data.so_luong !== undefined && data.so_luong !== null) {
    formData.append('so_luong', data.so_luong.toString());
  } else {
    formData.append('so_luong', '0');
  }
  
  formData.append('trang_thai', data.trang_thai !== undefined ? data.trang_thai.toString() : 'true');
  
  if (data.anh_bia) {
    formData.append('hinh_anh', data.anh_bia);
  }

  const response = await apiClient.post<SachResponse>('/sach', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Cập nhật sách
export const updateSach = async (id: number, data: UpdateSachRequest): Promise<Sach> => {
  const formData = new FormData();
  
  // Các trường bắt buộc (phải gửi để backend validate)
  // Đảm bảo luôn gửi các trường này
  formData.append('ten_sach', String(data.ten_sach || '').trim());
  formData.append('ma_sach', String(data.ma_sach || '').trim());
  formData.append('gia_bia', (data.gia_bia ?? 0).toString());
  formData.append('gia_ban', (data.gia_ban ?? 0).toString());
  formData.append('trong_luong', (data.trong_luong ?? 0).toString());
  
  // Các trường optional
  if (data.mo_ta !== undefined) {
    if (data.mo_ta && String(data.mo_ta).trim()) {
      formData.append('mo_ta', String(data.mo_ta).trim());
    } else {
      formData.append('mo_ta', '');
    }
  }
  
  // Chuyển ngay_xuat_ban sang timestamp nếu có (chỉ gửi nếu có giá trị)
  if (data.ngay_xuat_ban && String(data.ngay_xuat_ban).trim() !== '') {
    const dateTimestamp = new Date(data.ngay_xuat_ban).getTime();
    if (!isNaN(dateTimestamp)) {
      formData.append('ngay_xuat_ban', dateTimestamp.toString());
    }
  }
  
  if (data.so_trang !== undefined && data.so_trang > 0) {
    formData.append('so_trang', data.so_trang.toString());
  }
  
  if (data.isbn !== undefined) {
    if (data.isbn && String(data.isbn).trim()) {
      formData.append('isbn', String(data.isbn).trim());
    } else {
      formData.append('isbn', '');
    }
  }
  
  if (data.nguoi_dich !== undefined) {
    if (data.nguoi_dich && String(data.nguoi_dich).trim()) {
      formData.append('nguoi_dich', String(data.nguoi_dich).trim());
    } else {
      formData.append('nguoi_dich', '');
    }
  }
  
  // Thêm so_luong vào update
  if (data.so_luong !== undefined && data.so_luong !== null) {
    formData.append('so_luong', data.so_luong.toString());
  }
  
  if (data.trang_thai !== undefined) {
    formData.append('trang_thai', data.trang_thai.toString());
  }
  
  // Các ID tham chiếu (luôn gửi để backend có thể validate)
  if (data.tac_gia_id) formData.append('tac_gia_id', data.tac_gia_id.toString());
  if (data.nha_xuat_ban_id) formData.append('nha_xuat_ban_id', data.nha_xuat_ban_id.toString());
  if (data.thuong_hieu_id) formData.append('thuong_hieu_id', data.thuong_hieu_id.toString());
  if (data.nha_cung_cap_id) formData.append('nha_cung_cap_id', data.nha_cung_cap_id.toString());
  if (data.ngon_ngu_id) formData.append('ngon_ngu_id', data.ngon_ngu_id.toString());
  if (data.do_tuoi_id) formData.append('do_tuoi_id', data.do_tuoi_id.toString());
  if (data.nguoi_bien_dich_id) formData.append('nguoi_bien_dich_id', data.nguoi_bien_dich_id.toString());
  
  if (data.anh_bia) {
    formData.append('hinh_anh', data.anh_bia);
  }

  const response = await apiClient.put<SachResponse>(`/sach/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Xóa sách
export const deleteSach = async (id: number): Promise<void> => {
  await apiClient.delete(`/sach/${id}`);
};

// ==================== DỮ LIỆU THAM CHIẾU ====================

export interface TacGia {
  tac_gia_id: number;
  ten_tac_gia: string;
  tieu_su?: string;
}

export interface NhaXuatBan {
  nha_xuat_ban_id: number;
  ten_nha_xuat_ban: string;
}

export interface ThuongHieu {
  thuong_hieu_id: number;
  ten_thuong_hieu: string;
}

export interface NhaCungCap {
  nha_cung_cap_id: number;
  ten_nha_cung_cap: string;
  dia_chi?: string;
  sdt?: string;
}

// Lấy danh sách tác giả
export const getAllTacGia = async (): Promise<TacGia[]> => {
  const response = await apiClient.get<{ success: boolean; data: TacGia[] }>('/tacgia');
  return response.data.data;
};

// Lấy danh sách nhà xuất bản
export const getAllNhaXuatBan = async (): Promise<NhaXuatBan[]> => {
  const response = await apiClient.get<{ success: boolean; data: NhaXuatBan[] }>('/nhaxuatban');
  return response.data.data;
};

// Lấy danh sách thương hiệu
export const getAllThuongHieu = async (): Promise<ThuongHieu[]> => {
  const response = await apiClient.get<{ success: boolean; data: ThuongHieu[] }>('/thuonghieu');
  return response.data.data;
};

// Lấy danh sách nhà cung cấp
export const getAllNhaCungCap = async (): Promise<NhaCungCap[]> => {
  const response = await apiClient.get<{ success: boolean; data: NhaCungCap[] }>('/nhacungcap');
  return response.data.data;
};

// Export lại từ các service riêng biệt
export type { NgonNgu } from './ngonNguService';
export type { DoTuoi } from './doTuoiService';
export type { NguoiBienDich } from './nguoiBienDichService';
export { getAllNgonNgu } from './ngonNguService';
export { getAllDoTuoi } from './doTuoiService';
export { getAllNguoiBienDich } from './nguoiBienDichService';

// Sắp xếp sách
export interface SortSachParams {
  sortBy: 'sach_id' | 'ten_sach' | 'tacgia_id' | 'nhaxuatban_id' | 'thuonghieu_id' | 'nhacungcap_id' | 'danhmuc_id' | 'ngay_tao';
  order: 'asc' | 'desc';
}

export const sortSach = async (params: SortSachParams): Promise<Sach[]> => {
  const response = await apiClient.get<SachListResponse>('/sach/sort', {
    params
  });
  return response.data.data;
};

