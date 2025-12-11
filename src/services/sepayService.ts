// Dùng relative path để Vite proxy xử lý (khi dev) hoặc ngrok forward (khi production)
// Nếu có VITE_API_BASE_URL thì dùng, nếu không thì dùng relative path (Vite proxy sẽ xử lý)
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  // Nếu có URL từ env và không phải localhost, dùng nó
  // Nếu không có hoặc là localhost, dùng relative path để Vite proxy xử lý
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return ''; // Relative path - Vite proxy sẽ forward
};

export interface CreatePaymentFormRequest {
  orderId: string;
  amount: number;
  orderDescription?: string;
  paymentMethod?: string;
}

export interface CreatePaymentFormResponse {
  message: string;
  success: boolean;
  data: {
    checkoutUrl: string;
    formFields: Record<string, string>;
    orderId: string;
  };
}

/**
 * Tạo form thanh toán SePay
 */
export const createSepayPaymentForm = async (
  request: CreatePaymentFormRequest
): Promise<CreatePaymentFormResponse> => {
  try {
    // Dùng relative path - Vite proxy sẽ forward đến backend trong dev mode
    // Khi qua ngrok, Vite proxy cũng sẽ forward requests đến backend
    const apiUrl = getApiBaseUrl();
    const url = `${apiUrl}/sepay/create_payment_form`;
    
    console.log('SePay API URL:', url);
    console.log('SePay Request:', request);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Nếu không parse được JSON, dùng status text
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating SePay payment form:', error);
    throw error;
  }
};
