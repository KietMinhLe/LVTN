const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
  Code: string;
}

export interface GHNDistrict {
  DistrictID: number;
  DistrictName: string;
  Code: string;
  ProvinceID: number;
}

export interface GHNWard {
  WardCode: string;
  WardName: string;
  DistrictID: number;
}

export interface GHNService {
  service_id: number;
  short_name: string;
  service_type_id: number;
}

export interface ShippingFeeResponse {
  total: number;
  service_fee: number;
  insurance: number;
  cod_fee?: number;
}

export interface CreateGHNOrderRequest {
  toName: string;
  toPhone: string;
  toAddress: string;
  toWardCode: string;
  toDistrictId: number;
  toProvinceId: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  serviceTypeId?: number;
  serviceId?: number;
  paymentTypeId?: number;
  codAmount?: number;
  content?: string;
  items?: Array<{
    name: string;
    quantity: number;
    weight: number;
  }>;
}

/**
 * Lấy danh sách tỉnh/thành phố
 */
export const getGHNProvinces = async (): Promise<GHNProvince[]> => {
  try {
    const url = `${API_URL}/shipping/provinces`;
    console.log('Fetching provinces from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Provinces response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Provinces API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Provinces response data:', data);
    
    if (data.success) {
      return data.data || [];
    }
    
    const errorMsg = data.message || 'Không thể lấy danh sách tỉnh/thành phố';
    console.error('getGHNProvinces error:', errorMsg);
    throw new Error(errorMsg);
  } catch (error) {
    console.error('getGHNProvinces fetch error:', error);
    throw error;
  }
};

/**
 * Lấy danh sách quận/huyện
 */
export const getGHNDistricts = async (provinceId: number): Promise<GHNDistrict[]> => {
  try {
    const response = await fetch(`${API_URL}/shipping/districts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provinceId }),
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data || [];
    }
    throw new Error(data.message || 'Không thể lấy danh sách quận/huyện');
  } catch (error) {
    console.error('getGHNDistricts error:', error);
    throw error;
  }
};

/**
 * Lấy danh sách phường/xã
 */
export const getGHNWards = async (districtId: number): Promise<GHNWard[]> => {
  try {
    const response = await fetch(`${API_URL}/shipping/wards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ districtId }),
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data || [];
    }
    throw new Error(data.message || 'Không thể lấy danh sách phường/xã');
  } catch (error) {
    console.error('getGHNWards error:', error);
    throw error;
  }
};

/**
 * Tính phí vận chuyển
 */
export const calculateGHNShippingFee = async (params: {
  toDistrictId: number;
  toWardCode: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  serviceTypeId?: number;
  serviceId?: number;
  insuranceValue?: number;
}): Promise<ShippingFeeResponse> => {
  try {
    const response = await fetch(`${API_URL}/shipping/fee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    
    if (data.success) {
      return {
        total: data.total || 0,
        service_fee: data.serviceFee || 0,
        insurance: data.insuranceFee || 0,
      };
    }
    throw new Error(data.message || 'Không thể tính phí vận chuyển');
  } catch (error) {
    console.error('calculateGHNShippingFee error:', error);
    throw error;
  }
};

/**
 * Lấy danh sách dịch vụ vận chuyển
 */
export const getGHNAvailableServices = async (
  toDistrictId: number,
  toWardCode: string
): Promise<GHNService[]> => {
  try {
    const response = await fetch(`${API_URL}/shipping/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ toDistrictId, toWardCode }),
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data || [];
    }
    throw new Error(data.message || 'Không thể lấy danh sách dịch vụ');
  } catch (error) {
    console.error('getGHNAvailableServices error:', error);
    throw error;
  }
};

/**
 * Tạo đơn hàng GHN
 */
export const createGHNOrder = async (orderData: CreateGHNOrderRequest) => {
  try {
    const response = await fetch(`${API_URL}/shipping/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    
    if (data.success) {
      return data;
    }
    throw new Error(data.message || 'Không thể tạo đơn hàng GHN');
  } catch (error) {
    console.error('createGHNOrder error:', error);
    throw error;
  }
};

/**
 * Tra cứu đơn hàng GHN
 */
export const getGHNOrderInfo = async (orderCode: string) => {
  try {
    const response = await fetch(`${API_URL}/shipping/order/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderCode }),
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Không thể tra cứu đơn hàng');
  } catch (error) {
    console.error('getGHNOrderInfo error:', error);
    throw error;
  }
};

// ========== GHTK Interfaces ==========
export interface GHTKShippingFeeResponse {
  success: boolean;
  fee: number;
  data?: any;
  error?: string;
}

export interface CreateGHTKOrderRequest {
  orderId?: string;
  toName: string;
  toPhone: string;
  toAddress: string;
  toProvince: string;
  toDistrict: string;
  toWard?: string;
  toStreet?: string;
  toHamlet?: string;
  weight: number; // Gram
  value: number; // VNĐ
  pickMoney?: number; // COD amount
  isFreeship?: number; // 0: người nhận trả ship, 1: shop trả ship
  note?: string;
  products: Array<{
    name: string;
    weight: number;
    quantity: number;
    price: number;
  }>;
  transport?: 'fly' | 'road';
  pickOption?: 'cod' | 'post';
}

/**
 * Tính phí vận chuyển GHTK
 */
export const calculateGHTKShippingFee = async (params: {
  pickProvince?: string;
  pickDistrict?: string;
  pickWard?: string;
  province: string;
  district: string;
  ward?: string;
  address?: string;
  weight: number; // Gram
  value?: number; // VNĐ
  transport?: 'fly' | 'road';
}): Promise<GHTKShippingFeeResponse> => {
  try {
    const response = await fetch(`${API_URL}/shipping/ghtk/fee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        fee: data.fee || 0,
        data: data.data
      };
    }
    return {
      success: false,
      fee: 0,
      error: data.message || 'Không thể tính phí vận chuyển GHTK'
    };
  } catch (error: any) {
    console.error('calculateGHTKShippingFee error:', error);
    return {
      success: false,
      fee: 0,
      error: error.message || 'Không thể tính phí vận chuyển GHTK'
    };
  }
};

/**
 * Tạo đơn hàng GHTK
 */
export const createGHTKOrder = async (orderData: CreateGHTKOrderRequest) => {
  try {
    console.log('Creating GHTK order with data:', orderData);
    
    const response = await fetch(`${API_URL}/shipping/ghtk/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    const data = await response.json();
    console.log('GHTK API Response:', data);
    
    if (data.success) {
      return {
        success: true,
        orderCode: data.orderCode,
        data: data.data,
        message: data.message
      };
    }
    
    // Trả về object với success: false thay vì throw error
    return {
      success: false,
      orderCode: null,
      data: data.data,
      error: data.message || 'Không thể tạo đơn hàng GHTK',
      message: data.message
    };
  } catch (error: any) {
    console.error('createGHTKOrder error:', error);
    
    // Trả về object với success: false thay vì throw error
    return {
      success: false,
      orderCode: null,
      data: null,
      error: error?.response?.data?.message || error?.message || 'Không thể tạo đơn hàng GHTK',
      message: error?.response?.data?.message || error?.message || 'Không thể tạo đơn hàng GHTK'
    };
  }
};

/**
 * Tra cứu đơn hàng GHTK
 */
export const getGHTKOrderInfo = async (orderCode: string) => {
  try {
    const response = await fetch(`${API_URL}/shipping/ghtk/order/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderCode }),
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Không thể tra cứu đơn hàng GHTK');
  } catch (error) {
    console.error('getGHTKOrderInfo error:', error);
    throw error;
  }
};

