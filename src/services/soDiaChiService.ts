import apiClient from '../lib/api';

export interface SoDiaChi {
  dia_chi_id: number;
  khach_hang_id: number;
  ho_ten_nguoi_nhan: string;
  so_dien_thoai_nguoi_nhan?: string | null;
  phuong_xa: string;
  quan_huyen: string;
  tinh_thanh: string;
  dia_chi_chi_tiet: string;
  la_mac_dinh: boolean;
  ghn_province_id?: number | null;
  ghn_province_name?: string | null;
  ghn_district_id?: number | null;
  ghn_district_name?: string | null;
  ghn_ward_code?: string | null;
  ghn_ward_name?: string | null;
}

interface SoDiaChiListResponse {
  message: string;
  success: boolean;
  data: SoDiaChi[];
  count?: number;
}

interface SoDiaChiResponse {
  message: string;
  success: boolean;
  data: SoDiaChi;
}

export const getAddressesByCustomer = async (khachHangId: number): Promise<SoDiaChiListResponse> => {
  const response = await apiClient.get<SoDiaChiListResponse>(`/sodiachi/khachhang/${khachHangId}`);
  return response.data;
};

export const getDefaultAddress = async (): Promise<SoDiaChi | null> => {
  try {
    const response = await apiClient.get<SoDiaChiResponse>('/sodiachi/default/me');
    return response.data.data;
  } catch (error) {
    return null;
  }
};

