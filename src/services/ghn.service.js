import axios from 'axios';
import { ghnConfig } from '../config/ghn.config.js';

const GHN_API = axios.create({
    baseURL: ghnConfig.baseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Token': ghnConfig.token
    }
});

// API instance cho các request cần ShopId
const GHN_API_WITH_SHOP = axios.create({
    baseURL: ghnConfig.baseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Token': ghnConfig.token,
        'ShopId': ghnConfig.shopId
    }
});

/**
 * Lấy danh sách tỉnh/thành phố
 */
export const getProvinces = async () => {
    try {
        const fullUrl = `${ghnConfig.baseUrl}/shiip/public-api/master-data/province`;
        console.log('=== GHN API Call ===');
        console.log('URL:', fullUrl);
        console.log('Token:', ghnConfig.token);
        console.log('ShopId:', ghnConfig.shopId);
        
        // Thử với ShopId trong header (một số API GHN yêu cầu)
        const response = await GHN_API_WITH_SHOP.get('/shiip/public-api/master-data/province', {
            headers: {
                'Token': ghnConfig.token,
                'ShopId': ghnConfig.shopId,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('=== GHN API Response ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
        console.log('Response Headers:', response.headers);
        
        // GHN API trả về code: 200 khi thành công
        if (response.data && response.data.code === 200) {
            let provinces = response.data.data || [];
            
            // Filter bỏ các tỉnh test/không hợp lệ
            provinces = provinces.filter(province => {
                const provinceName = (province.ProvinceName || '').toLowerCase();
                // Loại bỏ các tỉnh có tên chứa: test, alert, ngoc test, hoặc các từ khóa không hợp lệ
                const invalidKeywords = ['test', 'alert', 'ngoc'];
                const isValid = !invalidKeywords.some(keyword => provinceName.includes(keyword));
                return isValid;
            });
            
            console.log('✅ Success: Got', provinces.length, 'provinces (after filtering)');
            return {
                success: true,
                data: provinces
            };
        }
        
        // Nếu không có code hoặc code khác 200
        const errorMsg = response.data?.message || response.data?.code_message || 'Không có dữ liệu';
        console.error('❌ GHN API Error:', {
            code: response.data?.code,
            message: errorMsg,
            fullResponse: response.data
        });
        return {
            success: false,
            error: errorMsg,
            data: []
        };
    } catch (error) {
        console.error('=== GHN API Exception ===');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Response Status:', error.response?.status);
        console.error('Response Status Text:', error.response?.statusText);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Request URL:', error.config?.url);
        console.error('Request Method:', error.config?.method);
        console.error('Request Headers:', {
            ...error.config?.headers,
            Token: error.config?.headers?.Token ? error.config.headers.Token.substring(0, 15) + '...' : 'missing'
        });
        
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.code_message || 
                        error.message || 
                        'Lỗi khi gọi API GHN';
        
        console.error('Final Error Message:', errorMsg);
        
        return {
            success: false,
            error: errorMsg,
            data: []
        };
    }
};

/**
 * Lấy danh sách quận/huyện theo tỉnh
 */
export const getDistricts = async (provinceId) => {
    try {
        const response = await GHN_API.post('/shiip/public-api/master-data/district', {
            province_id: parseInt(provinceId)
        });
        return {
            success: true,
            data: response.data?.data || []
        };
    } catch (error) {
        console.error('GHN getDistricts error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            data: []
        };
    }
};

/**
 * Lấy danh sách phường/xã theo quận/huyện
 */
export const getWards = async (districtId) => {
    try {
        const response = await GHN_API.post('/shiip/public-api/master-data/ward', {
            district_id: parseInt(districtId)
        });
        return {
            success: true,
            data: response.data?.data || []
        };
    } catch (error) {
        console.error('GHN getWards error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            data: []
        };
    }
};

/**
 * Tính phí vận chuyển
 */
export const calculateShippingFee = async (data) => {
    try {
        const {
            toDistrictId,
            toWardCode,
            weight = 200, // gram, mặc định 200g
            length = 20, // cm
            width = 15,
            height = 2,
            serviceTypeId = 2, // 2: Standard, 5: Express
            serviceId = null, // Service ID cụ thể (quan trọng cho một số dịch vụ)
            insuranceValue = 0
        } = data;

        // GHN yêu cầu weight tối thiểu 200g, đảm bảo weight hợp lệ
        // Parse và validate weight
        let parsedWeight = parseInt(weight);
        if (isNaN(parsedWeight) || parsedWeight <= 0) {
            parsedWeight = 200; // Mặc định 200g nếu không hợp lệ
        }
        const validWeight = Math.max(parsedWeight, 200); // Tối thiểu 200g
        
        // Validate kích thước
        const validLength = Math.max(parseInt(length) || 20, 1);
        const validWidth = Math.max(parseInt(width) || 15, 1);
        const validHeight = Math.max(parseInt(height) || 2, 1);
        
        console.log('Validated weight and dimensions:', {
            originalWeight: weight,
            parsedWeight,
            validWeight,
            validLength,
            validWidth,
            validHeight
        });

        // Kiểm tra địa chỉ shop
        if (!ghnConfig.shopAddress.districtId || !ghnConfig.shopAddress.wardCode) {
            console.error('GHN shop address not configured:', ghnConfig.shopAddress);
            return {
                success: false,
                error: 'Chưa cấu hình địa chỉ shop. Vui lòng cấu hình GHN_SHOP_DISTRICT_ID và GHN_SHOP_WARD_CODE trong file .env hoặc ghn.config.js',
                data: null,
                total: 0
            };
        }

        console.log('Calculating GHN fee:', {
            from: {
                districtId: ghnConfig.shopAddress.districtId,
                wardCode: ghnConfig.shopAddress.wardCode
            },
            to: {
                districtId: toDistrictId,
                wardCode: toWardCode
            },
            serviceTypeId,
            originalWeight: weight,
            validWeight: validWeight
        });

        // Sử dụng GHN_API_WITH_SHOP để có shop_id trong header
        // Đảm bảo tất cả giá trị là số nguyên hợp lệ
        const requestPayload = {
            from_district_id: parseInt(ghnConfig.shopAddress.districtId),
            from_ward_code: String(ghnConfig.shopAddress.wardCode),
            to_district_id: parseInt(toDistrictId),
            to_ward_code: String(toWardCode),
            service_type_id: parseInt(serviceTypeId),
            weight: Math.round(validWeight), // Đảm bảo là số nguyên
            length: Math.round(validLength),
            width: Math.round(validWidth),
            height: Math.round(validHeight),
            insurance_value: Math.round(parseInt(insuranceValue) || 0),
            cod_failed_amount: 0
        };
        
        // Kiểm tra lại weight trước khi gửi
        if (requestPayload.weight < 200) {
            console.error('Weight validation failed:', requestPayload.weight);
            return {
                success: false,
                error: 'Cân nặng không hợp lệ. Vui lòng kiểm tra lại.',
                data: null,
                total: 0
            };
        }

        // Thêm service_id nếu có (quan trọng cho một số dịch vụ như hỏa tốc)
        if (serviceId) {
            requestPayload.service_id = parseInt(serviceId);
        }

        console.log('GHN fee request payload:', requestPayload);

        const response = await GHN_API_WITH_SHOP.post('/shiip/public-api/v2/shipping-order/fee', requestPayload);

        console.log('GHN fee response:', response.data);

        if (response.data && response.data.code === 200) {
            return {
                success: true,
                data: response.data?.data || null,
                total: response.data?.data?.total || 0,
                serviceFee: response.data?.data?.service_fee || 0,
                insuranceFee: response.data?.data?.insurance || 0
            };
        }

        const errorMsg = response.data?.message || response.data?.code_message || 'Không thể tính phí vận chuyển';
        console.error('GHN calculateShippingFee API error:', {
            code: response.data?.code,
            message: errorMsg,
            data: response.data
        });
        return {
            success: false,
            error: errorMsg,
            data: null,
            total: 0
        };
    } catch (error) {
        console.error('GHN calculateShippingFee exception:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return {
            success: false,
            error: error.response?.data?.message || error.response?.data?.code_message || error.message || 'Không thể tính phí vận chuyển',
            data: null,
            total: 0
        };
    }
};

/**
 * Lấy danh sách dịch vụ vận chuyển
 */
export const getAvailableServices = async (toDistrictId, toWardCode) => {
    try {
        // Kiểm tra địa chỉ shop
        if (!ghnConfig.shopAddress.districtId) {
            console.error('GHN shop district not configured');
            return {
                success: false,
                error: 'Chưa cấu hình địa chỉ shop',
                data: []
            };
        }

        const response = await GHN_API.post('/shiip/public-api/v2/shipping-order/available-services', {
            shop_id: parseInt(ghnConfig.shopId),
            from_district: parseInt(ghnConfig.shopAddress.districtId),
            to_district: parseInt(toDistrictId),
            to_ward: toWardCode
        });

        return {
            success: true,
            data: response.data?.data || []
        };
    } catch (error) {
        console.error('GHN getAvailableServices error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            data: []
        };
    }
};

/**
 * Tạo đơn hàng GHN
 */
export const createGHNOrder = async (orderData) => {
    try {
        const {
            toName,
            toPhone,
            toAddress,
            toWardCode,
            toDistrictId,
            toProvinceId,
            weight = 200,
            length = 20,
            width = 15,
            height = 2,
            serviceTypeId = 2,
            serviceId = null,
            paymentTypeId = 1, // 1: Người gửi trả, 2: Người nhận trả
            requiredNote = "CHOXEMHANGKHONGTHU",
            items = [],
            codAmount = 0,
            content = ""
        } = orderData;

        // Validate địa chỉ shop
        if (!ghnConfig.shopAddress.districtId || !ghnConfig.shopAddress.wardCode) {
            console.error('GHN shop address not configured:', ghnConfig.shopAddress);
            return {
                success: false,
                error: 'Chưa cấu hình địa chỉ shop. Vui lòng cấu hình GHN_SHOP_DISTRICT_ID và GHN_SHOP_WARD_CODE trong file .env hoặc ghn.config.js',
                data: null,
                orderCode: null
            };
        }

        // Nếu không có serviceId, thử lấy từ available services
        let finalServiceId = serviceId;
        if (!finalServiceId) {
            console.log('⚠️ serviceId not provided, attempting to get from available services...');
            try {
                const servicesResult = await getAvailableServices(toDistrictId, toWardCode);
                if (servicesResult.success && servicesResult.data && servicesResult.data.length > 0) {
                    // Tìm service phù hợp với serviceTypeId
                    const matchedService = servicesResult.data.find(s => 
                        s.service_type_id === parseInt(serviceTypeId)
                    ) || servicesResult.data[0]; // Nếu không tìm thấy, lấy service đầu tiên
                    
                    if (matchedService && matchedService.service_id) {
                        finalServiceId = matchedService.service_id;
                        console.log('✅ Found service_id:', finalServiceId, 'from available services');
                    }
                }
            } catch (error) {
                console.warn('⚠️ Could not get service_id from available services:', error.message);
            }
        }

        const payload = {
            // QUAN TRỌNG: shop_id trong payload để đơn hàng hiển thị đúng shop
            shop_id: parseInt(ghnConfig.shopId),
            payment_type_id: parseInt(paymentTypeId),
            note: content || "",
            required_note: requiredNote,
            // Thông tin người nhận
            to_name: toName,
            to_phone: toPhone,
            to_address: toAddress,
            to_ward_code: String(toWardCode),
            to_district_id: parseInt(toDistrictId),
            to_province_id: parseInt(toProvinceId),
            // Thông tin shop (người gửi) - QUAN TRỌNG để đơn hàng hiển thị
            from_name: ghnConfig.shopAddress.address || "Shop",
            from_phone: "", // Có thể thêm số điện thoại shop nếu có
            from_address: ghnConfig.shopAddress.address,
            from_ward_code: String(ghnConfig.shopAddress.wardCode),
            from_district_id: parseInt(ghnConfig.shopAddress.districtId),
            from_province_id: parseInt(ghnConfig.shopAddress.provinceId),
            // Thông tin đơn hàng
            weight: Math.max(parseInt(weight) || 200, 200), // Tối thiểu 200g
            length: Math.max(parseInt(length) || 20, 1),
            width: Math.max(parseInt(width) || 15, 1),
            height: Math.max(parseInt(height) || 2, 1),
            service_type_id: parseInt(serviceTypeId),
            service_id: finalServiceId ? parseInt(finalServiceId) : null,
            cod_amount: parseInt(codAmount) || 0,
            // Items - format đơn giản theo GHN API
            items: items.length > 0 ? items.map(item => ({
                name: item.name || "Sách",
                quantity: parseInt(item.quantity) || 1,
                weight: Math.max(parseInt(item.weight) || parseInt(weight) || 200, 200)
            })) : [
                {
                    name: "Sách",
                    quantity: 1,
                    weight: Math.max(parseInt(weight) || 200, 200)
                }
            ]
        };

        console.log('=== GHN Create Order ===');
        console.log('URL:', `${ghnConfig.baseUrl}/shiip/public-api/v2/shipping-order/create`);
        console.log('ShopId (Header):', ghnConfig.shopId);
        console.log('shop_id (Payload):', payload.shop_id);
        console.log('Payload:', JSON.stringify(payload, null, 2));

        // QUAN TRỌNG: Sử dụng GHN_API_WITH_SHOP để có ShopId trong header
        const response = await GHN_API_WITH_SHOP.post('/shiip/public-api/v2/shipping-order/create', payload);

        console.log('=== GHN Create Order Response ===');
        console.log('Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        // GHN API trả về code: 200 khi thành công
        if (response.data && response.data.code === 200) {
            const orderCode = response.data?.data?.order_code;
            console.log('✅ Order created successfully. Order Code:', orderCode);
            console.log('📋 Check order on: https://5sao.ghn.dev/order/order-created');
            return {
                success: true,
                data: response.data?.data || null,
                orderCode: orderCode,
                message: response.data?.message || 'Tạo đơn hàng thành công'
            };
        }

        // Nếu không thành công
        const errorMsg = response.data?.message || response.data?.code_message || 'Không thể tạo đơn hàng';
        console.error('❌ GHN Create Order Error:', {
            code: response.data?.code,
            message: errorMsg,
            fullResponse: response.data
        });
        return {
            success: false,
            error: errorMsg,
            data: null,
            orderCode: null
        };
    } catch (error) {
        console.error('=== GHN Create Order Exception ===');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Response Status:', error.response?.status);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Request URL:', error.config?.url);
        console.error('Request Headers:', {
            ...error.config?.headers,
            Token: error.config?.headers?.Token ? error.config.headers.Token.substring(0, 15) + '...' : 'missing',
            ShopId: error.config?.headers?.ShopId || 'missing'
        });

        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.code_message || 
                        error.message || 
                        'Lỗi khi tạo đơn hàng GHN';
        
        console.error('Final Error Message:', errorMsg);
        
        return {
            success: false,
            error: errorMsg,
            data: null,
            orderCode: null
        };
    }
};

/**
 * Tra cứu đơn hàng
 */
export const getOrderInfo = async (orderCode) => {
    try {
        console.log('=== GHN Get Order Info ===');
        console.log('Order Code:', orderCode);
        
        // Sử dụng GHN_API_WITH_SHOP để có ShopId trong header
        const response = await GHN_API_WITH_SHOP.post('/shiip/public-api/v2/shipping-order/detail', {
            order_code: orderCode
        });

        console.log('=== GHN Get Order Info Response ===');
        console.log('Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.code === 200) {
            return {
                success: true,
                data: response.data?.data || null
            };
        }

        const errorMsg = response.data?.message || response.data?.code_message || 'Không thể tra cứu đơn hàng';
        console.error('❌ GHN Get Order Info Error:', {
            code: response.data?.code,
            message: errorMsg
        });
        return {
            success: false,
            error: errorMsg,
            data: null
        };
    } catch (error) {
        console.error('=== GHN Get Order Info Exception ===');
        console.error('Error Message:', error.message);
        console.error('Response Status:', error.response?.status);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.code_message || 
                        error.message || 
                        'Lỗi khi tra cứu đơn hàng GHN';
        
        return {
            success: false,
            error: errorMsg,
            data: null
        };
    }
};

