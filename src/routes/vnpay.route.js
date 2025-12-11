import express from 'express';
import { createPaymentUrl, vnpayReturn, vnpayIPN, queryTransaction, refundTransaction } from '../controllers/vnpay.controller.js';

const vnpayRouter = express.Router();

// Tạo URL thanh toán VNPay
vnpayRouter.post('/create_payment_url', createPaymentUrl);

// Xử lý kết quả trả về từ VNPay (Return URL)
vnpayRouter.get('/vnpay_return', vnpayReturn);

// Xử lý IPN (Instant Payment Notification) từ VNPay
vnpayRouter.get('/vnpay_ipn', vnpayIPN);

// Truy vấn giao dịch
vnpayRouter.post('/querydr', queryTransaction);

// Hoàn tiền giao dịch
vnpayRouter.post('/refund', refundTransaction);

export default vnpayRouter;

