import {
    calculateShippingFee,
    createGHTKOrder,
    getGHTKOrderInfo,
    testGHTKConnection,
    getPickAddresses
} from '../services/ghtk.service.js';

/**
 * Test kết nối GHTK API
 */
export const testGHTKConnectionController = async (req, res) => {
    try {
        console.log('Testing GHTK connection...');
        const result = await testGHTKConnection();
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message || 'Không thể kết nối đến GHTK API',
                data: result.data
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message || 'Kết nối GHTK API thành công',
            data: result.data
        });
    } catch (error) {
        console.error('testGHTKConnectionController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi test kết nối GHTK',
            data: null
        });
    }
};

/**
 * Tính phí vận chuyển GHTK
 */
export const calculateShippingFeeController = async (req, res) => {
    try {
        const {
            pickProvince,
            pickDistrict,
            pickWard,
            province,
            district,
            ward,
            address,
            weight,
            value,
            transport
        } = req.body;

        if (!province || !district) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin địa chỉ nhận hàng (province, district)',
                data: null,
                fee: 0
            });
        }

        console.log('=== calculateGHTKShippingFeeController - Request ===');
        console.log('Request:', {
            province,
            district,
            ward,
            address,
            weight,
            value
        });

        const result = await calculateShippingFee({
            pickProvince,
            pickDistrict,
            pickWard,
            province,
            district,
            ward,
            address,
            weight,
            value,
            transport
        });

        console.log('=== calculateGHTKShippingFeeController - Result ===');
        console.log('Success:', result.success);
        console.log('Fee:', result.fee);
        console.log('Error:', result.error);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể tính phí vận chuyển GHTK',
                data: null,
                fee: 0
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tính phí vận chuyển GHTK thành công',
            data: result.data,
            fee: result.fee
        });
    } catch (error) {
        console.error('=== calculateGHTKShippingFeeController - Exception ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tính phí vận chuyển GHTK',
            data: null,
            fee: 0
        });
    }
};

/**
 * Tạo đơn hàng GHTK
 */
export const createGHTKOrderController = async (req, res) => {
    try {
        const orderData = req.body;
        
        console.log('=== createGHTKOrderController - Request ===');
        console.log('Order Data:', JSON.stringify(orderData, null, 2));

        const result = await createGHTKOrder(orderData);

        console.log('=== createGHTKOrderController - Result ===');
        console.log('Success:', result.success);
        console.log('Order Code:', result.orderCode);
        console.log('Error:', result.error);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể tạo đơn hàng GHTK',
                data: null,
                orderCode: null
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tạo đơn hàng GHTK thành công',
            data: result.data,
            orderCode: result.orderCode
        });
    } catch (error) {
        console.error('=== createGHTKOrderController - Exception ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo đơn hàng GHTK',
            data: null,
            orderCode: null
        });
    }
};

/**
 * Lấy danh sách địa chỉ lấy hàng
 */
export const getPickAddressesController = async (req, res) => {
    try {
        const result = await getPickAddresses();

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể lấy danh sách địa chỉ lấy hàng',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message || 'Lấy danh sách địa chỉ lấy hàng thành công',
            data: result.data
        });
    } catch (error) {
        console.error('getPickAddressesController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách địa chỉ lấy hàng',
            data: []
        });
    }
};

/**
 * Tra cứu đơn hàng GHTK
 */
export const getGHTKOrderInfoController = async (req, res) => {
    try {
        const { orderCode } = req.body;

        if (!orderCode) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu orderCode',
                data: null
            });
        }

        const result = await getGHTKOrderInfo(orderCode);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'Không thể tra cứu đơn hàng GHTK',
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tra cứu đơn hàng GHTK thành công',
            data: result.data
        });
    } catch (error) {
        console.error('getGHTKOrderInfoController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tra cứu đơn hàng GHTK',
            data: null
        });
    }
};

