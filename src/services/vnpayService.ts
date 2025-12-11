const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface CreatePaymentUrlRequest {
  amount: number;
  orderId: string;
  orderInfo?: string;
  bankCode?: string;
  language?: string;
}

export interface CreatePaymentUrlResponse {
  message: string;
  success: boolean;
  data: {
    paymentUrl: string;
    orderId: string;
  };
}

/**
 * Tạo URL thanh toán VNPay
 */
export const createVnpayPaymentUrl = async (
  request: CreatePaymentUrlRequest
): Promise<CreatePaymentUrlResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vnpay/create_payment_url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo URL thanh toán');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating VNPay payment URL:', error);
    throw error;
  }
};

