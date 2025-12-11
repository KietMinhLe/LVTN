import prisma from "../config/db.js";

// Lấy tất cả phương thức giao hàng
export const getAllPhuongThucGiaoHang = async (req, res) => {
    try {
        const data = await prisma.phuongthucvanchuyen.findMany();

        //Kiểm tra xem có dữ liệu không
        if (!data.length) {
            return res.status(404).json({
                message: "Không có phương thức giao hàng nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Lấy tất cả phương thức giao hàng thành công",
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

// Lấy phương thức giao hàng theo ID
export const getPhuongThucGiaoHangById = async (req, res) => {
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

        //Lấy phương thức giao hàng theo ID
        const data = await prisma.phuongthucvanchuyen.findUnique({
            where: { phuong_thuc_van_chuyen_id: parseInt(id) }
        });

        //Kiểm tra xem phương thức giao hàng có tồn tại không
        if (!data) {
            return res.status(404).json({
                message: "Phương thức giao hàng không tồn tại",
                success: false,
                data: null
            });
        }

        return res.status(200).json({
            message: "Lấy phương thức giao hàng thành công",
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

// Tạo phương thức giao hàng
export const createPhuongThucGiaoHang = async (req, res) => {
    try {
        const { ten_phuong_thuc, mo_ta, phi_co_ban, trang_thai } = req.body;

        //Kiểm tra dữ liệu bắt buộc
        if (!ten_phuong_thuc || ten_phuong_thuc.trim() === '') {
            return res.status(400).json({
                message: "Tên phương thức giao hàng không được để trống",
                success: false,
                data: null
            });
        }

        //Kiểm tra tên phương thức giao hàng có đúng định dạng không
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_phuong_thuc)) {
            return res.status(400).json({
                message: "Tên phương thức giao hàng không hợp lệ",
                success: false,
                data: null
            });
        }

        // Chuyển đổi trang_thai sang boolean nếu là string
        let trangThaiValue = trang_thai;
        if (typeof trang_thai === 'string') {
            trangThaiValue = trang_thai === 'true' || trang_thai === '1';
        } else if (trang_thai === undefined || trang_thai === null) {
            trangThaiValue = true; // Default value
        }

        //Kiểm tra trùng tên phương thức giao hàng
        const existingPhuongThucGiaoHang = await prisma.phuongthucvanchuyen.findFirst({
            where: { ten_phuong_thuc: ten_phuong_thuc.trim() }
        });
        if (existingPhuongThucGiaoHang) {
            return res.status(400).json({
                message: "Tên phương thức giao hàng đã tồn tại",
                success: false,
                data: null
            });
        }

        //Tạo phương thức giao hàng
        const data = await prisma.phuongthucvanchuyen.create({
            data: {
                ten_phuong_thuc: ten_phuong_thuc.trim(),
                mo_ta: mo_ta || null,
                phi_co_ban: phi_co_ban !== undefined ? parseFloat(phi_co_ban) : null,
                trang_thai: trangThaiValue
            }
        });

        return res.status(201).json({
            message: "Tạo phương thức giao hàng thành công",
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

// Cập nhật phương thức giao hàng
export const updatePhuongThucGiaoHang = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_phuong_thuc, mo_ta, phi_co_ban, trang_thai } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        //Kiểm tra phương thức giao hàng có tồn tại không
        const existing = await prisma.phuongthucvanchuyen.findUnique({
            where: { phuong_thuc_van_chuyen_id: parseInt(id) }
        });
        if (!existing) {
            return res.status(404).json({
                message: "Phương thức giao hàng không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra dữ liệu bắt buộc
        if (!ten_phuong_thuc || ten_phuong_thuc.trim() === '') {
            return res.status(400).json({
                message: "Tên phương thức giao hàng không được để trống",
                success: false,
                data: null
            });
        }

        //Kiểm tra tên phương thức giao hàng có đúng định dạng không
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_phuong_thuc)) {
            return res.status(400).json({
                message: "Tên phương thức giao hàng không hợp lệ",
                success: false,
                data: null
            });
        }

        // Chuyển đổi trang_thai sang boolean nếu là string
        let trangThaiValue = trang_thai;
        if (typeof trang_thai === 'string') {
            trangThaiValue = trang_thai === 'true' || trang_thai === '1';
        } else if (trang_thai === undefined || trang_thai === null) {
            trangThaiValue = true; // Default value
        }

        //Kiểm tra trùng tên phương thức giao hàng
        const existingPhuongThucGiaoHang = await prisma.phuongthucvanchuyen.findFirst({
            where: {
                ten_phuong_thuc: ten_phuong_thuc.trim(),
                NOT: { phuong_thuc_van_chuyen_id: parseInt(id) }
            }
        });
        if (existingPhuongThucGiaoHang) {
            return res.status(400).json({
                message: "Tên phương thức giao hàng đã tồn tại",
                success: false,
                data: null
            });
        }

        //Cập nhật phương thức giao hàng
        const data = await prisma.phuongthucvanchuyen.update({
            where: { phuong_thuc_van_chuyen_id: parseInt(id) },
            data: {
                ten_phuong_thuc: ten_phuong_thuc.trim(),
                mo_ta: mo_ta || null,
                phi_co_ban: phi_co_ban !== undefined ? parseFloat(phi_co_ban) : null,
                trang_thai: trangThaiValue
            }
        });

        return res.status(200).json({
            message: "Cập nhật phương thức giao hàng thành công",
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


// Xóa phương thức giao hàng
export const deletePhuongThucGiaoHang = async (req, res) => {
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

        //Xóa phương thức giao hàng
        const data = await prisma.phuongthucvanchuyen.delete({
            where: { phuong_thuc_van_chuyen_id: parseInt(id) }
        });

        //Kiểm tra xem có dữ liệu không
        if (!data) {
            return res.status(404).json({
                message: "Không có phương thức giao hàng nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Xóa phương thức giao hàng thành công",
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