// Cấu hình GHN (Giao Hàng Nhanh) - Test Environment
export const ghnConfig = {
    token: process.env.GHN_TOKEN || "3c5de70d-cc0e-11f0-b989-ea7e29c7fb39",
    clientId: process.env.GHN_CLIENT_ID || "2510629",
    shopId: process.env.GHN_SHOP_ID || "198227",
    baseUrl: process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn",
    // Địa chỉ shop: 180 Đ. Cao Lỗ, Phường 4, Quận 8, Hồ Chí Minh
    shopAddress: {
        provinceId: process.env.GHN_SHOP_PROVINCE_ID || 202, // Hồ Chí Minh
        districtId: process.env.GHN_SHOP_DISTRICT_ID || 1450, // Quận 8
        wardCode: process.env.GHN_SHOP_WARD_CODE || "20804", // Phường 4
        address: process.env.GHN_SHOP_ADDRESS || "180 Đ. Cao Lỗ, Phường 4, Quận 8, Hồ Chí Minh"
    }
};

