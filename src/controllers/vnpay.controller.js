import crypto from 'crypto';
import qs from 'qs';
import axios from 'axios';
import { vnpayConfig } from '../config/vnpay.config.js';
import prisma from '../config/db.js';

// Hàm sắp xếp object theo key (giống code demo VNPay)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        // Decode key để lấy key gốc từ object
        const originalKey = decodeURIComponent(str[key]);
        const value = obj[originalKey];
        sorted[str[key]] = encodeURIComponent(String(value)).replace(/%20/g, "+");
    }
    return sorted;
}

function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
}

// Tạo URL thanh toán VNPay
export const createPaymentUrl = async (req, res) => {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';

        const date = new Date();
        const createDate = formatDateTime(date);

        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
            '127.0.0.1';

        const { amount, orderId, orderInfo, bankCode, language } = req.body;

        if (!amount || !orderId) {
            return res.status(400).json({
                message: "Thiếu thông tin: amount và orderId là bắt buộc",
                success: false
            });
        }

        const tmnCode = vnpayConfig.vnp_TmnCode;
        const secretKey = vnpayConfig.vnp_HashSecret;
        const vnpUrl = vnpayConfig.vnp_Url;
        const returnUrl = vnpayConfig.vnp_ReturnUrl;

        const locale = language || 'vn';
        const currCode = 'VND';

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo || `Thanh toan cho ma GD:${orderId}`;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Math.round(amount * 100);
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        if (bankCode && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        const paymentUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

        return res.status(200).json({
            message: "Tạo URL thanh toán thành công",
            success: true,
            data: {
                paymentUrl: paymentUrl,
                orderId: orderId
            }
        });
    } catch (error) {
        console.error('Error creating payment URL:', error);
        return res.status(500).json({
            message: "Lỗi server khi tạo URL thanh toán",
            success: false,
            error: error.message
        });
    }
};

// Xử lý kết quả trả về từ VNPay (Return URL)
export const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = { ...req.query };
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const secretKey = vnpayConfig.vnp_HashSecret;
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const orderId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const transactionNo = vnp_Params['vnp_TransactionNo'];
        const amount = vnp_Params['vnp_Amount'] ? parseInt(vnp_Params['vnp_Amount']) / 100 : 0;

        if (secureHash === signed) {
            // Tìm đơn hàng trong database
            let donHang = null;
            try {
                donHang = await prisma.donhang.findFirst({
                    where: {
                        OR: [
                            { ma_don_hang: orderId },
                            { don_hang_id: parseInt(orderId) }
                        ]
                    }
                });
            } catch (dbError) {
                console.error('Error finding order:', dbError);
            }

            const frontendUrl = vnpayConfig.vnp_FrontendUrl;

            if (responseCode === '00') {
                // Thanh toán thành công
                if (donHang && donHang.trang_thai === 'Chờ thanh toán') {
                    try {
                        await prisma.donhang.update({
                            where: { don_hang_id: donHang.don_hang_id },
                            data: {
                                trang_thai: 'Đã xác nhận',
                                ngay_cap_nhat: new Date()
                            }
                        });
                    } catch (updateError) {
                        console.error('Error updating order:', updateError);
                    }
                }
                return res.redirect(`${frontendUrl}/orders?status=success&orderId=${orderId}&transactionNo=${transactionNo}`);
            } else {
                // Thanh toán thất bại
                if (donHang && donHang.trang_thai === 'Chờ thanh toán') {
                    try {
                        await prisma.donhang.update({
                            where: { don_hang_id: donHang.don_hang_id },
                            data: {
                                trang_thai: 'Thanh toán thất bại',
                                ngay_cap_nhat: new Date()
                            }
                        });
                    } catch (updateError) {
                        console.error('Error updating order:', updateError);
                    }
                }
                return res.redirect(`${frontendUrl}/orders?status=failed&orderId=${orderId}&responseCode=${responseCode}`);
            }
        } else {
            // Chữ ký không hợp lệ
            const frontendUrl = vnpayConfig.vnp_FrontendUrl;
            return res.redirect(`${frontendUrl}/orders?status=error&message=Invalid signature`);
        }
    } catch (error) {
        console.error('Error processing VNPay return:', error);
        const frontendUrl = vnpayConfig.vnp_FrontendUrl;
        return res.redirect(`${frontendUrl}/orders?status=error&message=Server error`);
    }
};

// Xử lý IPN (Instant Payment Notification) từ VNPay
export const vnpayIPN = async (req, res) => {
    try {
        let vnp_Params = { ...req.query };
        const secureHash = vnp_Params['vnp_SecureHash'];
        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        const secretKey = vnpayConfig.vnp_HashSecret;
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        let checkOrderId = false;
        let checkAmount = false;
        let paymentStatus = '0';
        let donHang = null;

        try {
            donHang = await prisma.donhang.findFirst({
                where: {
                    OR: [
                        { ma_don_hang: orderId },
                        { don_hang_id: parseInt(orderId) }
                    ]
                }
            });

            if (donHang) {
                checkOrderId = true;
                const vnpAmount = vnp_Params['vnp_Amount'] ? parseInt(vnp_Params['vnp_Amount']) / 100 : 0;
                const orderAmount = parseFloat(donHang.tong_tien);
                checkAmount = Math.abs(vnpAmount - orderAmount) < 0.01;

                if (donHang.trang_thai === 'Đã xác nhận' || donHang.trang_thai === 'Đang xử lý') {
                    paymentStatus = '1';
                } else if (donHang.trang_thai === 'Đã hủy') {
                    paymentStatus = '2';
                }
            }
        } catch (dbError) {
            console.error('Error checking order:', dbError);
        }

        if (secureHash === signed) {
            if (checkOrderId) {
                if (checkAmount) {
                    if (paymentStatus === '0') {
                        if (rspCode === '00') {
                            // Thanh toán thành công
                            if (donHang && donHang.trang_thai === 'Chờ thanh toán') {
                                try {
                                    await prisma.donhang.update({
                                        where: { don_hang_id: donHang.don_hang_id },
                                        data: {
                                            trang_thai: 'Đã xác nhận',
                                            ngay_cap_nhat: new Date()
                                        }
                                    });
                                } catch (updateError) {
                                    console.error('Error updating order:', updateError);
                                }
                            }
                            return res.status(200).json({ RspCode: '00', Message: 'Success' });
                        } else {
                            // Thanh toán thất bại
                            if (donHang && donHang.trang_thai === 'Chờ thanh toán') {
                                try {
                                    await prisma.donhang.update({
                                        where: { don_hang_id: donHang.don_hang_id },
                                        data: {
                                            trang_thai: 'Thanh toán thất bại',
                                            ngay_cap_nhat: new Date()
                                        }
                                    });
                                } catch (updateError) {
                                    console.error('Error updating order:', updateError);
                                }
                            }
                            return res.status(200).json({ RspCode: '00', Message: 'Success' });
                        }
                    } else {
                        return res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' });
                    }
                } else {
                    return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
                }
            } else {
                return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }
        } else {
            return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }
    } catch (error) {
        console.error('Error processing VNPay IPN:', error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

export const queryTransaction = async (req, res) => {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        const { orderId, transDate, orderInfo } = req.body;

        if (!orderId || !transDate) {
            return res.status(400).json({
                message: "Thiếu orderId hoặc transDate",
                success: false
            });
        }

        const date = new Date();
        const vnp_RequestId = formatTime(date);
        const vnp_CreateDate = formatDateTime(date);
        const vnp_Version = '2.1.0';
        const vnp_Command = 'querydr';
        const vnp_TmnCode = vnpayConfig.vnp_TmnCode;
        const vnp_IpAddr = req.headers['x-forwarded-for'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
            '127.0.0.1';
        const vnp_OrderInfo = orderInfo || `Truy van GD ma:${orderId}`;

        const dataToSign = [
            vnp_RequestId,
            vnp_Version,
            vnp_Command,
            vnp_TmnCode,
            orderId,
            transDate,
            vnp_CreateDate,
            vnp_IpAddr,
            vnp_OrderInfo
        ].join('|');

        const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
        const vnp_SecureHash = hmac.update(Buffer.from(dataToSign, 'utf-8')).digest("hex");

        const payload = {
            vnp_RequestId,
            vnp_Version,
            vnp_Command,
            vnp_TmnCode,
            vnp_TxnRef: orderId,
            vnp_OrderInfo,
            vnp_TransactionDate: transDate,
            vnp_CreateDate,
            vnp_IpAddr,
            vnp_SecureHash
        };

        const { data } = await axios.post(vnpayConfig.vnp_Api, payload);

        return res.status(200).json({
            message: "Truy vấn giao dịch thành công",
            success: true,
            data
        });
    } catch (error) {
        console.error('Error querying VNPay transaction:', error);
        return res.status(500).json({
            message: "Lỗi server khi truy vấn giao dịch",
            success: false,
            error: error.message
        });
    }
};

export const refundTransaction = async (req, res) => {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        const {
            orderId,
            transDate,
            amount,
            transType,
            user,
            orderInfo
        } = req.body;

        if (!orderId || !transDate || !amount || !transType || !user) {
            return res.status(400).json({
                message: "Thiếu thông tin: orderId, transDate, amount, transType, user",
                success: false
            });
        }

        const date = new Date();
        const vnp_RequestId = formatTime(date);
        const vnp_CreateDate = formatDateTime(date);
        const vnp_Version = '2.1.0';
        const vnp_Command = 'refund';
        const vnp_TmnCode = vnpayConfig.vnp_TmnCode;
        const vnp_IpAddr = req.headers['x-forwarded-for'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
            '127.0.0.1';
        const vnp_OrderInfo = orderInfo || `Hoan tien GD ma:${orderId}`;
        const vnp_Amount = Math.round(parseFloat(amount) * 100);
        const vnp_TransactionNo = '0';

        const dataToSign = [
            vnp_RequestId,
            vnp_Version,
            vnp_Command,
            vnp_TmnCode,
            transType,
            orderId,
            vnp_Amount,
            vnp_TransactionNo,
            transDate,
            user,
            vnp_CreateDate,
            vnp_IpAddr,
            vnp_OrderInfo
        ].join('|');

        const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
        const vnp_SecureHash = hmac.update(Buffer.from(dataToSign, 'utf-8')).digest("hex");

        const payload = {
            vnp_RequestId,
            vnp_Version,
            vnp_Command,
            vnp_TmnCode,
            vnp_TransactionType: transType,
            vnp_TxnRef: orderId,
            vnp_Amount,
            vnp_TransactionNo,
            vnp_CreateBy: user,
            vnp_OrderInfo,
            vnp_TransactionDate: transDate,
            vnp_CreateDate,
            vnp_IpAddr,
            vnp_SecureHash
        };

        const { data } = await axios.post(vnpayConfig.vnp_Api, payload);

        return res.status(200).json({
            message: "Hoàn tiền giao dịch thành công",
            success: true,
            data
        });
    } catch (error) {
        console.error('Error refunding VNPay transaction:', error);
        return res.status(500).json({
            message: "Lỗi server khi hoàn tiền giao dịch",
            success: false,
            error: error.message
        });
    }
};
