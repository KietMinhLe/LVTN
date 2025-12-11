import { SePayPgClient } from 'sepay-pg-node';
import { sepayConfig, createRedirectUrl } from '../config/sepay.config.js';
import prisma from '../config/db.js';

// Khởi tạo SePay client
const sepayClient = new SePayPgClient({
    env: sepayConfig.env,
    merchant_id: sepayConfig.merchant_id,
    secret_key: sepayConfig.secret_key
});

// Tạo form thanh toán SePay
export const createPaymentForm = async (req, res) => {
    try {
        const { orderId, amount, orderDescription, paymentMethod } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({
                message: "Thiếu thông tin: orderId và amount là bắt buộc",
                success: false
            });
        }

        // Tìm đơn hàng trong database
        let donHang = null;
        try {
            // Thử tìm bằng don_hang_id trước (nếu orderId là số)
            const orderIdNum = parseInt(orderId);
            if (!isNaN(orderIdNum)) {
                donHang = await prisma.donhang.findUnique({
                    where: {
                        don_hang_id: orderIdNum
                    }
                });
            }

            // Nếu không tìm thấy, thử tìm bằng ma_don_hang
            if (!donHang) {
                donHang = await prisma.donhang.findFirst({
                    where: {
                        OR: [
                            { ma_don_hang: orderId },
                            { ma_don_hang: orderId.toString() }
                        ]
                    }
                });
            }
        } catch (dbError) {
            console.error('Error finding order:', dbError);
            return res.status(500).json({
                message: "Lỗi khi tìm đơn hàng",
                success: false,
                error: dbError.message
            });
        }

        if (!donHang) {
            console.error('Order not found. orderId:', orderId);
            return res.status(404).json({
                message: `Không tìm thấy đơn hàng với ID: ${orderId}`,
                success: false
            });
        }

        // URL checkout của SePay
        const checkoutURL = sepayConfig.env === 'production'
            ? 'https://pay.sepay.vn/v1/checkout/init'
            : 'https://pay-sandbox.sepay.vn/v1/checkout/init';

        const frontendUrl = sepayConfig.frontend_url;
        const returnUrl = sepayConfig.return_url;
        const webhookUrl = sepayConfig.webhook_url;

        // Validate URLs
        if (!frontendUrl || !returnUrl || !webhookUrl) {
            console.error('Missing required URLs in SePay config');
            return res.status(500).json({
                message: "Cấu hình SePay không hợp lệ: Thiếu URL",
                success: false
            });
        }

        // Sử dụng ma_don_hang cho invoice number, nếu không có thì dùng don_hang_id
        const invoiceNumber = donHang.ma_don_hang || `DH${donHang.don_hang_id}`;

        // Tạo redirect URLs với ngrok URL (ngrok trỏ về frontend)
        // Frontend sẽ proxy /sepay/return và /ipn đến backend localhost:5000
        const ngrokUrl = sepayConfig.ngrok_url;
        const successUrl = `${ngrokUrl}/sepay/return?status=success&orderId=${donHang.don_hang_id}&payment=sepay`;
        const errorUrl = `${ngrokUrl}/sepay/return?status=failed&orderId=${donHang.don_hang_id}&payment=sepay`;
        const cancelUrl = `${ngrokUrl}/sepay/return?status=cancel&orderId=${donHang.don_hang_id}&payment=sepay`;

        // Tạo form fields với SDK
        // Lưu ý: SePay yêu cầu return_url và webhook_url là bắt buộc
        const formData = {
            payment_method: paymentMethod || 'BANK_TRANSFER',
            order_invoice_number: invoiceNumber,
            order_amount: Math.round(parseFloat(amount)),
            currency: 'VND',
            order_description: orderDescription || `Thanh toan don hang ${invoiceNumber}`,
            return_url: returnUrl,
            webhook_url: webhookUrl,
            success_url: successUrl,
            error_url: errorUrl,
            cancel_url: cancelUrl,
        };

        console.log('SePay Form Data (before SDK):', JSON.stringify(formData, null, 2));

        const checkoutFormfields = sepayClient.checkout.initOneTimePaymentFields(formData);

        // Log để debug
        console.log('SePay Checkout URL:', checkoutURL);
        console.log('SePay Return URL:', returnUrl);
        console.log('SePay Webhook URL:', webhookUrl);
        console.log('SePay Frontend URL:', frontendUrl);
        console.log('SePay Form Fields (from SDK):', JSON.stringify(checkoutFormfields, null, 2));
        
        // Kiểm tra xem return_url và webhook_url có trong formFields không
        if (!checkoutFormfields.return_url && !checkoutFormfields.webhook_url) {
            console.warn('⚠️ WARNING: return_url và webhook_url không có trong formFields!');
            console.warn('Có thể SDK không hỗ trợ hoặc cần format khác');
        }

        // Đảm bảo tất cả URLs dùng ngrok URL (override nếu SDK thay đổi)
        const finalFormFields = { ...checkoutFormfields };
        
        // Force override các URL về ngrok URL
        finalFormFields.return_url = returnUrl;
        finalFormFields.webhook_url = webhookUrl;
        finalFormFields.success_url = successUrl;
        finalFormFields.error_url = errorUrl;
        finalFormFields.cancel_url = cancelUrl;
        
        console.log('✅ Final Form Fields URLs (all using ngrok):');
        console.log('  - return_url:', finalFormFields.return_url);
        console.log('  - webhook_url:', finalFormFields.webhook_url);
        console.log('  - success_url:', finalFormFields.success_url);
        console.log('  - error_url:', finalFormFields.error_url);
        console.log('  - cancel_url:', finalFormFields.cancel_url);

        return res.status(200).json({
            message: "Tạo form thanh toán thành công",
            success: true,
            data: {
                checkoutUrl: checkoutURL,
                formFields: finalFormFields,
                orderId: donHang.ma_don_hang
            }
        });
    } catch (error) {
        console.error('Error creating SePay payment form:', error);
        return res.status(500).json({
            message: "Lỗi server khi tạo form thanh toán",
            success: false,
            error: error.message
        });
    }
};

// Xử lý kết quả trả về từ SePay (Return URL)
export const sepayReturn = async (req, res) => {
    try {
        // Log tất cả query params để debug
        console.log('SePay Return - All query params:', req.query);
        console.log('SePay Return - All body params:', req.body);
        
        const { order_invoice_number, status, transaction_id, amount, payment_status, result, orderId, payment } = req.query;
        const frontendUrl = sepayConfig.frontend_url;

        // Validate frontend URL
        if (!frontendUrl) {
            console.error('SePay Return - Frontend URL not configured');
            return res.status(500).send('Frontend URL not configured. Please check server configuration.');
        }

        // SePay có thể dùng payment_status hoặc result thay vì status
        const paymentStatus = status || payment_status || result || req.query.status;
        
        console.log('SePay Return - Detected status:', paymentStatus);
        console.log('SePay Return - order_invoice_number:', order_invoice_number);
        console.log('SePay Return - orderId:', orderId);

        // Tìm đơn hàng trong database - ưu tiên orderId từ query params
        let donHang = null;
        let orderIdToUse = null;
        
        // Nếu có orderId từ query params (từ callback URL)
        if (orderId) {
            orderIdToUse = orderId;
            try {
                const orderIdNum = parseInt(orderId);
                if (!isNaN(orderIdNum)) {
                    donHang = await prisma.donhang.findUnique({
                        where: { don_hang_id: orderIdNum }
                    });
                }
            } catch (dbError) {
                console.error('Error finding order by orderId:', dbError);
            }
        }
        
        // Nếu không tìm thấy và có order_invoice_number từ SePay
        if (!donHang && order_invoice_number) {
            try {
                donHang = await prisma.donhang.findFirst({
                    where: {
                        OR: [
                            { ma_don_hang: order_invoice_number },
                            { don_hang_id: parseInt(order_invoice_number) }
                        ]
                    }
                });
                if (donHang) {
                    orderIdToUse = donHang.don_hang_id.toString();
                }
            } catch (dbError) {
                console.error('Error finding order by invoice number:', dbError);
            }
        }

        if (!donHang && !orderIdToUse) {
            console.log('SePay Return - Missing order information');
            const errorUrl = createRedirectUrl('/orders', {
                status: 'error',
                message: 'Missing order information',
                payment: 'sepay'
            });
            return res.redirect(errorUrl);
        }

        // Kiểm tra status (có thể là success, completed, SUCCESS, COMPLETED, v.v.)
        const statusLower = paymentStatus ? paymentStatus.toString().toLowerCase() : null;
        
        console.log('SePay Return - Processing status:', statusLower);
        
        if (statusLower === 'success' || statusLower === 'completed' || statusLower === 'paid' || statusLower === '1') {
            // Thanh toán thành công
            console.log('SePay Return - Payment SUCCESS');
            if (donHang && donHang.trang_thai === 'Chờ thanh toán') {
                try {
                    await prisma.donhang.update({
                        where: { don_hang_id: donHang.don_hang_id },
                        data: {
                            trang_thai: 'Đã xác nhận',
                            ngay_cap_nhat: new Date()
                        }
                    });
                    console.log('SePay Return - Order updated to Đã xác nhận');
                } catch (updateError) {
                    console.error('Error updating order:', updateError);
                }
            }
             const finalOrderId = orderIdToUse || donHang?.don_hang_id || order_invoice_number;
             const successUrl = createRedirectUrl('/orders', {
                 status: 'success',
                 orderId: finalOrderId,
                 transactionNo: transaction_id || 'N/A',
                 payment: 'sepay'
             });
             return res.redirect(successUrl);
         } else if (statusLower === 'failed' || statusLower === 'error' || statusLower === 'fail' || statusLower === '0') {
             // Thanh toán thất bại
             console.log('SePay Return - Payment FAILED');
             if (donHang && donHang.trang_thai === 'Chờ thanh toán') {
                 try {
                     await prisma.donhang.update({
                         where: { don_hang_id: donHang.don_hang_id },
                         data: {
                             trang_thai: 'Thanh toán thất bại',
                             ngay_cap_nhat: new Date()
                         }
                     });
                     console.log('SePay Return - Order updated to Thanh toán thất bại');
                 } catch (updateError) {
                     console.error('Error updating order:', updateError);
                 }
             }
             const finalOrderId = orderIdToUse || donHang?.don_hang_id || order_invoice_number;
             const failedUrl = createRedirectUrl('/orders', {
                 status: 'failed',
                 orderId: finalOrderId,
                 payment: 'sepay'
             });
             return res.redirect(failedUrl);
         } else if (statusLower === 'cancel' || statusLower === 'cancelled' || statusLower === 'canceled') {
             // Người dùng hủy thanh toán
             console.log('SePay Return - Payment CANCELLED');
             const finalOrderId = orderIdToUse || donHang?.don_hang_id || order_invoice_number;
             const cancelUrl = createRedirectUrl('/orders', {
                 status: 'cancel',
                 orderId: finalOrderId,
                 payment: 'sepay'
             });
             return res.redirect(cancelUrl);
        } else {
            // Trạng thái không xác định - mặc định coi như thành công nếu có transaction_id
            console.log('SePay Return - Unknown status, checking transaction_id:', transaction_id);
            if (transaction_id && transaction_id !== 'N/A' && transaction_id !== '') {
                // Có transaction_id nghĩa là đã thanh toán thành công
                console.log('SePay Return - Has transaction_id, treating as SUCCESS');
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
                 const finalOrderId = orderIdToUse || donHang?.don_hang_id || order_invoice_number;
                 const successUrl = createRedirectUrl('/orders', {
                     status: 'success',
                     orderId: finalOrderId,
                     transactionNo: transaction_id,
                     payment: 'sepay'
                 });
                 return res.redirect(successUrl);
             } else {
                 // Không có status và không có transaction_id - mặc định là hủy hoặc lỗi
                 console.log('SePay Return - No status and no transaction_id, treating as CANCELLED');
                 const finalOrderId = orderIdToUse || donHang?.don_hang_id || order_invoice_number;
                 const cancelUrl = createRedirectUrl('/orders', {
                     status: 'cancel',
                     orderId: finalOrderId,
                     payment: 'sepay'
                 });
                 return res.redirect(cancelUrl);
             }
        }
    } catch (error) {
        console.error('Error processing SePay return:', error);
        console.error('Error stack:', error.stack);
        try {
            const errorUrl = createRedirectUrl('/orders', {
                status: 'error',
                message: 'Server error',
                payment: 'sepay'
            });
            return res.redirect(errorUrl);
        } catch (redirectError) {
            console.error('Error creating redirect URL in catch block:', redirectError);
            // Fallback: redirect về frontend URL trực tiếp
            return res.redirect(`${sepayConfig.frontend_url}/orders?status=error&payment=sepay`);
        }
    }
};

// Xử lý webhook từ SePay (IPN)
export const sepayWebhook = async (req, res) => {
    try {
        const { order_invoice_number, status, transaction_id, amount } = req.body;

        if (!order_invoice_number) {
            return res.status(400).json({
                success: false,
                message: 'Missing order_invoice_number'
            });
        }

        // Tìm đơn hàng trong database
        let donHang = null;
        try {
            donHang = await prisma.donhang.findFirst({
                where: {
                    OR: [
                        { ma_don_hang: order_invoice_number },
                        { don_hang_id: parseInt(order_invoice_number) }
                    ]
                }
            });
        } catch (dbError) {
            console.error('Error finding order:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (!donHang) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Xác thực số tiền
        const orderAmount = parseFloat(donHang.tong_tien);
        const paymentAmount = parseFloat(amount);
        if (Math.abs(orderAmount - paymentAmount) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Amount mismatch'
            });
        }

        // Cập nhật trạng thái đơn hàng
        if (status === 'success' || status === 'completed') {
            if (donHang.trang_thai === 'Chờ thanh toán') {
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
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update order'
                    });
                }
            }
        } else if (status === 'failed' || status === 'error') {
            if (donHang.trang_thai === 'Chờ thanh toán') {
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
        }

        return res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });
    } catch (error) {
        console.error('Error processing SePay webhook:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
