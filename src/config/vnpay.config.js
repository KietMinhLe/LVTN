// Cấu hình VNPay
export const vnpayConfig = {
    vnp_TmnCode: process.env.VNP_TMN_CODE || "003ARP6Y",
    vnp_HashSecret: process.env.VNP_HASH_SECRET || "DBEJWEE5EJ4DXZDRPSFSVYD4UR3KEPIZ",
    vnp_Url: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_Api: process.env.VNP_API || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || "http://localhost:5000/vnpay/vnpay_return",
    vnp_FrontendUrl: process.env.VNP_FRONTEND_URL || "http://localhost:5173"
};

