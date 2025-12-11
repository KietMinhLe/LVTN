import prisma from "../config/db.js"; // Import Prisma Client để thao tác với database

// Lấy tất cả chi tiết giỏ hàng
export const getAllChiTietGioHang = async (req, res) => {
    try {
        const data = await prisma.chitietgiohang.findMany({
            // Dùng include để lấy thông tin sách và giỏ hàng       
            include: {
                sach: true, // Lấy thông tin sách
                giohang: { // Lấy thông tin giỏ hàng
                    // Dùng include để lấy thông tin khách hàng
                    include: {
                        khachhang: true // Lấy thông tin khách hàng
                    }
                }
            }
        });

        //Kiểm tra xem có dữ liệu không
        if (!data.length) {
            return res.status(404).json({
                message: "Không có dữ liệu",
                success: false,
                data: []
            });
        }

        //Trả về dữ liệu
        return res.status(200).json({
            message: "Lấy danh sách chi tiết giỏ hàng thành công",
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

// Lấy chi tiết giỏ hàng theo ID
export const getChiTietGioHangById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID không được để trống và phải là số',
                success: false,
                data: null
            });
        }

        // Lấy chi tiết giỏ hàng theo ID
        const data = await prisma.chitietgiohang.findUnique({
            where: { chi_tiet_gio_hang_id: parseInt(id) }, // Chuyển ID sang số nguyên
            include: {
                sach: true, // Include thông tin sách
                giohang: {
                    include: {
                        khachhang: true // Include thông tin khách hàng
                    }
                }
            }
        });

        //Kiểm tra xem có dữ liệu không
        if (!data) {
            return res.status(404).json({
                message: 'Không tìm thấy chi tiết giỏ hàng',
                success: false,
                data: null
            });
        }

        //Trả về dữ liệu
        return res.status(200).json({
            message: 'Lấy chi tiết giỏ hàng thành công',
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

// Lấy chi tiết giỏ hàng theo giỏ hàng ID
export const getChiTietGioHangByGioHangId = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID giỏ hàng không được để trống và phải là số',
                success: false,
                data: []
            });
        }

        // Query lấy chi tiết giỏ hàng theo giỏ hàng ID
        const data = await prisma.chitietgiohang.findMany({
            where: { gio_hang_id: parseInt(id) },
            include: {
                sach: { // Include thông tin sách
                    include: {
                        tacgia: true, // Include thông tin tác giả
                        sach_danhmuc: {
                            include: {
                                danhmuc: true // Include thông tin danh mục
                            }
                        }
                    }
                },
                giohang: { // Include thông tin giỏ hàng
                    include: {
                        khachhang: true // Include thông tin khách hàng
                    }
                }
            },
            orderBy: {
                ngay_tao: 'desc' // Sắp xếp theo ngày tạo giảm dần  
            }
        });

        //Trả về dữ liệu (có thể rỗng nếu giỏ hàng chưa có sản phẩm)
        return res.status(200).json({
            message: 'Lấy chi tiết giỏ hàng thành công',
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

// Thêm sách vào giỏ hàng (nếu sách đã có trong giỏ hàng thì cập nhật số lượng)
export const createChiTietGioHang = async (req, res) => {
    try {
        const { gio_hang_id, sach_id, so_luong } = req.body; // Lấy dữ liệu từ request body

        // Kiểm tra các trường bắt buộc
        if (!gio_hang_id || !sach_id || !so_luong) {
            return res.status(400).json({
                message: "Vui lòng điền đầy đủ thông tin",
                success: false,
                data: null
            });
        }

        // Kiểm tra xem giỏ hàng có tồn tại không
        const gioHang = await prisma.giohang.findUnique({
            where: {
                gio_hang_id: parseInt(gio_hang_id) // Chuyển ID sang số nguyên
            }
        });

        if (!gioHang) {
            return res.status(404).json({
                message: "Giỏ hàng không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra xem sách có tồn tại không
        const sach = await prisma.sach.findUnique({
            where: {
                sach_id: parseInt(sach_id)
            }
        });

        // Kiểm tra xem sách có tồn tại không
        if (!sach) {
            return res.status(404).json({
                message: "Sách không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra số lượng tồn kho có đủ không
        if (sach.so_luong < parseInt(so_luong)) {
            return res.status(400).json({
                message: `Số lượng sách không đủ. Hiện tại còn ${sach.so_luong} cuốn`,
                success: false,
                data: null
            });
        }

        // Kiểm tra xem số lượng sách có hợp lệ không (phải lớn hơn 0)
        if (parseInt(so_luong) <= 0) {
            return res.status(400).json({
                message: "Số lượng sách phải lớn hơn 0",
                success: false,
                data: null
            });
        }

        // Kiểm tra xem sách đã có trong giỏ hàng chưa
        const existingItem = await prisma.chitietgiohang.findFirst({
            where: {
                gio_hang_id: parseInt(gio_hang_id), // Tìm trong giỏ hàng này
                sach_id: parseInt(sach_id)           // Tìm sách này
            }
        });

        // Khởi tạo biến chi tiết giỏ hàng
        let chiTietGioHang;

        // Kiểm tra xem sách đã có trong giỏ hàng chưa
        if (existingItem) {
            // Nếu sách đã có trong giỏ hàng, cập nhật số lượng (cộng thêm)
            const newQuantity = existingItem.so_luong + parseInt(so_luong);

            // Kiểm tra số lượng tồn kho sau khi cộng thêm có đủ không
            if (sach.so_luong < newQuantity) {
                return res.status(400).json({
                    message: `Số lượng sách không đủ. Hiện tại còn ${sach.so_luong} cuốn`,
                    success: false,
                    data: null
                });
            }

            // Cập nhật số lượng sách trong giỏ hàng
            chiTietGioHang = await prisma.chitietgiohang.update({
                // Tìm theo ID chi tiết giỏ hàng
                where: {
                    chi_tiet_gio_hang_id: existingItem.chi_tiet_gio_hang_id // Tìm theo ID chi tiết giỏ hàng
                },
                // Cập nhật số lượng mới
                data: {
                    so_luong: newQuantity // Cập nhật số lượng mới
                },
                include: {
                    sach: true // Include thông tin sách
                }
            });
        } else {
            // Nếu sách chưa có trong giỏ hàng, tạo mới chi tiết giỏ hàng
            chiTietGioHang = await prisma.chitietgiohang.create({
                data: {
                    gio_hang_id: parseInt(gio_hang_id), // ID giỏ hàng
                    sach_id: parseInt(sach_id),         // ID sách
                    so_luong: parseInt(so_luong)        // Số lượng
                },
                include: {
                    sach: true // Include thông tin sách
                }
            });
        }

        // Trả về kết quả thành công
        return res.status(200).json({
            message: existingItem ? "Cập nhật số lượng sách trong giỏ hàng thành công" : "Thêm chi tiết giỏ hàng thành công",
            success: true,
            data: chiTietGioHang
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

// Cập nhật số lượng sách trong chi tiết giỏ hàng
export const updateChiTietGioHang = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID chi tiết giỏ hàng từ URL params
        const { so_luong } = req.body; // Lấy số lượng mới từ request body

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID không được để trống và phải là số',
                success: false,
                data: null
            });
        }

        // Kiểm tra số lượng có hợp lệ không (phải lớn hơn 0)
        if (!so_luong || parseInt(so_luong) <= 0) {
            return res.status(400).json({
                message: "Số lượng sách phải lớn hơn 0",
                success: false,
                data: null
            });
        }

        // Lấy chi tiết giỏ hàng hiện tại (để kiểm tra và lấy thông tin sách)
        const existingItem = await prisma.chitietgiohang.findUnique({
            where: { chi_tiet_gio_hang_id: parseInt(id) }, // Tìm theo ID
            include: {
                sach: true // Include thông tin sách để kiểm tra tồn kho
            }
        });

        // Kiểm tra xem chi tiết giỏ hàng có tồn tại không
        if (!existingItem) {
            return res.status(404).json({
                message: "Không tìm thấy chi tiết giỏ hàng",
                success: false,
                data: null
            });
        }

        // Kiểm tra số lượng tồn kho có đủ không (sách có tồn tại không)
        if (existingItem.sach.so_luong < parseInt(so_luong)) {
            return res.status(400).json({
                message: `Số lượng sách không đủ. Hiện tại còn ${existingItem.sach.so_luong} cuốn`,
                success: false,
                data: null
            });
        }

        // Cập nhật số lượng sách trong chi tiết giỏ hàng
        const chiTietGioHang = await prisma.chitietgiohang.update({
            // Tìm theo ID chi tiết giỏ hàng
            where: { chi_tiet_gio_hang_id: parseInt(id) }, // Tìm theo ID
            // Cập nhật số lượng mới
            data: {
                so_luong: parseInt(so_luong) // Cập nhật số lượng mới
            },
            // Include thông tin sách và giỏ hàng
            include: {
                sach: true,    // Include thông tin sách
                giohang: true  // Include thông tin giỏ hàng
            }
        });

        // Trả về dữ liệu thành công
        return res.status(200).json({
            message: "Cập nhật chi tiết giỏ hàng thành công",
            success: true,
            data: chiTietGioHang
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

// Xóa một sách khỏi giỏ hàng (xóa chi tiết giỏ hàng)
export const deleteChiTietGioHang = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID chi tiết giỏ hàng từ URL params

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID không được để trống và phải là số',
                success: false,
                data: null
            });
        }

        // Kiểm tra xem chi tiết giỏ hàng có tồn tại không (trước khi xóa)
        const existingItem = await prisma.chitietgiohang.findUnique({
            where: { chi_tiet_gio_hang_id: parseInt(id) }
        });

        // Kiểm tra xem chi tiết giỏ hàng có tồn tại không
        if (!existingItem) {
            return res.status(404).json({
                message: 'Không tìm thấy chi tiết giỏ hàng',
                success: false,
                data: null
            });
        }

        // Xóa chi tiết giỏ hàng trong database
        const data = await prisma.chitietgiohang.delete({
            where: { chi_tiet_gio_hang_id: parseInt(id) } // Tìm theo ID để xóa
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: 'Xóa chi tiết giỏ hàng thành công',
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

// Xóa tất cả sách trong giỏ hàng (xóa tất cả chi tiết giỏ hàng theo giỏ hàng ID)
export const deleteAllChiTietGioHangByGioHangId = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID giỏ hàng từ URL params

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID giỏ hàng không được để trống và phải là số',
                success: false,
                data: null
            });
        }

        // Kiểm tra xem giỏ hàng có tồn tại không
        const gioHang = await prisma.giohang.findUnique({
            where: { gio_hang_id: parseInt(id) }
        });

        if (!gioHang) {
            return res.status(404).json({
                message: 'Không tìm thấy giỏ hàng',
                success: false,
                data: null
            });
        }

        // Xóa tất cả chi tiết giỏ hàng của giỏ hàng này (bulk delete)
        const data = await prisma.chitietgiohang.deleteMany({
            where: { gio_hang_id: parseInt(id) } // Tìm tất cả chi tiết của giỏ hàng này
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: 'Xóa tất cả chi tiết giỏ hàng thành công',
            success: true,
            data: {
                count: data.count // Số lượng chi tiết đã xóa
            }
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