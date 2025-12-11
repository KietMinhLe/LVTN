// Cấu hình GHTK (Giao Hàng Tiết Kiệm) - Staging Environment
export const ghtkConfig = {
    token: process.env.GHTK_TOKEN || "1pjV9tbBt7Rs2w6oSTMkwL3EPuSrp8eb1c7e875d8",
    partnerCode: process.env.GHTK_PARTNER_CODE || "S23042253",
    baseUrl: process.env.GHTK_BASE_URL || "https://services-staging.ghtklab.com",
    // Địa chỉ shop từ GHTK API (pick_address_id: 18050442)
    // Address từ API: "180 Cao Lỗ, phường 4, quận 8, HCM, Trường Đại học Công nghệ Sài Gòn, Phường Chánh Hưng, Phường Chánh Hưng, TP Hồ Chí Minh"
    shopAddress: {
        pickAddressId: process.env.GHTK_PICK_ADDRESS_ID || "18050442",
        pickName: process.env.GHTK_PICK_NAME || "Trần Trọng Nhân",
        pickAddress: process.env.GHTK_PICK_ADDRESS || "180 Cao Lỗ",
        // Format từ GHTK API: lowercase, không có dấu chấm
        pickProvince: process.env.GHTK_PICK_PROVINCE || "TP Hồ Chí Minh", // Không có dấu chấm sau "TP"
        pickDistrict: process.env.GHTK_PICK_DISTRICT || "quận 8", // lowercase
        pickWard: process.env.GHTK_PICK_WARD || "phường 4", // lowercase
        pickTel: process.env.GHTK_PICK_TEL || "0334554423"
    }
};


