import prisma from "../config/db.js";

// Lấy tất cả voucher
export const getAllVoucher = async (req, res) => {
    try {
        const data = await prisma.voucher.findMany({
            // Dùng include để lấy thông tin voucher
            include: {
                donhang: true // Lấy thông tin đơn hàng
            },
            // Dùng orderBy để sắp xếp theo voucher_id giảm dần
            orderBy: {
                voucher_id: 'desc'
            }
        });

        //Kiểm tra xem có voucher nào không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có voucher nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Lấy tất cả voucher thành công",
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

// Lấy voucher theo ID
export const getVoucherById = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        // Lấy voucher theo ID
        const data = await prisma.voucher.findUnique({
            where: { voucher_id: parseInt(id) }, // Dùng where để lấy voucher theo ID
            include: {
                donhang: true // Lấy thông tin đơn hàng
            }
        });

        // Kiểm tra xem voucher có tồn tại không
        if (!data) {
            return res.status(404).json({
                message: "Voucher không tồn tại",
                success: false,
                data: null
            });
        }

        // Trả về dữ liệu
        return res.status(200).json({
            message: "Lấy voucher thành công",
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

// Lấy voucher theo mã voucher
export const getVoucherByCode = async (req, res) => {
    try {
        const { ma_voucher } = req.params;

        // Kiểm tra mã voucher có được cung cấp không
        if (!ma_voucher || ma_voucher.trim().length === 0) { // Kiểm tra mã voucher có được cung cấp không và không được để trống
            return res.status(400).json({
                message: "Mã voucher không được để trống",
                success: false,
                data: null
            });
        }

        // Lấy voucher theo mã
        const data = await prisma.voucher.findUnique({
            where: { ma_voucher: ma_voucher.trim().toUpperCase() }, // Dùng where để lấy voucher theo mã voucher
            include: {
                donhang: true // Lấy thông tin đơn hàng
            }
        });

        // Kiểm tra xem voucher có tồn tại không
        if (!data) {
            return res.status(404).json({
                message: "Voucher không tồn tại",
                success: false,
                data: null
            });
        }

        // Trả về dữ liệu
        return res.status(200).json({
            message: "Lấy voucher thành công",
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

// Lấy các voucher đang hoạt động
export const getActiveVouchers = async (req, res) => {
    try {
        const now = new Date();

        const data = await prisma.voucher.findMany({
            where: {
                trang_thai: true,
                ngay_bat_dau: {
                    lte: now // Kiểm tra ngày bắt đầu có nhỏ hơn hoặc bằng ngày hiện tại
                },
                ngay_het_han: {
                    gte: now // Kiểm tra ngày hết hạn có lớn hơn hoặc bằng ngày hiện tại
                }
            },
            // Dùng orderBy để sắp xếp theo voucher_id giảm dần
            orderBy: {
                voucher_id: 'desc'
            }
        });

        // Lọc thêm các voucher còn số lượng (nếu có giới hạn) và trả về các voucher đang hoạt động
        const activeVouchers = data.filter(voucher => {
            if (voucher.so_luong_toi_da !== null) {
                return (voucher.so_luong_da_dung || 0) < voucher.so_luong_toi_da;
            }
            return true;
        });

        // Kiểm tra xem có voucher đang hoạt động nào không
        if (activeVouchers.length === 0) {
            return res.status(404).json({
                message: "Không có voucher đang hoạt động",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Lấy voucher đang hoạt động thành công",
            success: true,
            data: activeVouchers
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Tạo voucher mới
export const createVoucher = async (req, res) => {
    try {
        const {
            ma_voucher,
            loai_giam_gia,
            gia_tri_giam,
            don_hang_toi_thieu,
            giam_toi_da,
            so_luong_toi_da,
            ngay_bat_dau,
            ngay_het_han,
            trang_thai
        } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!ma_voucher || !loai_giam_gia || gia_tri_giam === undefined || gia_tri_giam === null) {
            return res.status(400).json({
                message: "Mã voucher, loại giảm giá và giá trị giảm không được để trống",
                success: false
            });
        }

        // Kiểm tra mã voucher có đúng định dạng không (chỉ cho phép chữ, số, dấu gạch ngang)
        if (!/^[A-Z0-9-_]+$/i.test(ma_voucher)) {
            return res.status(400).json({
                message: "Mã voucher chỉ được chứa chữ, số, dấu gạch ngang và dấu gạch dưới",
                success: false
            });
        }

        // Kiểm tra loại giảm giá có hợp lệ không
        if (loai_giam_gia !== 'phần trăm' && loai_giam_gia !== 'tiền') {
            return res.status(400).json({
                message: "Loại giảm giá không hợp lệ. Chỉ chấp nhận: 'phần trăm' hoặc 'tiền'",
                success: false
            });
        }

        // Kiểm tra giá trị giảm giá có hợp lệ không
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

        // Kiểm tra đơn hàng tối thiểu
        let donHangToiThieuValue = 0;
        if (don_hang_toi_thieu !== undefined && don_hang_toi_thieu !== null && don_hang_toi_thieu !== '') {
            donHangToiThieuValue = parseFloat(don_hang_toi_thieu);
            if (isNaN(donHangToiThieuValue) || donHangToiThieuValue < 0) {
                return res.status(400).json({
                    message: "Đơn hàng tối thiểu phải là số lớn hơn hoặc bằng 0",
                    success: false
                });
            }
        }

        // Kiểm tra giảm tối đa
        let giamToiDaValue = null;
        if (giam_toi_da !== undefined && giam_toi_da !== null && giam_toi_da !== '') {
            giamToiDaValue = parseFloat(giam_toi_da);
            if (isNaN(giamToiDaValue) || giamToiDaValue <= 0) {
                return res.status(400).json({
                    message: "Giảm tối đa phải là số lớn hơn 0",
                    success: false
                });
            }
        }

        // Kiểm tra số lượng tối đa
        let soLuongToiDaValue = null;
        if (so_luong_toi_da !== undefined && so_luong_toi_da !== null && so_luong_toi_da !== '') {
            soLuongToiDaValue = parseInt(so_luong_toi_da);
            if (isNaN(soLuongToiDaValue) || soLuongToiDaValue <= 0) {
                return res.status(400).json({
                    message: "Số lượng tối đa phải là số nguyên lớn hơn 0",
                    success: false
                });
            }
        }

        // Kiểm tra ngày bắt đầu và ngày hết hạn
        let ngayBatDauValue = null;
        let ngayHetHanValue = null;

        if (ngay_bat_dau) {
            ngayBatDauValue = new Date(ngay_bat_dau);
            if (isNaN(ngayBatDauValue.getTime())) {
                return res.status(400).json({
                    message: "Ngày bắt đầu không hợp lệ",
                    success: false
                });
            }
        }

        if (ngay_het_han) {
            ngayHetHanValue = new Date(ngay_het_han);
            if (isNaN(ngayHetHanValue.getTime())) {
                return res.status(400).json({
                    message: "Ngày hết hạn không hợp lệ",
                    success: false
                });
            }
        }

        // Kiểm tra ngày bắt đầu phải trước ngày hết hạn
        if (ngayBatDauValue && ngayHetHanValue && ngayBatDauValue > ngayHetHanValue) {
            return res.status(400).json({
                message: "Ngày bắt đầu phải trước ngày hết hạn",
                success: false
            });
        }

        // Chuyển đổi trang_thai sang boolean
        let trangThaiValue = true;
        if (trang_thai !== undefined && trang_thai !== null) {
            if (typeof trang_thai === 'string') {
                trangThaiValue = trang_thai === 'true' || trang_thai === '1';
            } else {
                trangThaiValue = Boolean(trang_thai);
            }
        }

        // Kiểm tra mã voucher đã tồn tại chưa
        const existing = await prisma.voucher.findUnique({
            where: { ma_voucher: ma_voucher.trim().toUpperCase() }
        });

        if (existing) {
            return res.status(400).json({
                message: "Mã voucher đã tồn tại",
                success: false
            });
        }

        // Tạo voucher
        const data = await prisma.voucher.create({
            data: {
                ma_voucher: ma_voucher.trim().toUpperCase(),
                loai_giam_gia,
                gia_tri_giam: giaTriGiam,
                don_hang_toi_thieu: donHangToiThieuValue,
                giam_toi_da: giamToiDaValue,
                so_luong_toi_da: soLuongToiDaValue,
                so_luong_da_dung: 0,
                ngay_bat_dau: ngayBatDauValue,
                ngay_het_han: ngayHetHanValue,
                trang_thai: trangThaiValue
            }
        });

        // Trả về dữ liệu
        return res.status(200).json({
            message: "Tạo voucher thành công",
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

// Cập nhật voucher
export const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            ma_voucher,
            loai_giam_gia,
            gia_tri_giam,
            don_hang_toi_thieu,
            giam_toi_da,
            so_luong_toi_da,
            ngay_bat_dau,
            ngay_het_han,
            trang_thai
        } = req.body;

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        // Kiểm tra voucher có tồn tại không
        const existing = await prisma.voucher.findUnique({
            where: { voucher_id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Voucher không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra dữ liệu bắt buộc
        if (!ma_voucher || !loai_giam_gia || gia_tri_giam === undefined || gia_tri_giam === null) {
            return res.status(400).json({
                message: "Mã voucher, loại giảm giá và giá trị giảm không được để trống",
                success: false
            });
        }

        // Kiểm tra mã voucher có đúng định dạng không
        if (!/^[A-Z0-9-_]+$/i.test(ma_voucher)) {
            return res.status(400).json({
                message: "Mã voucher chỉ được chứa chữ, số, dấu gạch ngang và dấu gạch dưới",
                success: false
            });
        }

        // Kiểm tra loại giảm giá có hợp lệ không
        if (loai_giam_gia !== 'phần trăm' && loai_giam_gia !== 'tiền') {
            return res.status(400).json({
                message: "Loại giảm giá không hợp lệ. Chỉ chấp nhận: 'phần trăm' hoặc 'tiền'",
                success: false
            });
        }

        // Kiểm tra giá trị giảm giá có hợp lệ không
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

        // Kiểm tra đơn hàng tối thiểu
        let donHangToiThieuValue = 0;
        if (don_hang_toi_thieu !== undefined && don_hang_toi_thieu !== null && don_hang_toi_thieu !== '') {
            donHangToiThieuValue = parseFloat(don_hang_toi_thieu);
            if (isNaN(donHangToiThieuValue) || donHangToiThieuValue < 0) {
                return res.status(400).json({
                    message: "Đơn hàng tối thiểu phải là số lớn hơn hoặc bằng 0",
                    success: false
                });
            }
        }

        // Kiểm tra giảm tối đa
        let giamToiDaValue = null;
        if (giam_toi_da !== undefined && giam_toi_da !== null && giam_toi_da !== '') {
            giamToiDaValue = parseFloat(giam_toi_da);
            if (isNaN(giamToiDaValue) || giamToiDaValue <= 0) {
                return res.status(400).json({
                    message: "Giảm tối đa phải là số lớn hơn 0",
                    success: false
                });
            }
        }

        // Kiểm tra số lượng tối đa
        let soLuongToiDaValue = null;
        if (so_luong_toi_da !== undefined && so_luong_toi_da !== null && so_luong_toi_da !== '') {
            soLuongToiDaValue = parseInt(so_luong_toi_da);
            if (isNaN(soLuongToiDaValue) || soLuongToiDaValue <= 0) {
                return res.status(400).json({
                    message: "Số lượng tối đa phải là số nguyên lớn hơn 0",
                    success: false
                });
            }
        }

        // Kiểm tra số lượng tối đa phải lớn hơn số lượng đã dùng
        if (soLuongToiDaValue !== null && soLuongToiDaValue < (existing.so_luong_da_dung || 0)) {
            return res.status(400).json({
                message: "Số lượng tối đa phải lớn hơn hoặc bằng số lượng đã dùng",
                success: false
            });
        }

        // Kiểm tra ngày bắt đầu và ngày hết hạn
        let ngayBatDauValue = null;
        let ngayHetHanValue = null;

        if (ngay_bat_dau) {
            ngayBatDauValue = new Date(ngay_bat_dau);
            if (isNaN(ngayBatDauValue.getTime())) {
                return res.status(400).json({
                    message: "Ngày bắt đầu không hợp lệ",
                    success: false
                });
            }
        }

        if (ngay_het_han) {
            ngayHetHanValue = new Date(ngay_het_han);
            if (isNaN(ngayHetHanValue.getTime())) {
                return res.status(400).json({
                    message: "Ngày hết hạn không hợp lệ",
                    success: false
                });
            }
        }

        // Kiểm tra ngày bắt đầu phải trước ngày hết hạn
        if (ngayBatDauValue && ngayHetHanValue && ngayBatDauValue > ngayHetHanValue) {
            return res.status(400).json({
                message: "Ngày bắt đầu phải trước ngày hết hạn",
                success: false
            });
        }

        // Chuyển đổi trang_thai sang boolean
        let trangThaiValue = true;
        if (trang_thai !== undefined && trang_thai !== null) {
            if (typeof trang_thai === 'string') {
                trangThaiValue = trang_thai === 'true' || trang_thai === '1';
            } else {
                trangThaiValue = Boolean(trang_thai);
            }
        }

        // Kiểm tra mã voucher đã tồn tại chưa (trừ voucher hiện tại)
        if (ma_voucher.trim().toUpperCase() !== existing.ma_voucher) {
            const duplicate = await prisma.voucher.findUnique({
                where: { ma_voucher: ma_voucher.trim().toUpperCase() }
            });

            if (duplicate) {
                return res.status(400).json({
                    message: "Mã voucher đã tồn tại",
                    success: false
                });
            }
        }

        // Cập nhật voucher
        const data = await prisma.voucher.update({
            where: { voucher_id: parseInt(id) },
            data: {
                ma_voucher: ma_voucher.trim().toUpperCase(),
                loai_giam_gia,
                gia_tri_giam: giaTriGiam,
                don_hang_toi_thieu: donHangToiThieuValue,
                giam_toi_da: giamToiDaValue,
                so_luong_toi_da: soLuongToiDaValue,
                ngay_bat_dau: ngayBatDauValue,
                ngay_het_han: ngayHetHanValue,
                trang_thai: trangThaiValue
            }
        });

        // Trả về dữ liệu
        return res.status(200).json({
            message: "Cập nhật voucher thành công",
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

// Xóa voucher
export const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        // Kiểm tra voucher có tồn tại không
        const existing = await prisma.voucher.findUnique({
            where: { voucher_id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Voucher không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra voucher có đang được sử dụng trong đơn hàng không
        const donHangUsingVoucher = await prisma.donhang.findFirst({
            where: { voucher_id: parseInt(id) }
        });

        if (donHangUsingVoucher) {
            return res.status(400).json({
                message: "Không thể xóa voucher đang được sử dụng trong đơn hàng",
                success: false,
                data: null
            });
        }

        // Xóa voucher
        const data = await prisma.voucher.delete({
            where: { voucher_id: parseInt(id) }
        });

        // Trả về dữ liệu
        return res.status(200).json({
            message: "Xóa voucher thành công",
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

// Tìm kiếm voucher
export const searchVoucher = async (req, res) => {
    try {
        const { ma_voucher, trang_thai } = req.query;

        // Xây dựng điều kiện tìm kiếm
        const where = {};

        if (ma_voucher) {
            where.ma_voucher = {
                contains: ma_voucher.trim()
            };
        }

        if (trang_thai !== undefined && trang_thai !== null) {
            where.trang_thai = trang_thai === 'true' || trang_thai === '1';
        }

        // Tìm kiếm voucher
        const data = await prisma.voucher.findMany({
            where: where,
            orderBy: {
                voucher_id: 'desc'
            }
        });

        if (data.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy voucher nào",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Tìm kiếm voucher thành công",
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
