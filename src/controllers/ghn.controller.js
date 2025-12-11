import {
    getProvinces,
    getDistricts,
    getWards,
    calculateShippingFee,
    getAvailableServices,
    createGHNOrder,
    getOrderInfo
} from '../services/ghn.service.js';

/**
 * Lấy danh sách tỉnh/thành phố
 */
export const getProvincesController = async (req, res) => {
    try {
        console.log('Getting GHN provinces...');
        const result = await getProvinces();
        
        console.log('GHN provinces result:', {
            success: result.success,
            dataLength: result.data?.length || 0,
            error: result.error
        });
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể lấy danh sách tỉnh/thành phố',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách tỉnh/thành phố thành công',
            data: result.data
        });
    } catch (error) {
        console.error('getProvincesController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách tỉnh/thành phố',
            data: []
        });
    }
};

/**
 * Lấy danh sách quận/huyện
 */
export const getDistrictsController = async (req, res) => {
    try {
        const { provinceId } = req.body;

        if (!provinceId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu provinceId',
                data: []
            });
        }

        const result = await getDistricts(provinceId);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể lấy danh sách quận/huyện',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách quận/huyện thành công',
            data: result.data
        });
    } catch (error) {
        console.error('getDistrictsController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách quận/huyện',
            data: []
        });
    }
};

/**
 * Lấy danh sách phường/xã
 */
export const getWardsController = async (req, res) => {
    try {
        const { districtId } = req.body;

        if (!districtId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu districtId',
                data: []
            });
        }

        const result = await getWards(districtId);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể lấy danh sách phường/xã',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách phường/xã thành công',
            data: result.data
        });
    } catch (error) {
        console.error('getWardsController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách phường/xã',
            data: []
        });
    }
};

/**
 * Tính phí vận chuyển
 */
export const calculateShippingFeeController = async (req, res) => {
    try {
        const {
            toDistrictId,
            toWardCode,
            weight,
            length,
            width,
            height,
            serviceTypeId,
            serviceId,
            insuranceValue
        } = req.body;

        if (!toDistrictId || !toWardCode) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin địa chỉ nhận hàng',
                data: null
            });
        }

        console.log('calculateShippingFeeController - Request:', {
            toDistrictId,
            toWardCode,
            serviceTypeId,
            weight
        });

        const result = await calculateShippingFee({
            toDistrictId,
            toWardCode,
            weight,
            length,
            width,
            height,
            serviceTypeId,
            serviceId,
            insuranceValue
        });

        console.log('calculateShippingFeeController - Result:', {
            success: result.success,
            error: result.error,
            total: result.total
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể tính phí vận chuyển',
                data: null,
                total: 0
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tính phí vận chuyển thành công',
            data: result.data,
            total: result.total,
            serviceFee: result.serviceFee,
            insuranceFee: result.insuranceFee
        });
    } catch (error) {
        console.error('calculateShippingFeeController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tính phí vận chuyển',
            data: null
        });
    }
};

/**
 * Lấy danh sách dịch vụ vận chuyển
 */
export const getAvailableServicesController = async (req, res) => {
    try {
        const { toDistrictId, toWardCode } = req.body;

        if (!toDistrictId || !toWardCode) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin địa chỉ nhận hàng',
                data: []
            });
        }

        const result = await getAvailableServices(toDistrictId, toWardCode);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể lấy danh sách dịch vụ',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách dịch vụ thành công',
            data: result.data
        });
    } catch (error) {
        console.error('getAvailableServicesController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách dịch vụ',
            data: []
        });
    }
};

/**
 * Tạo đơn hàng GHN
 */
export const createGHNOrderController = async (req, res) => {
    try {
        const orderData = req.body;
        
        console.log('=== createGHNOrderController - Request ===');
        console.log('Order Data:', JSON.stringify(orderData, null, 2));

        const result = await createGHNOrder(orderData);

        console.log('=== createGHNOrderController - Result ===');
        console.log('Success:', result.success);
        console.log('Order Code:', result.orderCode);
        console.log('Error:', result.error);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể tạo đơn hàng GHN',
                data: null,
                orderCode: null
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tạo đơn hàng GHN thành công',
            data: result.data,
            orderCode: result.orderCode
        });
    } catch (error) {
        console.error('=== createGHNOrderController - Exception ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo đơn hàng GHN',
            data: null,
            orderCode: null
        });
    }
};

/**
 * Tra cứu đơn hàng
 */
export const getOrderInfoController = async (req, res) => {
    try {
        const { orderCode } = req.body;

        if (!orderCode) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu orderCode',
                data: null
            });
        }

        const result = await getOrderInfo(orderCode);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể tra cứu đơn hàng',
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tra cứu đơn hàng thành công',
            data: result.data
        });
    } catch (error) {
        console.error('getOrderInfoController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tra cứu đơn hàng',
            data: null
        });
    }
};

