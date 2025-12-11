import prisma from "../config/db.js"; // Import Prisma Client để thao tác với database

// Lấy tất cả phương thức thanh toán trong hệ thống
export const getAllPhuongThucThanhToan = async (req, res) => {
    try {
        // Query lấy tất cả phương thức thanh toán
        const data = await prisma.phuongthucthanhtoan.findMany({
            orderBy: {
                phuong_thuc_thanh_toan_id: 'asc' // Sắp xếp theo ID tăng dần
            }
        });

        // Kiểm tra xem có dữ liệu không
        if (!data.length) {
            return res.status(404).json({
                message: "Không có phương thức thanh toán nào trong hệ thống",
                success: false,
                data: []
            });
        }

        // Trả về danh sách phương thức thanh toán thành công
        return res.status(200).json({
            message: "Lấy tất cả phương thức thanh toán thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Lấy thông tin phương thức thanh toán theo ID
export const getPhuongThucThanhToanById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL params

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        // Query lấy phương thức thanh toán theo ID
        const data = await prisma.phuongthucthanhtoan.findUnique({
            where: { phuong_thuc_thanh_toan_id: parseInt(id) } // Chuyển ID sang số nguyên
        });

        // Kiểm tra xem phương thức thanh toán có tồn tại không
        if (!data) {
            return res.status(404).json({
                message: "Phương thức thanh toán không tồn tại",
                success: false,
                data: null
            });
        }

        // Trả về thông tin phương thức thanh toán thành công
        return res.status(200).json({
            message: "Lấy phương thức thanh toán thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Tạo phương thức thanh toán mới
export const createPhuongThucThanhToan = async (req, res) => {
    try {
        const { ten_phuong_thuc, mo_ta, trang_thai } = req.body; // Lấy dữ liệu từ request body

        // Kiểm tra dữ liệu bắt buộc (tên phương thức thanh toán)
        if (!ten_phuong_thuc || ten_phuong_thuc.trim() === '') {
            return res.status(400).json({
                message: "Tên phương thức thanh toán không được để trống",
                success: false,
                data: null
            });
        }

        // Kiểm tra tên phương thức thanh toán có đúng định dạng không (chỉ cho phép chữ cái, số, khoảng trắng và ký tự tiếng Việt)
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_phuong_thuc)) {
            return res.status(400).json({
                message: "Tên phương thức thanh toán không hợp lệ",
                success: false,
                data: null
            });
        }

        // Chuyển đổi trạng thái sang boolean (hỗ trợ cả string và boolean)
        let trangThaiValue = trang_thai;
        if (typeof trang_thai === 'string') {
            // Nếu là string, kiểm tra giá trị
            trangThaiValue = trang_thai === 'true' || trang_thai === '1';
        } else if (trang_thai === undefined || trang_thai === null) {
            // Mặc định là true (hoạt động) nếu không có
            trangThaiValue = true;
        }

        // Kiểm tra trùng tên phương thức thanh toán (tên phải unique)
        const existingPhuongThucThanhToan = await prisma.phuongthucthanhtoan.findFirst({
            where: { ten_phuong_thuc: ten_phuong_thuc.trim() }
        });

        if (existingPhuongThucThanhToan) {
            return res.status(400).json({
                message: "Tên phương thức thanh toán đã tồn tại",
                success: false,
                data: null
            });
        }

        // Tạo phương thức thanh toán mới trong database
        const data = await prisma.phuongthucthanhtoan.create({
            data: {
                ten_phuong_thuc: ten_phuong_thuc.trim(), // Tên phương thức (đã trim)
                mo_ta: mo_ta || null,                    // Mô tả (nếu có)
                trang_thai: trangThaiValue              // Trạng thái (mặc định true)
            }
        });

        // Trả về kết quả thành công
        return res.status(201).json({
            message: "Tạo phương thức thanh toán thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Cập nhật thông tin phương thức thanh toán
export const updatePhuongThucThanhToan = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL params
        const { ten_phuong_thuc, mo_ta, trang_thai } = req.body; // Lấy dữ liệu từ request body

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        // Kiểm tra phương thức thanh toán có tồn tại không (trước khi cập nhật)
        const existing = await prisma.phuongthucthanhtoan.findUnique({
            where: { phuong_thuc_thanh_toan_id: parseInt(id) }
        });
        if (!existing) {
            return res.status(404).json({
                message: "Phương thức thanh toán không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra dữ liệu bắt buộc (tên phương thức thanh toán)
        if (!ten_phuong_thuc || ten_phuong_thuc.trim() === '') {
            return res.status(400).json({
                message: "Tên phương thức thanh toán không được để trống",
                success: false,
                data: null
            });
        }

        // Kiểm tra tên phương thức thanh toán có đúng định dạng không
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_phuong_thuc)) {
            return res.status(400).json({
                message: "Tên phương thức thanh toán không hợp lệ",
                success: false,
                data: null
            });
        }

        // Chuyển đổi trạng thái sang boolean (hỗ trợ cả string và boolean)
        let trangThaiValue = trang_thai;
        if (typeof trang_thai === 'string') {
            // Nếu là string, kiểm tra giá trị
            trangThaiValue = trang_thai === 'true' || trang_thai === '1';
        } else if (trang_thai === undefined || trang_thai === null) {
            // Mặc định là true nếu không có
            trangThaiValue = true;
        }

        // Kiểm tra trùng tên phương thức thanh toán (trừ phương thức hiện tại)
        const existingPhuongThucThanhToan = await prisma.phuongthucthanhtoan.findFirst({
            where: {
                ten_phuong_thuc: ten_phuong_thuc.trim(), // Tìm theo tên mới
                NOT: { phuong_thuc_thanh_toan_id: parseInt(id) } // Loại trừ phương thức hiện tại
            }
        });
        if (existingPhuongThucThanhToan) {
            return res.status(400).json({
                message: "Tên phương thức thanh toán đã tồn tại",
                success: false,
                data: null
            });
        }

        // Cập nhật phương thức thanh toán trong database
        const data = await prisma.phuongthucthanhtoan.update({
            where: { phuong_thuc_thanh_toan_id: parseInt(id) }, // Tìm theo ID
            data: {
                ten_phuong_thuc: ten_phuong_thuc.trim(), // Tên phương thức (đã trim)
                mo_ta: mo_ta || null,                    // Mô tả (nếu có)
                trang_thai: trangThaiValue              // Trạng thái
            }
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: "Cập nhật phương thức thanh toán thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Xóa phương thức thanh toán khỏi hệ thống
export const deletePhuongThucThanhToan = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL params

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        // Kiểm tra phương thức thanh toán có tồn tại không (trước khi xóa)
        const existing = await prisma.phuongthucthanhtoan.findUnique({
            where: { phuong_thuc_thanh_toan_id: parseInt(id) }
        });
        if (!existing) {
            return res.status(404).json({
                message: "Phương thức thanh toán không tồn tại",
                success: false,
                data: null
            });
        }

        // Xóa phương thức thanh toán trong database (sẽ tự động xóa các dữ liệu liên quan do cascade delete)
        const data = await prisma.phuongthucthanhtoan.delete({
            where: { phuong_thuc_thanh_toan_id: parseInt(id) } // Tìm theo ID để xóa
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: "Xóa phương thức thanh toán thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}