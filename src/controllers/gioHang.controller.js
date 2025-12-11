import prisma from '../config/db.js'; // Import Prisma Client để thao tác với database

// Lấy tất cả giỏ hàng trong hệ thống
export const getAllGioHang = async (req, res) => {
    try {
        // Query lấy tất cả giỏ hàng kèm thông tin khách hàng
        const data = await prisma.giohang.findMany({
            include: {
                khachhang: true, // Thông tin khách hàng sở hữu giỏ hàng
            }
        });

        // Kiểm tra xem có dữ liệu không
        if (!data.length) {
            return res.status(404).json({
                message: 'Không có dữ liệu',
                success: false,
                data: []
            });
        }

        // Trả về danh sách giỏ hàng thành công
        return res.status(200).json({
            message: 'Lấy dữ liệu thành công',
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

// Sắp xếp danh sách giỏ hàng theo tiêu chí
export const sortGioHang = async (req, res) => {
    try {
        const { sortBy, order } = req.query; // Lấy tham số sắp xếp từ query string

        // Kiểm tra tham số sortBy và order có được cung cấp không
        if (!sortBy || !order) {
            return res.status(400).json({
                message: 'Thiếu tham số sortBy hoặc order',
                success: false,
                data: []
            });
        }

        // Kiểm tra tham số sortBy có hợp lệ không (chỉ cho phép các trường được định nghĩa)
        const allowedSortFields = ['gio_hang_id', 'khach_hang_id', 'ngay_tao', 'ngay_cap_nhat'];
        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({
                message: 'Tham số sortBy không hợp lệ',
                success: false,
                data: []
            });
        }

        // Kiểm tra tham số order có hợp lệ không (chỉ cho phép asc hoặc desc)
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: 'Tham số order không hợp lệ',
                success: false,
                data: []
            });
        }

        // Xây dựng object orderBy để truyền vào Prisma
        const orderBy = {};
        orderBy[sortBy] = order; // Ví dụ: { gio_hang_id: 'asc' }

        // Lấy dữ liệu với sắp xếp
        const data = await prisma.giohang.findMany({
            include: {
                khachhang: true, // Include thông tin khách hàng
            },
            orderBy: orderBy
        });

        // Kiểm tra xem có dữ liệu không
        if (!data.length) {
            return res.status(404).json({
                message: 'Không có dữ liệu',
                success: false,
                data: []
            });
        }

        // Trả về danh sách giỏ hàng đã sắp xếp
        return res.status(200).json({
            message: 'Lấy dữ liệu thành công',
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

// Lấy thông tin giỏ hàng theo ID
export const getGioHangById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID giỏ hàng từ URL params

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID không được để trống và phải là số',
                success: false,
                data: null
            });
        }

        // Query lấy giỏ hàng theo ID kèm thông tin khách hàng
        const data = await prisma.giohang.findUnique({
            where: { gio_hang_id: parseInt(id) }, // Chuyển ID sang số nguyên
            include: {
                khachhang: true, // Include thông tin khách hàng
            }
        });

        // Kiểm tra xem có dữ liệu không
        if (!data) {
            return res.status(404).json({
                message: 'Không tìm thấy giỏ hàng',
                success: false,
                data: null
            });
        }

        // Trả về thông tin giỏ hàng thành công
        return res.status(200).json({
            message: 'Lấy dữ liệu thành công',
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

// Tạo giỏ hàng mới (hoặc trả về giỏ hàng đã có)
export const createGioHang = async (req, res) => {
    try {
        const { khach_hang_id, session_id } = req.body; // Lấy ID khách hàng hoặc session ID

        // Kiểm tra xem đã có giỏ hàng chưa (theo khach_hang_id hoặc session_id)
        let existingGioHang = null;
        let whereCondition = {};

        // Tìm giỏ hàng theo khách hàng ID (nếu có)
        if (khach_hang_id) {
            whereCondition.khach_hang_id = parseInt(khach_hang_id);
            existingGioHang = await prisma.giohang.findFirst({
                where: whereCondition
            });
        }
        // Hoặc tìm theo session ID (cho khách hàng chưa đăng nhập)
        else if (session_id && session_id.trim() !== '') {
            whereCondition.session_id = session_id.trim();
            existingGioHang = await prisma.giohang.findFirst({
                where: whereCondition
            });
        }

        // Nếu đã có giỏ hàng, trả về giỏ hàng đó (không tạo mới)
        if (existingGioHang) {
            return res.status(200).json({
                message: 'Lấy giỏ hàng thành công',
                success: true,
                data: existingGioHang
            });
        }

        // Nếu có session_id, sử dụng upsert để tránh lỗi unique constraint
        if (session_id && session_id.trim() !== '') {
            // Upsert: nếu đã có thì cập nhật, chưa có thì tạo mới
            const data = await prisma.giohang.upsert({
                where: {
                    session_id: session_id.trim() // Tìm theo session_id
                },
                update: {
                    ngay_cap_nhat: new Date() // Cập nhật ngày cập nhật nếu đã có
                },
                create: {
                    khach_hang_id: khach_hang_id ? parseInt(khach_hang_id) : null, // ID khách hàng (có thể null)
                    session_id: session_id.trim() // Session ID cho khách hàng chưa đăng nhập
                },
                include: {
                    khachhang: true // Include thông tin khách hàng
                }
            });

            return res.status(201).json({
                message: 'Tạo giỏ hàng thành công',
                success: true,
                data: data
            });
        } else {
            // Nếu không có session_id, tạo mới giỏ hàng bình thường
            const data = await prisma.giohang.create({
                data: {
                    khach_hang_id: khach_hang_id ? parseInt(khach_hang_id) : null, // ID khách hàng (có thể null)
                    session_id: null // Không có session ID
                },
                include: {
                    khachhang: true // Include thông tin khách hàng
                }
            });

            return res.status(201).json({
                message: 'Tạo giỏ hàng thành công',
                success: true,
                data: data
            });
        }
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
};

// Xóa giỏ hàng theo ID
export const deleteGioHangById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID giỏ hàng từ URL params

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID không được để trống và phải là số',
                success: false,
                data: null
            });
        }

        // Kiểm tra giỏ hàng có tồn tại không (trước khi xóa)
        const existingGioHang = await prisma.giohang.findUnique({
            where: { gio_hang_id: parseInt(id) }
        });

        if (!existingGioHang) {
            return res.status(404).json({
                message: 'Không tìm thấy giỏ hàng',
                success: false,
                data: null
            });
        }

        // Xóa giỏ hàng trong database (sẽ tự động xóa chi tiết giỏ hàng do cascade delete)
        const data = await prisma.giohang.delete({
            where: { gio_hang_id: parseInt(id) } // Tìm giỏ hàng theo ID để xóa
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: 'Xóa giỏ hàng thành công',
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