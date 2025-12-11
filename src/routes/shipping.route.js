import express from 'express';
import {
    getProvincesController,
    getDistrictsController,
    getWardsController,
    calculateShippingFeeController,
    getAvailableServicesController,
    createGHNOrderController,
    getOrderInfoController
} from '../controllers/ghn.controller.js';
import {
    testGHTKConnectionController,
    calculateShippingFeeController as calculateGHTKShippingFeeController,
    createGHTKOrderController,
    getGHTKOrderInfoController,
    getPickAddressesController
} from '../controllers/ghtk.controller.js';

const shippingRouter = express.Router();

// ========== GHN Routes ==========
// Lấy danh sách tỉnh/thành phố
shippingRouter.get('/provinces', getProvincesController);

// Lấy danh sách quận/huyện
shippingRouter.post('/districts', getDistrictsController);

// Lấy danh sách phường/xã
shippingRouter.post('/wards', getWardsController);

// Tính phí vận chuyển
shippingRouter.post('/fee', calculateShippingFeeController);

// Lấy danh sách dịch vụ vận chuyển
shippingRouter.post('/services', getAvailableServicesController);

// Tạo đơn hàng GHN
shippingRouter.post('/order', createGHNOrderController);

// Tra cứu đơn hàng
shippingRouter.post('/order/info', getOrderInfoController);

// ========== GHTK Routes ==========
// Test kết nối GHTK
shippingRouter.get('/ghtk/test', testGHTKConnectionController);

// Lấy danh sách địa chỉ lấy hàng
shippingRouter.get('/ghtk/pick-addresses', getPickAddressesController);

// Tính phí vận chuyển GHTK
shippingRouter.post('/ghtk/fee', calculateGHTKShippingFeeController);

// Tạo đơn hàng GHTK
shippingRouter.post('/ghtk/order', createGHTKOrderController);

// Tra cứu đơn hàng GHTK
shippingRouter.post('/ghtk/order/info', getGHTKOrderInfoController);

export default shippingRouter;

