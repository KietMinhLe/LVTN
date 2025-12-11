import prisma from "../config/db.js";

// Admin: Lấy tất cả đánh giá (cho admin quản lý)
export const getAllDanhGia = async (req, res) => {
    try {
        const { page = 1, limit = 20, sach_id, khach_hang_id, search } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Xây dựng điều kiện where
        const where = {};
        if (sach_id && !isNaN(sach_id)) {
            where.sach_id = parseInt(sach_id);
        }
        if (khach_hang_id && !isNaN(khach_hang_id)) {
            where.khach_hang_id = parseInt(khach_hang_id);
        }
        if (search) {
            where.OR = [
                { binh_luan: { contains: search } },
                { khachhang: { ho_ten: { contains: search } } },
                { sach: { ten_sach: { contains: search } } }
            ];
        }

        // Lấy danh sách đánh giá với phân trang
        const [data, total] = await Promise.all([
            prisma.danhgia.findMany({
                where,
                include: {
                    khachhang: {
                        select: {
                            khach_hang_id: true,
                            ho_ten: true,
                            email: true
                        }
                    },
                    sach: {
                        select: {
                            sach_id: true,
                            ten_sach: true,
                            anh_bia_url: true
                        }
                    },
                    donhang: {
                        select: {
                            don_hang_id: true,
                            ma_don_hang: true
                        }
                    }
                },
                orderBy: {
                    ngay_danh_gia: 'desc'
                },
                skip,
                take: limitNum
            }),
            prisma.danhgia.count({ where })
        ]);

        return res.status(200).json({
            message: "Lấy danh sách đánh giá thành công",
            success: true,
            data: {
                danh_gia: data,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
};

// Lấy tất cả đánh giá của một sách
export const getDanhGiaBySachId = async (req, res) => {
    try {
        const { sach_id } = req.params;

        if (!sach_id || isNaN(sach_id)) {
            return res.status(400).json({
                message: "ID sách không hợp lệ",
                success: false
            });
        }

        // Lấy tất cả đánh giá (không cần duyệt)
        const data = await prisma.danhgia.findMany({
            where: {
                sach_id: parseInt(sach_id)
                // Hiển thị tất cả đánh giá, không cần duyệt
            },
            include: {
                khachhang: {
                    select: {
                        khach_hang_id: true,
                        ho_ten: true,
                        email: true
                    }
                },
                sach: {
                    select: {
                        sach_id: true,
                        ten_sach: true
                    }
                }
            },
            orderBy: {
                ngay_danh_gia: 'desc' // Mới nhất trước
            }
        });

        // Tính điểm trung bình
        const diemTrungBinh = data.length > 0
            ? data.reduce((sum, dg) => sum + dg.xep_hang, 0) / data.length
            : 0;

        // Đếm số lượng theo từng sao
        const thongKeSao = {
            5: data.filter(dg => dg.xep_hang === 5).length,
            4: data.filter(dg => dg.xep_hang === 4).length,
            3: data.filter(dg => dg.xep_hang === 3).length,
            2: data.filter(dg => dg.xep_hang === 2).length,
            1: data.filter(dg => dg.xep_hang === 1).length
        };

        return res.status(200).json({
            message: "Lấy đánh giá thành công",
            success: true,
            data: {
                danh_gia: data,
                diem_trung_binh: Math.round(diemTrungBinh * 10) / 10,
                tong_so_danh_gia: data.length,
                thong_ke_sao: thongKeSao
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
};

// Tạo đánh giá mới
export const createDanhGia = async (req, res) => {
    try {
        const { sach_id, don_hang_id, xep_hang, binh_luan } = req.body;
        const khach_hang_id = req.user?.id;

        // Validate dữ liệu
        if (!sach_id || !don_hang_id || !xep_hang) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc",
                success: false
            });
        }

        // Kiểm tra xếp hạng hợp lệ (1-5 sao)
        if (xep_hang < 1 || xep_hang > 5) {
            return res.status(400).json({
                message: "Xếp hạng phải từ 1 đến 5 sao",
                success: false
            });
        }

        if (!khach_hang_id) {
            return res.status(401).json({
                message: "Chưa đăng nhập",
                success: false
            });
        }

        // Convert sang số nguyên để so sánh với database
        const khachHangIdInt = parseInt(khach_hang_id);

        // Kiểm tra khách hàng đã đánh giá sách này trong đơn hàng này chưa
        const existingDanhGia = await prisma.danhgia.findFirst({
            where: {
                sach_id: parseInt(sach_id),
                don_hang_id: parseInt(don_hang_id),
                khach_hang_id: khachHangIdInt
            }
        });

        if (existingDanhGia) {
            return res.status(400).json({
                message: "Bạn đã đánh giá sách này trong đơn hàng này rồi",
                success: false
            });
        }

        // Kiểm tra đơn hàng có thuộc về khách hàng này không
        const donHang = await prisma.donhang.findUnique({
            where: { don_hang_id: parseInt(don_hang_id) },
            include: {
                chitietdonhang: {
                    where: { sach_id: parseInt(sach_id) }
                }
            }
        });

        // Debug log
        console.log('=== DEBUG CREATE DANH GIA ===');
        console.log('req.user:', JSON.stringify(req.user, null, 2));
        console.log('khach_hang_id from token:', khach_hang_id, 'type:', typeof khach_hang_id);
        console.log('khachHangIdInt:', khachHangIdInt, 'type:', typeof khachHangIdInt);
        console.log('donHang:', donHang ? {
            don_hang_id: donHang.don_hang_id,
            khach_hang_id: donHang.khach_hang_id,
            khach_hang_id_type: typeof donHang.khach_hang_id,
            khach_hang_id_value: donHang.khach_hang_id,
            ma_don_hang: donHang.ma_don_hang
        } : 'null');
        console.log('Comparison:', {
            donHangKhachHangId: donHang?.khach_hang_id ? parseInt(donHang.khach_hang_id) : null,
            khachHangIdInt: khachHangIdInt,
            match: donHang?.khach_hang_id ? parseInt(donHang.khach_hang_id) === khachHangIdInt : false
        });
        console.log('=============================');

        if (!donHang) {
            return res.status(404).json({
                message: "Không tìm thấy đơn hàng",
                success: false
            });
        }

        // So sánh khach_hang_id (có thể là số hoặc null)
        // Nếu đơn hàng không có khach_hang_id (null), không cho phép đánh giá
        if (!donHang.khach_hang_id) {
            return res.status(403).json({
                message: "Đơn hàng này được tạo khi chưa đăng nhập. Không thể đánh giá đơn hàng này.",
                success: false
            });
        }

        // Convert cả hai về số nguyên để so sánh chính xác
        const donHangKhachHangId = Number(donHang.khach_hang_id);
        const userKhachHangId = Number(khachHangIdInt);

        console.log('Permission check:', {
            donHangKhachHangId,
            userKhachHangId,
            donHangKhachHangId_type: typeof donHangKhachHangId,
            userKhachHangId_type: typeof userKhachHangId,
            match: donHangKhachHangId === userKhachHangId,
            strictEqual: donHangKhachHangId === userKhachHangId,
            looseEqual: donHangKhachHangId == userKhachHangId
        });

        if (donHangKhachHangId !== userKhachHangId) {
            return res.status(403).json({
                message: `Bạn không có quyền đánh giá đơn hàng này. Đơn hàng thuộc về khách hàng ID: ${donHangKhachHangId}, bạn là: ${userKhachHangId}`,
                success: false,
                debug: {
                    donHangKhachHangId,
                    userKhachHangId,
                    don_hang_id: donHang.don_hang_id,
                    ma_don_hang: donHang.ma_don_hang
                }
            });
        }

        if (donHang.chitietdonhang.length === 0) {
            return res.status(400).json({
                message: "Sách không có trong đơn hàng này",
                success: false
            });
        }

        // Tạo đánh giá mới
        const data = await prisma.danhgia.create({
            data: {
                sach_id: parseInt(sach_id),
                khach_hang_id: khachHangIdInt,
                don_hang_id: parseInt(don_hang_id),
                xep_hang: parseInt(xep_hang),
                binh_luan: binh_luan?.trim() || null,
                duyet_admin: true // Hiển thị ngay, không cần duyệt
            },
            include: {
                khachhang: {
                    select: {
                        khach_hang_id: true,
                        ho_ten: true,
                        email: true
                    }
                }
            }
        });

        return res.status(201).json({
            message: "Tạo đánh giá thành công. Đánh giá đã được hiển thị.",
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error creating danh gia:', error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
};

// Cập nhật đánh giá
export const updateDanhGia = async (req, res) => {
    try {
        const { id } = req.params;
        const { xep_hang, binh_luan } = req.body;
        const khach_hang_id = req.user?.id; // Từ middleware auth (JWT token có field 'id')

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID đánh giá không hợp lệ",
                success: false
            });
        }

        // Kiểm tra đánh giá có tồn tại và thuộc về khách hàng này không
        const existing = await prisma.danhgia.findUnique({
            where: { danh_gia_id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Không tìm thấy đánh giá",
                success: false
            });
        }

        if (!khach_hang_id) {
            return res.status(401).json({
                message: "Chưa đăng nhập",
                success: false
            });
        }

        const khachHangIdInt = parseInt(khach_hang_id);

        if (existing.khach_hang_id !== khachHangIdInt) {
            return res.status(403).json({
                message: "Bạn không có quyền cập nhật đánh giá này",
                success: false
            });
        }

        // Cho phép sửa đánh giá (không cần kiểm tra duyệt)

        const updateData = {};
        if (xep_hang !== undefined) {
            if (xep_hang < 1 || xep_hang > 5) {
                return res.status(400).json({
                    message: "Xếp hạng phải từ 1 đến 5 sao",
                    success: false
                });
            }
            updateData.xep_hang = parseInt(xep_hang);
        }
        if (binh_luan !== undefined) {
            updateData.binh_luan = binh_luan?.trim() || null;
        }

        const data = await prisma.danhgia.update({
            where: { danh_gia_id: parseInt(id) },
            data: updateData,
            include: {
                khachhang: {
                    select: {
                        khach_hang_id: true,
                        ho_ten: true,
                        email: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Cập nhật đánh giá thành công",
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
};

// Admin: Xóa đánh giá (chỉ admin mới có quyền)
export const deleteDanhGiaByAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID đánh giá không hợp lệ",
                success: false
            });
        }

        const existing = await prisma.danhgia.findUnique({
            where: { danh_gia_id: parseInt(id) },
            include: {
                khachhang: {
                    select: {
                        ho_ten: true,
                        email: true
                    }
                },
                sach: {
                    select: {
                        ten_sach: true
                    }
                }
            }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Không tìm thấy đánh giá",
                success: false
            });
        }

        await prisma.danhgia.delete({
            where: { danh_gia_id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Xóa đánh giá thành công",
            success: true,
            data: existing
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
};
