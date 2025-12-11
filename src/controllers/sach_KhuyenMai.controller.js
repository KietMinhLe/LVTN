import prisma from "../config/db.js";

//Lấy tất cả sách khuyến mãi
export const getAllSachKhuyenMai = async (req, res) => {
    try {
        const data = await prisma.sach_khuyenmai.findMany({
            include: {
                sach: true,
                khuyenmai: true
            },
            orderBy: {
                ngay_ap_dung: 'desc'
            }
        });

        //Kiểm tra xem có dữ liệu không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có sách khuyến mãi nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Lấy tất cả sách khuyến mãi thành công",
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

//Lấy sách khuyến mãi theo ID
export const getSachKhuyenMaiById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        const data = await prisma.sach_khuyenmai.findUnique({
            where: { id: parseInt(id) },
            include: {
                sach: true,
                khuyenmai: true
            }
        });

        //Kiểm tra xem sách khuyến mãi có tồn tại không
        if (!data) {
            return res.status(404).json({
                message: "Sách khuyến mãi không tồn tại",
                success: false,
                data: null
            });
        }

        return res.status(200).json({
            message: "Lấy sách khuyến mãi thành công",
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

//Tạo sách khuyến mãi
export const createSachKhuyenMai = async (req, res) => {
    try {
        const { sach_id, khuyen_mai_id, gia_khuyen_mai, ngay_ap_dung, ngay_het_han } = req.body;

        //Kiểm tra dữ liệu bắt buộc
        if (!sach_id || !khuyen_mai_id || !gia_khuyen_mai || !ngay_ap_dung || !ngay_het_han) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc",
                success: false
            });
        }

        //Kiểm tra sách có tồn tại không
        const existingSach = await prisma.sach.findUnique({
            where: { sach_id: parseInt(sach_id) }
        });

        if (!existingSach) {
            return res.status(404).json({
                message: "Sách không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra khuyến mãi có tồn tại không
        const existingKhuyenMai = await prisma.khuyenmai.findUnique({
            where: { khuyen_mai_id: parseInt(khuyen_mai_id) }
        });

        if (!existingKhuyenMai) {
            return res.status(404).json({
                message: "Không có khuyến mãi nào trong hệ thống",
                success: false,
                data: []
            });
        }

        //Kiểm tra ngày áp dụng và ngày hết hạn có hợp lệ không
        const ngayApDung = new Date(ngay_ap_dung);
        const ngayHetHan = new Date(ngay_het_han);

        if (isNaN(ngayApDung.getTime()) || isNaN(ngayHetHan.getTime())) {
            return res.status(400).json({
                message: "Ngày áp dụng hoặc ngày hết hạn không hợp lệ",
                success: false
            });
        }

        if (ngayApDung > ngayHetHan) {
            return res.status(400).json({
                message: "Ngày áp dụng phải trước ngày hết hạn",
                success: false
            });
        }

        //Kiểm tra trùng sách khuyến mãi
        const existing = await prisma.sach_khuyenmai.findFirst({
            where: { sach_id: parseInt(sach_id), khuyen_mai_id: parseInt(khuyen_mai_id) }
        });

        if (existing) {
            return res.status(400).json({
                message: "Sách khuyến mãi đã tồn tại",
                success: false,
            });
        }

        //Tạo sách khuyến mãi
        const data = await prisma.sach_khuyenmai.create({
            data: {
                sach_id: parseInt(sach_id),
                khuyen_mai_id: parseInt(khuyen_mai_id),
                gia_khuyen_mai: gia_khuyen_mai,
                ngay_ap_dung: ngayApDung,
                ngay_het_han: ngayHetHan
            },
            include: {
                sach: true,
                khuyenmai: true
            }
        });

        return res.status(200).json({
            message: "Tạo sách khuyến mãi thành công",
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

//Cập nhật sách khuyến mãi
export const updateSachKhuyenMai = async (req, res) => {
    try {
        const { id } = req.params;
        const { sach_id, khuyen_mai_id, gia_khuyen_mai, ngay_ap_dung, ngay_het_han } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra dữ liệu bắt buộc
        if (!sach_id || !khuyen_mai_id || !gia_khuyen_mai || !ngay_ap_dung || !ngay_het_han) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc",
                success: false
            });
        }

        //Kiểm tra sách khuyến mãi có tồn tại không
        const existingSachKhuyenMai = await prisma.sach_khuyenmai.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingSachKhuyenMai) {
            return res.status(404).json({
                message: "Sách khuyến mãi không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra sách có tồn tại không
        const existingSach = await prisma.sach.findUnique({
            where: { sach_id: parseInt(sach_id) }
        });

        if (!existingSach) {
            return res.status(404).json({
                message: "Sách không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra khuyến mãi có tồn tại không
        const existingKhuyenMai = await prisma.khuyenmai.findUnique({
            where: { khuyen_mai_id: parseInt(khuyen_mai_id) }
        });

        if (!existingKhuyenMai) {
            return res.status(404).json({
                message: "Khuyến mãi không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra ngày áp dụng và ngày hết hạn có hợp lệ không
        const ngayApDung = new Date(ngay_ap_dung);
        const ngayHetHan = new Date(ngay_het_han);

        if (isNaN(ngayApDung.getTime()) || isNaN(ngayHetHan.getTime())) {
            return res.status(400).json({
                message: "Ngày áp dụng hoặc ngày hết hạn không hợp lệ",
                success: false
            });
        }

        if (ngayApDung > ngayHetHan) {
            return res.status(400).json({
                message: "Ngày áp dụng phải trước ngày hết hạn",
                success: false
            });
        }

        // Kiểm tra giá khuyến mãi có hợp lệ không
        const giaKhuyenMai = parseFloat(gia_khuyen_mai);
        if (isNaN(giaKhuyenMai) || giaKhuyenMai <= 0) {
            return res.status(400).json({
                message: "Giá khuyến mãi phải là số lớn hơn 0",
                success: false
            });
        }

        //Kiểm tra trùng sách khuyến mãi
        const existing = await prisma.sach_khuyenmai.findFirst({
            where: {
                sach_id: parseInt(sach_id),
                khuyen_mai_id: parseInt(khuyen_mai_id),
                NOT: { id: parseInt(id) }
            }
        });

        if (existing) {
            return res.status(400).json({
                message: "Sách khuyến mãi đã tồn tại",
                success: false,
                data: null
            });
        }

        //Cập nhật sách khuyến mãi
        const data = await prisma.sach_khuyenmai.update({
            where: { id: parseInt(id) },
            data: {
                sach_id: parseInt(sach_id),
                khuyen_mai_id: parseInt(khuyen_mai_id),
                gia_khuyen_mai: giaKhuyenMai,
                ngay_ap_dung: ngayApDung,
                ngay_het_han: ngayHetHan
            },
            include: {
                sach: true,
                khuyenmai: true
            }
        });

        return res.status(200).json({
            message: "Cập nhật sách khuyến mãi thành công",
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

//Xóa sách khuyến mãi
export const deleteSachKhuyenMai = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra sách khuyến mãi có tồn tại không
        const existing = await prisma.sach_khuyenmai.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Sách khuyến mãi không tồn tại",
                success: false,
                data: null
            });
        }

        //Xóa sách khuyến mãi
        const data = await prisma.sach_khuyenmai.delete({
            where: { id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Xóa sách khuyến mãi thành công",
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