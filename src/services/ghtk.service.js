import axios from 'axios';
import { ghtkConfig } from '../config/ghtk.config.js';

const GHTK_API = axios.create({
    baseURL: ghtkConfig.baseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Token': ghtkConfig.token,
        'X-Client-Source': ghtkConfig.partnerCode
    }
});

/**
 * Chuẩn hóa tên địa chỉ cho GHTK
 * GHTK yêu cầu format chuẩn: "TP. Hồ Chí Minh", "Quận 8", "Phường 4"
 */
const normalizeAddressName = (name) => {
    if (!name) return '';

    let normalized = name.trim();

    // Nếu đã có format đúng (có dấu chấm, viết hoa đúng), giữ nguyên
    if (normalized.match(/^(TP\.|Tỉnh|Thành phố|Quận|Huyện|Phường|Xã)/i)) {
        return normalized;
    }

    // Xử lý các trường hợp đặc biệt cho tỉnh/thành phố
    // GHTK API dùng format: "TP Hồ Chí Minh" (không có dấu chấm) cho pick_province
    // Nhưng có thể dùng "TP. Hồ Chí Minh" (có dấu chấm) cho province (địa chỉ nhận)
    const provinceMap = {
        'ho chi minh': 'TP Hồ Chí Minh',
        'hcm': 'TP Hồ Chí Minh',
        'hồ chí minh': 'TP Hồ Chí Minh',
        'ha noi': 'TP Hà Nội',
        'hanoi': 'TP Hà Nội',
        'hà nội': 'TP Hà Nội',
        'da nang': 'TP Đà Nẵng',
        'danang': 'TP Đà Nẵng',
        'đà nẵng': 'TP Đà Nẵng',
        'cà mau': 'Cà Mau',
        'ca mau': 'Cà Mau'
    };

    const lowerName = normalized.toLowerCase();
    if (provinceMap[lowerName]) {
        return provinceMap[lowerName];
    }

    // Nếu đã có prefix "Quận", "Huyện", "Phường", "Xã" thì giữ nguyên
    if (normalized.match(/^(Quận|Huyện|Phường|Xã|Tỉnh|TP\.|Thành phố)/i)) {
        return normalized;
    }

    return normalized;
};

/**
 * Tính phí vận chuyển GHTK
 */
export const calculateShippingFee = async (data) => {
    try {
        const {
            pickProvince,
            pickDistrict,
            pickWard,
            province,
            district,
            ward,
            address,
            weight = 100, // Gram
            value = 0, // VNĐ
            transport = "fly" // fly hoặc road
        } = data;

        // Validate địa chỉ shop
        if (!ghtkConfig.shopAddress.pickProvince || !ghtkConfig.shopAddress.pickDistrict) {
            console.error('GHTK shop address not configured:', ghtkConfig.shopAddress);
            return {
                success: false,
                error: 'Chưa cấu hình địa chỉ shop. Vui lòng cấu hình GHTK_PICK_PROVINCE và GHTK_PICK_DISTRICT trong file .env hoặc ghtk.config.js',
                data: null,
                fee: 0
            };
        }

        // Validate địa chỉ nhận hàng
        if (!province || !district) {
            return {
                success: false,
                error: 'Thiếu thông tin địa chỉ nhận hàng (province, district)',
                data: null,
                fee: 0
            };
        }

        // Chuyển đổi weight sang Gram (integer)
        let weightInGram = parseInt(weight);
        if (weightInGram < 100) {
            // Nếu weight < 100, có thể là KG, chuyển sang gram
            weightInGram = Math.max(Math.round(parseFloat(weight) * 1000), 100);
        }

        // Chuẩn hóa tên địa chỉ
        // GHTK yêu cầu format đầy đủ: "TP. Hồ Chí Minh", "Quận 8", "Phường 4"
        const normalizedProvince = normalizeAddressName(province);

        // Giữ nguyên format đầy đủ cho district (ví dụ: "Quận 8", "Huyện Củ Chi")
        // KHÔNG bỏ prefix vì GHTK cần format đầy đủ
        let normalizedDistrict = normalizeAddressName(district);
        // Chỉ bỏ prefix nếu không phải là số (ví dụ: "Huyện Củ Chi" -> "Củ Chi", nhưng "Quận 8" -> giữ "Quận 8")
        if (!normalizedDistrict.match(/^(Quận|Huyện)\s+\d+$/i)) {
            // Nếu không phải format "Quận 8", "Huyện 1" thì thử bỏ prefix
            normalizedDistrict = normalizedDistrict.replace(/^(Huyện|Quận)\s+/i, '').trim();
        }

        // Giữ nguyên format đầy đủ cho ward (ví dụ: "Phường 4", "Xã Bản Lầu")
        const normalizedWard = ward ? normalizeAddressName(ward) : '';
        // Chỉ bỏ prefix nếu không phải là số
        let normalizedWardClean = normalizedWard;
        if (!normalizedWard.match(/^(Phường|Xã)\s+\d+$/i)) {
            // Nếu không phải format "Phường 4", "Xã 1" thì thử bỏ prefix
            normalizedWardClean = normalizedWard.replace(/^(Phường|Xã)\s+/i, '').trim();
        }

        // Build query parameters
        const params = new URLSearchParams();
        params.append('pick_province', pickProvince || ghtkConfig.shopAddress.pickProvince);
        params.append('pick_district', pickDistrict || ghtkConfig.shopAddress.pickDistrict);
        if (pickWard || ghtkConfig.shopAddress.pickWard) {
            params.append('pick_ward', pickWard || ghtkConfig.shopAddress.pickWard);
        }
        params.append('province', normalizedProvince);
        params.append('district', normalizedDistrict);
        // GHTK yêu cầu ward nếu có - gửi format đầy đủ
        if (normalizedWard) {
            // Ưu tiên format đầy đủ (có prefix) nếu là số, nếu không thì dùng format đã clean
            if (normalizedWard.match(/^(Phường|Xã)\s+\d+$/i)) {
                params.append('ward', normalizedWard);
            } else if (normalizedWardClean) {
                params.append('ward', normalizedWardClean);
            } else {
                params.append('ward', normalizedWard);
            }
        }
        // GHTK có thể yêu cầu address (số nhà, tên đường) - nếu không có thì thử gửi empty hoặc không gửi
        if (address && address.trim()) {
            params.append('address', address.trim());
        }
        params.append('weight', weightInGram.toString());
        if (value > 0) {
            params.append('value', parseInt(value).toString());
        }
        params.append('transport', transport || 'fly');

        const url = `/services/shipment/fee?${params.toString()}`;
        console.log('=== GHTK Calculate Fee Request ===');
        console.log('URL:', url);
        console.log('Params:', {
            pick_province: pickProvince || ghtkConfig.shopAddress.pickProvince,
            pick_district: pickDistrict || ghtkConfig.shopAddress.pickDistrict,
            province: normalizedProvince,
            district: normalizedDistrict,
            ward: normalizedWardClean || normalizedWard,
            address: address || '(không có)',
            weight: weightInGram,
            value
        });

        // GHTK API tính phí sử dụng GET request
        let response;
        try {
            response = await GHTK_API.get(url);
        } catch (error) {
            console.error('=== GHTK API Request Failed ===');
            console.error('Message:', error.message);
            console.error('Response:', error.response?.data);
            console.error('Status:', error.response?.status);

            if (error.response?.status === 403 || error.response?.status === 401) {
                return {
                    success: false,
                    error: 'Token GHTK không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại token trong cấu hình.',
                    data: null,
                    fee: 0
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Không thể kết nối đến GHTK API',
                data: null,
                fee: 0
            };
        }

        console.log('=== GHTK Fee Response ===');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

        // Kiểm tra response
        if (response.status !== 200) {
            return {
                success: false,
                error: `GHTK API trả về status ${response.status}. Vui lòng kiểm tra lại token và cấu hình.`,
                data: null,
                fee: 0
            };
        }

        // Kiểm tra success và fee
        if (response.data && response.data.success === true) {
            let feeAmount = 0;
            if (response.data.fee) {
                if (typeof response.data.fee === 'object' && response.data.fee.fee !== undefined) {
                    feeAmount = response.data.fee.fee || 0;
                } else if (typeof response.data.fee === 'number') {
                    feeAmount = response.data.fee;
                }
            }

            if (feeAmount > 0) {
                return {
                    success: true,
                    data: response.data,
                    fee: feeAmount
                };
            }
        }

        // Xử lý lỗi - kiểm tra nhiều trường hợp
        let errorMsg = 'Không thể tính phí vận chuyển';

        if (response.data?.message && response.data.message.trim()) {
            errorMsg = response.data.message;
        } else if (response.data?.error) {
            if (typeof response.data.error === 'string') {
                errorMsg = response.data.error;
            } else if (response.data.error?.message) {
                errorMsg = response.data.error.message;
            }
        } else if (response.data?.error_code) {
            errorMsg = `Mã lỗi: ${response.data.error_code}`;
        } else if (response.data?.errors && Array.isArray(response.data.errors) && response.data.errors.length > 0) {
            errorMsg = response.data.errors.map(e => typeof e === 'string' ? e : e.message || e).join(', ');
        } else if (response.data?.data && typeof response.data.data === 'string' && response.data.data.trim()) {
            errorMsg = response.data.data;
        } else if (!response.data?.success) {
            if (response.data?.fee === null || response.data?.fee === undefined) {
                const hasAddress = !!(address && address.trim());
                if (!hasAddress) {
                    errorMsg = 'GHTK yêu cầu địa chỉ chi tiết (số nhà, tên đường). Vui lòng nhập địa chỉ chi tiết.';
                } else {
                    errorMsg = 'GHTK không thể tính phí cho địa chỉ này. Vui lòng thử địa chỉ khác hoặc chọn GHN.';
                }
            } else {
                errorMsg = 'GHTK trả về kết quả không xác định. Vui lòng thử lại.';
            }
        }

        console.error('GHTK calculateShippingFee error:', {
            message: errorMsg,
            status: response.status,
            data: response.data
        });

        return {
            success: false,
            error: errorMsg,
            data: null,
            fee: 0
        };
    } catch (error) {
        console.error('=== GHTK calculateShippingFee Exception ===');
        console.error('Message:', error.message);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);

        if (error.response?.status === 403 || error.response?.status === 401) {
            return {
                success: false,
                error: 'Token GHTK không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại token trong cấu hình.',
                data: null,
                fee: 0
            };
        }

        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Không thể tính phí vận chuyển',
            data: null,
            fee: 0
        };
    }
};

/**
 * Tạo đơn hàng GHTK
 */
export const createGHTKOrder = async (orderData) => {
    try {
        const {
            orderId,
            toName,
            toPhone,
            toAddress,
            toProvince,
            toDistrict,
            toWard,
            toStreet,
            toHamlet,
            weight,
            value,
            pickMoney = 0,
            isFreeship = 0,
            note,
            products = [],
            transport = 'fly',
            pickOption = 'cod'
        } = orderData;

        // Validate required fields
        if (!toName || !toPhone || !toAddress || !toProvince || !toDistrict) {
            return {
                success: false,
                error: 'Thiếu thông tin bắt buộc (tên, số điện thoại, địa chỉ, tỉnh/thành phố, quận/huyện)',
                data: null,
                orderCode: null
            };
        }

        // GHTK yêu cầu street hoặc hamlet (thôn/ấp/xóm/tổ)
        // Nếu không có, dùng toAddress để tránh lỗi
        const streetValue = toStreet || toAddress;
        const hamletValue = toHamlet || toAddress;

        // Chuẩn hóa địa chỉ - giữ format đầy đủ
        const normalizedProvince = normalizeAddressName(toProvince);

        // Giữ format đầy đủ cho district (ví dụ: "Quận 8", "Huyện Củ Chi")
        let normalizedDistrict = normalizeAddressName(toDistrict);
        if (!normalizedDistrict.match(/^(Quận|Huyện)\s+\d+$/i)) {
            normalizedDistrict = normalizedDistrict.replace(/^(Huyện|Quận)\s+/i, '').trim();
        }

        // Giữ format đầy đủ cho ward
        let normalizedWard = toWard ? normalizeAddressName(toWard) : '';
        if (normalizedWard && !normalizedWard.match(/^(Phường|Xã)\s+\d+$/i)) {
            normalizedWard = normalizedWard.replace(/^(Phường|Xã)\s+/i, '').trim();
        }

        // Build request body theo format GHTK API
        const requestBody = {
            order: {
                id: orderId || `ORDER_${Date.now()}`,
                pick_name: ghtkConfig.shopAddress.pickName,
                pick_address: ghtkConfig.shopAddress.pickAddress,
                pick_province: ghtkConfig.shopAddress.pickProvince,
                pick_district: ghtkConfig.shopAddress.pickDistrict,
                pick_ward: ghtkConfig.shopAddress.pickWard,
                pick_tel: ghtkConfig.shopAddress.pickTel,
                name: toName,
                address: toAddress,
                province: normalizedProvince,
                district: normalizedDistrict,
                ward: normalizedWard || undefined,
                // GHTK yêu cầu street hoặc hamlet (thôn/ấp/xóm/tổ) - BẮT BUỘC
                // Đảm bảo luôn có giá trị để tránh lỗi "thiếu thông tin địa chỉ thôn/ấp/xóm/tổ"
                street: streetValue || toAddress,
                tel: toPhone,
                hamlet: hamletValue || toAddress,
                is_freeship: isFreeship,
                pick_money: pickMoney,
                note: note || '',
                value: Math.round(value || 0),
                transport: transport,
                pick_option: pickOption
            },
            products: (() => {
                // GHTK yêu cầu weight theo đơn vị kg
                // Frontend gửi weight theo gram, cần chuyển sang kg
                // QUAN TRỌNG: GHTK tính tổng weight từ products array (weight * quantity)
                // Đảm bảo tổng weight < 20kg (20000g) để tránh lỗi

                // Tính tổng weight hiện tại (theo gram)
                let totalWeightInGram = products.reduce((sum, p) => {
                    const weight = p.weight || 100; // gram
                    const quantity = p.quantity || 1;
                    return sum + (weight * quantity);
                }, 0);

                // Nếu tổng weight >= 20kg (20000g), điều chỉnh lại
                const MAX_WEIGHT_GRAM = 19000; // 19kg để an toàn, dưới 20kg
                if (totalWeightInGram >= MAX_WEIGHT_GRAM) {
                    console.warn(`⚠️ Total products weight (${totalWeightInGram}g) >= ${MAX_WEIGHT_GRAM}g, adjusting...`);
                    const adjustmentFactor = MAX_WEIGHT_GRAM / totalWeightInGram;

                    return products.map(product => {
                        const originalWeight = product.weight || 100; // gram
                        const adjustedWeight = Math.max(Math.floor(originalWeight * adjustmentFactor), 1); // Tối thiểu 1g
                        const weightInKg = adjustedWeight / 1000; // Chuyển sang kg

                        return {
                            name: product.name || 'Sản phẩm',
                            weight: Math.max(weightInKg, 0.001), // Tối thiểu 0.001kg (1g) cho GHTK
                            quantity: product.quantity || 1,
                            price: Math.round(product.price || 0)
                        };
                    });
                }

                // Nếu tổng weight < 20kg, giữ nguyên nhưng chuyển sang kg
                return products.map(product => {
                    const weightInGram = product.weight || 100; // gram
                    const weightInKg = weightInGram / 1000; // Chuyển sang kg

                    return {
                        name: product.name || 'Sản phẩm',
                        weight: Math.max(weightInKg, 0.001), // Tối thiểu 0.001kg (1g) cho GHTK
                        quantity: product.quantity || 1,
                        price: Math.round(product.price || 0)
                    };
                });
            })()
        };

        console.log('=== GHTK Create Order Request ===');
        console.log('URL:', '/services/shipment/order');
        console.log('Body:', JSON.stringify(requestBody, null, 2));

        const response = await GHTK_API.post('/services/shipment/order', requestBody);

        console.log('=== GHTK Create Order Response ===');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

        if (response.status === 200 && response.data && response.data.success === true) {
            return {
                success: true,
                data: response.data,
                orderCode: response.data.order?.label || response.data.order?.tracking_id || null
            };
        }

        return {
            success: false,
            error: response.data?.message || 'Không thể tạo đơn hàng GHTK',
            data: response.data,
            orderCode: null
        };
    } catch (error) {
        console.error('=== GHTK createGHTKOrder Exception ===');
        console.error('Message:', error.message);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);

        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Không thể tạo đơn hàng GHTK',
            data: null,
            orderCode: null
        };
    }
};

/**
 * Tra cứu đơn hàng GHTK
 */
export const getGHTKOrderInfo = async (orderCode) => {
    try {
        if (!orderCode) {
            return {
                success: false,
                error: 'Thiếu orderCode',
                data: null
            };
        }

        const url = `/services/shipment/v2/${orderCode}`;
        console.log('=== GHTK Get Order Info Request ===');
        console.log('URL:', url);

        const response = await GHTK_API.get(url);

        console.log('=== GHTK Get Order Info Response ===');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

        if (response.status === 200 && response.data && response.data.success === true) {
            return {
                success: true,
                data: response.data
            };
        }

        return {
            success: false,
            error: response.data?.message || 'Không thể tra cứu đơn hàng GHTK',
            data: response.data
        };
    } catch (error) {
        console.error('=== GHTK getGHTKOrderInfo Exception ===');
        console.error('Message:', error.message);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);

        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Không thể tra cứu đơn hàng GHTK',
            data: null
        };
    }
};

/**
 * Lấy danh sách địa chỉ lấy hàng (pick addresses)
 */
export const getPickAddresses = async () => {
    try {
        const url = `/services/shipment/list_pick_add`;
        console.log('=== GHTK Get Pick Addresses Request ===');
        console.log('URL:', url);

        const response = await GHTK_API.get(url);

        console.log('=== GHTK Get Pick Addresses Response ===');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

        if (response.status === 200 && response.data && response.data.success === true) {
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Lấy danh sách địa chỉ lấy hàng thành công'
            };
        }

        return {
            success: false,
            error: response.data?.message || 'Không thể lấy danh sách địa chỉ lấy hàng',
            data: []
        };
    } catch (error) {
        console.error('=== GHTK getPickAddresses Exception ===');
        console.error('Message:', error.message);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);

        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Không thể lấy danh sách địa chỉ lấy hàng',
            data: []
        };
    }
};

/**
 * Test kết nối GHTK API
 */
export const testGHTKConnection = async () => {
    try {
        const response = await GHTK_API.get('/services/authenticated');

        console.log('=== GHTK Test Connection ===');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

        if (response.status === 200) {
            return {
                success: true,
                message: 'Kết nối GHTK API thành công',
                data: response.data
            };
        }

        return {
            success: false,
            message: 'Kết nối GHTK API thất bại',
            data: response.data
        };
    } catch (error) {
        console.error('=== GHTK Test Connection Failed ===');
        console.error('Message:', error.message);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);

        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Không thể kết nối đến GHTK API',
            data: null
        };
    }
};

