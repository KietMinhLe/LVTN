import prisma from "../config/db.js";

// Lấy tất cả địa chỉ (có phân trang)
export const getAllSoDiaChi = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Lấy tổng số địa chỉ
        const total = await prisma.sodiachi.count();

        // Lấy dữ liệu với phân trang
        const data = await prisma.sodiachi.findMany({
            skip: skip,
            take: limit,
            include: {
                khachhang: {
                    select: {
                        khach_hang_id: true,
                        email: true,
                        ho_ten: true,
                        so_dien_thoai: true
                    }
                }
            },
            orderBy: {
                dia_chi_id: 'desc'
            }
        });

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            message: "Lấy tất cả địa chỉ thành công",
            success: true,
            data: data,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách địa chỉ:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Lấy địa chỉ theo khách hàng ID
export const getSoDiaChiByKhachHangId = async (req, res) => {
    try {
        const { khachHangId } = req.params;

        // Kiểm tra ID có hợp lệ không
        const khachHangIdInt = parseInt(khachHangId);
        if (isNaN(khachHangIdInt)) {
            return res.status(400).json({
                message: "ID khách hàng không hợp lệ",
                success: false
            });
        }

        // Kiểm tra khách hàng có tồn tại không
        const khachHang = await prisma.khachhang.findUnique({
            where: { khach_hang_id: khachHangIdInt }
        });

        if (!khachHang) {
            return res.status(404).json({
                message: "Không tìm thấy khách hàng",
                success: false
            });
        }

        // Lấy tất cả địa chỉ của khách hàng
        const data = await prisma.sodiachi.findMany({
            where: { khach_hang_id: khachHangIdInt },
            include: {
                khachhang: {
                    select: {
                        khach_hang_id: true,
                        email: true,
                        ho_ten: true,
                        so_dien_thoai: true
                    }
                }
            },
            orderBy: {
                la_mac_dinh: 'desc', // Địa chỉ mặc định lên trước
                dia_chi_id: 'desc'
            }
        });

        return res.status(200).json({
            message: "Lấy danh sách địa chỉ thành công",
            success: true,
            data: data,
            count: data.length
        });
    } catch (error) {
        console.error("Lỗi lấy địa chỉ theo khách hàng:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export const getDefaultSoDiaChi = async (req, res) => {
    try {
        const user = req.user;
        const { khachHangId } = req.query;
        const targetId = user?.id || (khachHangId ? parseInt(khachHangId) : null);

        if (!targetId) {
            return res.status(400).json({
                message: "Thiếu thông tin khách hàng",
                success: false
            });
        }

        const address = await prisma.sodiachi.findFirst({
            where: {
                khach_hang_id: parseInt(targetId)
            },
            orderBy: [
                { la_mac_dinh: 'desc' },
                { dia_chi_id: 'desc' }
            ]
        });

        if (!address) {
            return res.status(404).json({
                message: "Không tìm thấy địa chỉ mặc định",
                success: false
            });
        }

        return res.status(200).json({
            message: "Lấy địa chỉ mặc định thành công",
            success: true,
            data: address
        });
    } catch (error) {
        console.error("Lỗi lấy địa chỉ mặc định:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

//Sắp xếp địa chỉ
export const sortSoDiaChi = async (req, res) => {
    try {
        const { sortBy, order } = req.query;

        //Kiểm tra tham số sortBy và order có được cung cấp không
        if (!sortBy || !order) {
            return res.status(400).json({
                message: "Thiếu tham số sortBy hoặc order",
                success: false
            });
        }

        //Kiểm tra tham số sortBy có hợp lệ không
        if (!['dia_chi_id', 'khachhang_id', 'ho_ten_nguoi_nhan', 'so_dien_thoai_nguoi_nhan', 'phuong_xa', 'quan_huyen', 'tinh_thanh', 'dia_chi_chi_tiet', 'la_mac_dinh', 'ngay_tao', 'ngay_cap_nhat'].includes(sortBy)) {
            return res.status(400).json({
                message: "Tham số sortBy không hợp lệ",
                success: false
            });
        }

        //Kiểm tra tham số order có hợp lệ không
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: "Tham số order không hợp lệ",
                success: false
            });
        }

        //Xây dựng orderBy object
        const orderBy = {};
        orderBy[sortBy] = order;

        //Lấy dữ liệu với sắp xếp
        const data = await prisma.sodiachi.findMany({
            include: {
                khachhang: true
            },
            orderBy: orderBy
        });

        return res.status(200).json({
            message: "Sắp xếp địa chỉ thành công",
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

//Tìm kiếm địa chỉ
export const searchSoDiaChi = async (req, res) => {
    try {
        const { ho_ten_nguoi_nhan, so_dien_thoai_nguoi_nhan, phuong_xa, quan_huyen, tinh_thanh, dia_chi_chi_tiet } = req.query;

        //Kiểm tra có ít nhất một tham số tìm kiếm
        if (!ho_ten_nguoi_nhan && !so_dien_thoai_nguoi_nhan && !phuong_xa && !quan_huyen && !tinh_thanh && !dia_chi_chi_tiet) {
            return res.status(400).json({
                message: "Vui lòng cung cấp ít nhất một tham số tìm kiếm",
                success: false
            });
        }

        // Xây dựng điều kiện tìm kiếm theo từng trường (hỗ trợ tiếng Việt)
        const whereClause = {};

        // Tìm kiếm theo tên người nhận (hỗ trợ tiếng Việt)
        if (ho_ten_nguoi_nhan) {
            whereClause.ho_ten_nguoi_nhan = {
                contains: ho_ten_nguoi_nhan.trim()
            };
        }

        // Tìm kiếm theo số điện thoại người nhận
        if (so_dien_thoai_nguoi_nhan) {
            whereClause.so_dien_thoai_nguoi_nhan = {
                contains: so_dien_thoai_nguoi_nhan.trim()
            };
        }

        // Tìm kiếm theo phường/xã (hỗ trợ tiếng Việt)
        if (phuong_xa) {
            whereClause.phuong_xa = {
                contains: phuong_xa.trim()
            };
        }

        // Tìm kiếm theo quận/huyện (hỗ trợ tiếng Việt)
        if (quan_huyen) {
            whereClause.quan_huyen = {
                contains: quan_huyen.trim()
            };
        }

        // Tìm kiếm theo tỉnh/thành phố (hỗ trợ tiếng Việt)
        if (tinh_thanh) {
            whereClause.tinh_thanh = {
                contains: tinh_thanh.trim()
            };
        }

        // Tìm kiếm theo địa chỉ chi tiết (hỗ trợ tiếng Việt)
        if (dia_chi_chi_tiet) {
            whereClause.dia_chi_chi_tiet = {
                contains: dia_chi_chi_tiet.trim()
            };
        }

        //Tìm kiếm địa chỉ
        const data = await prisma.sodiachi.findMany({
            include: {
                khachhang: true
            },
            where: whereClause
        });


        //Kiểm tra địa chỉ có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có địa chỉ nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Tìm kiếm địa chỉ thành công",
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

//Lấy địa chỉ theo ID
export const getSoDiaChiById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Lấy địa chỉ theo ID
        const data = await prisma.sodiachi.findUnique({
            where: { dia_chi_id: parseInt(id) },
            include: {
                khachhang: true
            }
        });

        //Kiểm tra địa chỉ có tồn tại trong DB không
        if (!data) {
            return res.status(404).json({
                message: "Không có địa chỉ nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Lấy địa chỉ thành công",
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

// Tạo địa chỉ
export const createSoDiaChi = async (req, res) => {
    try {
        // Lấy khach_hang_id từ token (nếu là customer) hoặc từ body (nếu là admin)
        const user = req.user; // Từ middleware authenticateUser
        const {
            khach_hang_id,
            ho_ten_nguoi_nhan,
            so_dien_thoai_nguoi_nhan,
            phuong_xa,
            quan_huyen,
            tinh_thanh,
            dia_chi_chi_tiet,
            la_mac_dinh,
            ghn_province_id,
            ghn_province_name,
            ghn_district_id,
            ghn_district_name,
            ghn_ward_code,
            ghn_ward_name
        } = req.body;

        // Xác định khach_hang_id: ưu tiên từ body (admin), nếu không có thì lấy từ token (customer)
        const khachHangId = khach_hang_id || (user ? user.id : null);

        if (!khachHangId) {
            return res.status(400).json({
                message: "Thiếu thông tin khách hàng",
                success: false
            });
        }

        // Kiểm tra khách hàng có tồn tại không
        const khachHang = await prisma.khachhang.findUnique({
            where: { khach_hang_id: parseInt(khachHangId) }
        });

        if (!khachHang) {
            return res.status(404).json({
                message: "Không tìm thấy khách hàng",
                success: false
            });
        }

        // Kiểm tra dữ liệu bắt buộc
        if (!ho_ten_nguoi_nhan || !phuong_xa || !quan_huyen || !tinh_thanh || !dia_chi_chi_tiet) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin bắt buộc (họ tên người nhận, phường/xã, quận/huyện, tỉnh/thành, địa chỉ chi tiết)",
                success: false
            });
        }

        // Validate số điện thoại người nhận (nếu có)
        if (so_dien_thoai_nguoi_nhan) {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(so_dien_thoai_nguoi_nhan.trim())) {
                return res.status(400).json({
                    message: "Số điện thoại người nhận không hợp lệ (10-11 chữ số)",
                    success: false
                });
            }
        }

        // Nếu đặt làm mặc định, hủy mặc định của các địa chỉ khác của cùng khách hàng
        if (la_mac_dinh === true) {
            await prisma.sodiachi.updateMany({
                where: {
                    khach_hang_id: parseInt(khachHangId),
                    la_mac_dinh: true
                },
                data: { la_mac_dinh: false }
            });
        }

        // Tạo địa chỉ trong DB
        const data = await prisma.sodiachi.create({
            data: {
                khach_hang_id: parseInt(khachHangId),
                ho_ten_nguoi_nhan: ho_ten_nguoi_nhan.trim(),
                so_dien_thoai_nguoi_nhan: so_dien_thoai_nguoi_nhan ? so_dien_thoai_nguoi_nhan.trim() : null,
                phuong_xa: phuong_xa.trim(),
                quan_huyen: quan_huyen.trim(),
                tinh_thanh: tinh_thanh.trim(),
                dia_chi_chi_tiet: dia_chi_chi_tiet.trim(),
                la_mac_dinh: la_mac_dinh === true,
                ghn_province_id: ghn_province_id ? parseInt(ghn_province_id) : null,
                ghn_province_name: ghn_province_name ? ghn_province_name.trim() : null,
                ghn_district_id: ghn_district_id ? parseInt(ghn_district_id) : null,
                ghn_district_name: ghn_district_name ? ghn_district_name.trim() : null,
                ghn_ward_code: ghn_ward_code ? ghn_ward_code.trim() : null,
                ghn_ward_name: ghn_ward_name ? ghn_ward_name.trim() : null
            },
            include: {
                khachhang: {
                    select: {
                        khach_hang_id: true,
                        email: true,
                        ho_ten: true,
                        so_dien_thoai: true
                    }
                }
            }
        });

        return res.status(201).json({
            message: "Tạo địa chỉ thành công",
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

// Cập nhật địa chỉ
export const updateSoDiaChi = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            ho_ten_nguoi_nhan,
            so_dien_thoai_nguoi_nhan,
            phuong_xa,
            quan_huyen,
            tinh_thanh,
            dia_chi_chi_tiet,
            la_mac_dinh,
            ghn_province_id,
            ghn_province_name,
            ghn_district_id,
            ghn_district_name,
            ghn_ward_code,
            ghn_ward_name
        } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra địa chỉ có tồn tại trong DB không
        const existing = await prisma.sodiachi.findUnique({
            where: { dia_chi_id: parseInt(id) }
        });

        //Kiểm tra địa chỉ có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có địa chỉ nào trong hệ thống",
                success: false
            });
        }

        // Kiểm tra dữ liệu bắt buộc
        if (!ho_ten_nguoi_nhan || !phuong_xa || !quan_huyen || !tinh_thanh || !dia_chi_chi_tiet) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin bắt buộc (họ tên người nhận, phường/xã, quận/huyện, tỉnh/thành, địa chỉ chi tiết)",
                success: false
            });
        }

        // Validate số điện thoại người nhận (nếu có)
        if (so_dien_thoai_nguoi_nhan) {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(so_dien_thoai_nguoi_nhan.trim())) {
                return res.status(400).json({
                    message: "Số điện thoại người nhận không hợp lệ (10-11 chữ số)",
                    success: false
                });
            }
        }

        // Kiểm tra địa chỉ trùng với địa chỉ khác (ngoại trừ chính địa chỉ đang cập nhật)
        const existingSoDiaChi = await prisma.sodiachi.findFirst({
            where: {
                khach_hang_id: existing.khach_hang_id, // Cùng khách hàng
                ho_ten_nguoi_nhan: ho_ten_nguoi_nhan.trim(),
                so_dien_thoai_nguoi_nhan: so_dien_thoai_nguoi_nhan ? so_dien_thoai_nguoi_nhan.trim() : null,
                phuong_xa: phuong_xa.trim(),
                quan_huyen: quan_huyen.trim(),
                tinh_thanh: tinh_thanh.trim(),
                dia_chi_chi_tiet: dia_chi_chi_tiet.trim(),
                NOT: {
                    dia_chi_id: parseInt(id) // Loại trừ địa chỉ đang cập nhật
                }
            }
        });

        // Kiểm tra địa chỉ trùng với địa chỉ khác
        if (existingSoDiaChi) {
            return res.status(400).json({
                message: "Địa chỉ này đã tồn tại",
                success: false
            });
        }

        // Xử lý đặt làm mặc định
        const updateData = {
            ho_ten_nguoi_nhan: ho_ten_nguoi_nhan.trim(),
            so_dien_thoai_nguoi_nhan: so_dien_thoai_nguoi_nhan ? so_dien_thoai_nguoi_nhan.trim() : null,
            phuong_xa: phuong_xa.trim(),
            quan_huyen: quan_huyen.trim(),
            tinh_thanh: tinh_thanh.trim(),
            dia_chi_chi_tiet: dia_chi_chi_tiet.trim(),
            ngay_cap_nhat: new Date(),
            ghn_province_id: ghn_province_id ? parseInt(ghn_province_id) : null,
            ghn_province_name: ghn_province_name ? ghn_province_name.trim() : null,
            ghn_district_id: ghn_district_id ? parseInt(ghn_district_id) : null,
            ghn_district_name: ghn_district_name ? ghn_district_name.trim() : null,
            ghn_ward_code: ghn_ward_code ? ghn_ward_code.trim() : null,
            ghn_ward_name: ghn_ward_name ? ghn_ward_name.trim() : null
        };

        // Nếu đặt làm mặc định, hủy mặc định của các địa chỉ khác
        if (la_mac_dinh !== undefined) {
            if (la_mac_dinh === true) {
                await prisma.sodiachi.updateMany({
                    where: {
                        khach_hang_id: existing.khach_hang_id,
                        la_mac_dinh: true,
                        NOT: {
                            dia_chi_id: parseInt(id)
                        }
                    },
                    data: { la_mac_dinh: false }
                });
            }
            updateData.la_mac_dinh = la_mac_dinh === true;
        }

        // Cập nhật địa chỉ trong DB
        const data = await prisma.sodiachi.update({
            where: { dia_chi_id: parseInt(id) },
            data: updateData,
            include: {
                khachhang: {
                    select: {
                        khach_hang_id: true,
                        email: true,
                        ho_ten: true,
                        so_dien_thoai: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Cập nhật địa chỉ thành công",
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

//Xóa địa chỉ
export const deleteSoDiaChi = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra địa chỉ có tồn tại trong DB không
        const existing = await prisma.sodiachi.findUnique({
            where: { dia_chi_id: parseInt(id) }
        });

        //Kiểm tra địa chỉ có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có địa chỉ nào trong hệ thống",
                success: false
            });
        }

        //Xóa địa chỉ trong DB
        const data = await prisma.sodiachi.delete({
            where: { dia_chi_id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Xóa địa chỉ thành công",
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