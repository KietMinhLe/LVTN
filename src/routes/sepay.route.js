import express from 'express';
import { createPaymentForm, sepayReturn, sepayWebhook } from '../controllers/sepay.controller.js';

const sepayRouter = express.Router();

// Test endpoint để kiểm tra route hoạt động
sepayRouter.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'SePay route is working!',
        timestamp: new Date().toISOString()
    });
});

// Tạo form thanh toán SePay
sepayRouter.post('/create_payment_form', createPaymentForm);

// Xử lý kết quả trả về từ SePay (Return URL)
sepayRouter.get('/return', sepayReturn);

// Xử lý webhook từ SePay (IPN)
sepayRouter.post('/webhook', sepayWebhook);

export default sepayRouter;
