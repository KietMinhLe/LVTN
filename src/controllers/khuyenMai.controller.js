import prisma from "../config/db.js";

// Lấy tất cả khuyến mãi
export const getAllKhuyenMai = async (req, res) => {
    try {
        const data = await prisma.khuyenmai.findMany();

        //Kiểm tra xem có dữ liệu không
        if (!data.length) {
            return res.status(404).json({
                message: "Không có khuyến mãi nào trong hệ thống",
                success: false,
                data: []
            });
        }

        //Trả về dữ liệu
        return res.status(200).json({
            message: "Lấy tất cả khuyến mãi thành công",
            success: true,
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Lấy khuyến mãi theo ID
export const getKhuyenMaiById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        //Lấy khuyến mãi theo ID
        const data = await prisma.khuyenmai.findUnique({
            where: { khuyen_mai_id: parseInt(id) }
        });

        //Kiểm tra xem khuyến mãi có tồn tại không
        if (!data) {
            return res.status(404).json({
                message: "Khuyến mãi không tồn tại",
                success: false,
                data: null
            });
        }

        //Trả về dữ liệu
        return res.status(200).json({
            message: "Lấy khuyến mãi thành công",
            success: true,
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Tạo khuyến mãi
export const createKhuyenMai = async (req, res) => {
    try {
        const { ten_chien_dich, loai_giam_gia, gia_tri_giam, ngay_bat_dau, ngay_ket_thuc, is_active, dieu_kien } = req.body;

        //Kiểm tra dữ liệu bắt buộc
        if (!ten_chien_dich || !loai_giam_gia || !gia_tri_giam || !ngay_bat_dau || !ngay_ket_thuc) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc",
                success: false
            });
        }

        //Kiểm tra loại giảm giá có hợp lệ không
        if (loai_giam_gia !== 'phần trăm' && loai_giam_gia !== 'tiền') {
            return res.status(400).json({
                message: "Loại giảm giá không hợp lệ",
                success: false
            });
        }

        //Kiểm tra tên chương trình khuyến mãi có đúng định dạng không
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_chien_dich)) {
            return res.status(400).json({
                message: "Tên chiến dịch khuyến mãi không hợp lệ",
                success: false
            });
        }

        //Kiểm tra ngày bắt đầu và ngày kết thúc có hợp lệ không
        const ngayBatDau = new Date(ngay_bat_dau);
        const ngayKetThuc = new Date(ngay_ket_thuc);

        if (isNaN(ngayBatDau.getTime()) || isNaN(ngayKetThuc.getTime())) {
            return res.status(400).json({
                message: "Ngày bắt đầu hoặc ngày kết thúc không hợp lệ",
                success: false
            });
        }

        if (ngayBatDau > ngayKetThuc) {
            return res.status(400).json({
                message: "Ngày bắt đầu phải trước ngày kết thúc",
                success: false
            });
        }

        //Kiểm tra giá trị giảm giá có hợp lệ không
        const giaTriGiam = parseFloat(gia_tri_giam);
        if (isNaN(giaTriGiam) || giaTriGiam <= 0) {
            return res.status(400).json({
                message: "Giá trị giảm giá phải là số lớn hơn 0",
                success: false
            });
        }

        // Kiểm tra giá trị giảm giá theo loại
        if (loai_giam_gia === 'phần trăm' && giaTriGiam > 100) {
            return res.status(400).json({
                message: "Giảm giá phần trăm không được vượt quá 100%",
                success: false
            });
        }


        // Chuyển đổi is_active sang boolean (nếu là string)
        let isActiveValue = is_active;
        if (typeof is_active === 'string') {
            isActiveValue = is_active === 'true' || is_active === '1';
        } else if (is_active === undefined || is_active === null) {
            isActiveValue = true; // Default value
        }

        //Kiểm tra trùng khuyến mãi
        const existing = await prisma.khuyenmai.findFirst({
            where: { ten_chien_dich }
        });

        if (existing) {
            return res.status(400).json({
                message: "Khuyến mãi đã tồn tại",
                success: false
            });
        }

        //Tạo khuyến mãi
        const data = await prisma.khuyenmai.create({
            data: {
                ten_chien_dich,
                loai_giam_gia,
                gia_tri_giam: giaTriGiam,
                ngay_bat_dau: ngayBatDau,
                ngay_ket_thuc: ngayKetThuc,
                is_active: isActiveValue,
                dieu_kien: dieu_kien || null
            }
        });

        //Trả về dữ liệu
        return res.status(200).json({
            message: "Tạo khuyến mãi thành công",
            success: true,
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Cập nhật khuyến mãi
export const updateKhuyenMai = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_chien_dich, loai_giam_gia, gia_tri_giam, ngay_bat_dau, ngay_ket_thuc, is_active, dieu_kien } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        //Kiểm tra dữ liệu bắt buộc
        if (!ten_chien_dich || !loai_giam_gia || !gia_tri_giam || !ngay_bat_dau || !ngay_ket_thuc) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc",
                success: false
            });
        }

        //Kiểm tra loại giảm giá có hợp lệ không
        if (loai_giam_gia !== 'phần trăm' && loai_giam_gia !== 'tiền') {
            return res.status(400).json({
                message: "Loại giảm giá không hợp lệ. Chỉ chấp nhận: 'phần trăm' hoặc 'tiền'",
                success: false
            });
        }

        //Kiểm tra tên chương trình khuyến mãi có đúng định dạng không
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_chien_dich)) {
            return res.status(400).json({
                message: "Tên chiến dịch khuyến mãi không hợp lệ",
                success: false
            });
        }

        //Kiểm tra ngày bắt đầu và ngày kết thúc có hợp lệ không
        const ngayBatDau = new Date(ngay_bat_dau);
        const ngayKetThuc = new Date(ngay_ket_thuc);

        if (isNaN(ngayBatDau.getTime()) || isNaN(ngayKetThuc.getTime())) {
            return res.status(400).json({
                message: "Ngày bắt đầu hoặc ngày kết thúc không hợp lệ",
                success: false
            });
        }

        if (ngayBatDau > ngayKetThuc) {
            return res.status(400).json({
                message: "Ngày bắt đầu phải trước ngày kết thúc",
                success: false
            });
        }

        //Kiểm tra giá trị giảm giá có hợp lệ không
        const giaTriGiam = parseFloat(gia_tri_giam);
        if (isNaN(giaTriGiam) || giaTriGiam <= 0) {
            return res.status(400).json({
                message: "Giá trị giảm giá phải là số lớn hơn 0",
                success: false
            });
        }

        // Kiểm tra giá trị giảm giá theo loại
        if (loai_giam_gia === 'phần trăm' && giaTriGiam > 100) {
            return res.status(400).json({
                message: "Giảm giá phần trăm không được vượt quá 100%",
                success: false
            });
        }

        // Chuyển đổi is_active sang boolean (nếu là string)
        let isActiveValue = is_active;
        if (typeof is_active === 'string') {
            isActiveValue = is_active === 'true' || is_active === '1';
        } else if (is_active === undefined || is_active === null) {
            isActiveValue = true; // Default value
        }

        //Kiểm tra trùng khuyến mãi
        const existing = await prisma.khuyenmai.findFirst({
            where: { ten_chien_dich, NOT: { khuyen_mai_id: parseInt(id) } }
        });
        if (existing) {
            return res.status(400).json({
                message: "Tên chiến dịch khuyến mãi đã tồn tại",
                success: false
            });
        }

        //Cập nhật khuyến mãi
        const data = await prisma.khuyenmai.update({
            where: { khuyen_mai_id: parseInt(id) },
            data: {
                ten_chien_dich,
                loai_giam_gia,
                gia_tri_giam: giaTriGiam,
                ngay_bat_dau: ngayBatDau,
                ngay_ket_thuc: ngayKetThuc,
                is_active: isActiveValue,
                dieu_kien: dieu_kien || null
            }
        });

        //Trả về dữ liệu
        return res.status(200).json({
            message: "Cập nhật khuyến mãi thành công",
            success: true,
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Xóa khuyến mãi
export const deleteKhuyenMai = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        //Kiểm tra khuyến mãi có tồn tại không
        const existing = await prisma.khuyenmai.findUnique({
            where: { khuyen_mai_id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Khuyến mãi không tồn tại",
                success: false,
                data: null
            });
        }

        //Xóa khuyến mãi
        const data = await prisma.khuyenmai.delete({
            where: { khuyen_mai_id: parseInt(id) }
        });

        //Trả về dữ liệu
        return res.status(200).json({
            message: "Xóa khuyến mãi thành công",
            success: true,
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}