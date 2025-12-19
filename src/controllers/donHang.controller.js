import prisma from "../config/db.js"; // Import Prisma Client để thao tác với database

// Lấy tất cả đơn hàng trong hệ thống
export const getAllDonHang = async (req, res) => {
    try {
        // Query lấy tất cả đơn hàng kèm thông tin liên quan
        const data = await prisma.donhang.findMany({
            include: {
                khachhang: true,              // Thông tin khách hàng
                phuongthucthanhtoan: true,     // Phương thức thanh toán
                phuongthucvanchuyen: true,     // Phương thức vận chuyển
                voucher: true,                 // Voucher (nếu có)
                chitietdonhang: {              // Chi tiết đơn hàng (danh sách sách)
                    include: {
                        sach: true             // Thông tin sách trong đơn hàng
                    }
                },
                danhgia: true                  // Đánh giá (nếu có)
            },
            orderBy: {
                ngay_dat_hang: 'desc'          // Sắp xếp theo ngày đặt hàng giảm dần (mới nhất trước)
            }
        });

        // Kiểm tra xem có dữ liệu không
        if (!data.length) {
            return res.status(404).json({
                message: "Không có đơn hàng nào trong hệ thống",
                success: false,
                data: []
            });
        }

        // Trả về danh sách đơn hàng thành công
        return res.status(200).json({
            message: "Lấy tất cả đơn hàng thành công",
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

// Lấy thông tin chi tiết đơn hàng theo ID
export const getDonHangById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID đơn hàng từ URL params

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        // Query lấy đơn hàng theo ID kèm tất cả thông tin liên quan
        const data = await prisma.donhang.findUnique({
            where: { don_hang_id: parseInt(id) }, // Chuyển ID sang số nguyên
            include: {
                khachhang: true,              // Thông tin khách hàng
                phuongthucthanhtoan: true,     // Phương thức thanh toán
                phuongthucvanchuyen: true,     // Phương thức vận chuyển
                voucher: true,                 // Voucher (nếu có)
                chitietdonhang: {              // Chi tiết đơn hàng (danh sách sách)
                    include: {
                        sach: true             // Thông tin sách trong đơn hàng
                    }
                },
                danhgia: true                  // Đánh giá (nếu có)
            }
        });

        // Kiểm tra xem đơn hàng có tồn tại không
        if (!data) {
            return res.status(404).json({
                message: "Đơn hàng không tồn tại",
                success: false,
                data: null
            });
        }

        // Trả về thông tin đơn hàng thành công
        return res.status(200).json({
            message: "Lấy đơn hàng thành công",
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

// Tạo đơn hàng mới
export const createDonHang = async (req, res) => {
    try {
        // Lấy tất cả dữ liệu từ request body
        const {
            khach_hang_id,              // ID khách hàng (có thể null nếu mua không cần đăng nhập)
            ten_nguoi_nhan,             // Tên người nhận (bắt buộc)
            email_nguoi_nhan,            // Email người nhận (bắt buộc)
            sdt_nguoi_nhan,              // Số điện thoại người nhận (bắt buộc)
            dia_chi_giao_hang,           // Địa chỉ giao hàng (bắt buộc)
            phuong_thuc_thanh_toan_id,   // ID phương thức thanh toán (bắt buộc)
            phuong_thuc_van_chuyen_id,   // ID phương thức vận chuyển (bắt buộc)
            voucher_id,                  // ID voucher (tùy chọn)
            tam_tinh,                    // Tạm tính (có thể tính tự động)
            phi_van_chuyen,              // Phí vận chuyển (có thể lấy từ phương thức vận chuyển)
            giam_gia_voucher,           // Giảm giá từ voucher (tùy chọn)
            tong_tien,                  // Tổng tiền (có thể tính tự động)
            chi_tiet_don_hang           // Chi tiết đơn hàng - mảng các sách (bắt buộc)
        } = req.body;

        // Kiểm tra dữ liệu bắt buộc (thông tin người nhận và phương thức)
        if (!ten_nguoi_nhan || !email_nguoi_nhan || !sdt_nguoi_nhan || !dia_chi_giao_hang || !phuong_thuc_thanh_toan_id || !phuong_thuc_van_chuyen_id) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc",
                success: false,
                data: null
            });
        }

        // Kiểm tra chi tiết đơn hàng (phải là mảng và không rỗng)
        if (!chi_tiet_don_hang || !Array.isArray(chi_tiet_don_hang) || chi_tiet_don_hang.length === 0) {
            return res.status(400).json({
                message: "Chi tiết đơn hàng không được để trống",
                success: false,
                data: null
            });
        }

        // Kiểm tra khách hàng có tồn tại không (nếu có khách_hang_id)
        if (khach_hang_id) {
            const khachHang = await prisma.khachhang.findUnique({
                where: { khach_hang_id: parseInt(khach_hang_id) }
            });
            if (!khachHang) {
                return res.status(404).json({
                    message: "Khách hàng không tồn tại",
                    success: false,
                    data: null
                });
            }
        }

        // Kiểm tra phương thức thanh toán có tồn tại không
        const phuongThucThanhToan = await prisma.phuongthucthanhtoan.findUnique({
            where: { phuong_thuc_thanh_toan_id: parseInt(phuong_thuc_thanh_toan_id) }
        });
        if (!phuongThucThanhToan) {
            return res.status(404).json({
                message: "Phương thức thanh toán không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra phương thức vận chuyển có tồn tại không
        const phuongThucVanChuyen = await prisma.phuongthucvanchuyen.findUnique({
            where: { phuong_thuc_van_chuyen_id: parseInt(phuong_thuc_van_chuyen_id) }
        });
        if (!phuongThucVanChuyen) {
            return res.status(404).json({
                message: "Phương thức vận chuyển không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra voucher có tồn tại không (nếu có voucher_id)
        if (voucher_id) {
            const voucher = await prisma.voucher.findUnique({
                where: { voucher_id: parseInt(voucher_id) }
            });
            if (!voucher) {
                return res.status(404).json({
                    message: "Voucher không tồn tại",
                    success: false,
                    data: null
                });
            }
        }

        // Kiểm tra và validate từng sách trong chi tiết đơn hàng
        for (const item of chi_tiet_don_hang) {
            // Kiểm tra các trường bắt buộc của mỗi sách
            if (!item.sach_id || !item.so_luong || !item.gia_luc_mua) {
                return res.status(400).json({
                    message: "Chi tiết đơn hàng thiếu thông tin (sach_id, so_luong, gia_luc_mua)",
                    success: false,
                    data: null
                });
            }

            // Kiểm tra sách có tồn tại không
            const sach = await prisma.sach.findUnique({
                where: { sach_id: parseInt(item.sach_id) }
            });
            if (!sach) {
                return res.status(404).json({
                    message: `Sách với ID ${item.sach_id} không tồn tại`,
                    success: false,
                    data: null
                });
            }

            // Kiểm tra số lượng tồn kho có đủ không
            if (sach.so_luong < parseInt(item.so_luong)) {
                return res.status(400).json({
                    message: `Sách "${sach.ten_sach}" không đủ số lượng. Hiện tại còn ${sach.so_luong} cuốn`,
                    success: false,
                    data: null
                });
            }
        }

        // Tính toán các giá trị nếu chưa được cung cấp
        // Tạm tính = tổng giá các sách trong đơn hàng
        let tamTinhValue = parseFloat(tam_tinh) || 0;
        if (tamTinhValue === 0) {
            // Tính từ chi tiết đơn hàng (giá lúc mua * số lượng)
            tamTinhValue = chi_tiet_don_hang.reduce((sum, item) => {
                return sum + (parseFloat(item.gia_luc_mua) * parseInt(item.so_luong));
            }, 0);
        }

        // Phí vận chuyển (chỉ lấy từ request, không dùng phi_co_ban cứng nữa)
        // Nếu có phi_van_chuyen từ request thì dùng, không có thì = 0
        let phiVanChuyenValue = phi_van_chuyen !== null && phi_van_chuyen !== undefined
            ? parseFloat(phi_van_chuyen)
            : 0;

        // Giảm giá từ voucher (mặc định 0 nếu không có)
        let giamGiaVoucherValue = parseFloat(giam_gia_voucher) || 0;

        // Tổng tiền = tạm tính + phí vận chuyển - giảm giá voucher
        let tongTienValue = parseFloat(tong_tien) || 0;
        if (tongTienValue === 0) {
            tongTienValue = tamTinhValue + phiVanChuyenValue - giamGiaVoucherValue;
        }

        // Tạo mã đơn hàng duy nhất (DH + timestamp + random string)
        const maDonHang = `DH${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Xác định trạng thái đơn hàng ban đầu
        // Nếu là chuyển khoản thì đặt "Đã xác nhận", VNPay thì "Chờ thanh toán", ngược lại "Chờ xác nhận"
        let trangThaiBanDau = "Chờ xác nhận";
        const tenPhuongThucThanhToan = phuongThucThanhToan.ten_phuong_thuc?.toLowerCase() || "";
        if (tenPhuongThucThanhToan.includes('chuyển khoản') || tenPhuongThucThanhToan.includes('chuyen khoan') || tenPhuongThucThanhToan.includes('bank')) {
            trangThaiBanDau = "Đã xác nhận";
        } else if (tenPhuongThucThanhToan.includes('vnpay')) {
            trangThaiBanDau = "Chờ thanh toán";
        }

        // Tạo đơn hàng mới trong database
        const donHang = await prisma.donhang.create({
            data: {
                ma_don_hang: maDonHang,
                ten_nguoi_nhan: ten_nguoi_nhan,
                email_nguoi_nhan: email_nguoi_nhan || null,
                sdt_nguoi_nhan: sdt_nguoi_nhan,
                dia_chi_giao_hang: dia_chi_giao_hang,
                tam_tinh: tamTinhValue,
                phi_van_chuyen: phiVanChuyenValue,
                giam_gia_voucher: giamGiaVoucherValue,
                tong_tien: tongTienValue,
                trang_thai: trangThaiBanDau,
                khach_hang_id: khach_hang_id ? parseInt(khach_hang_id) : null,
                phuong_thuc_thanh_toan_id: parseInt(phuong_thuc_thanh_toan_id),
                phuong_thuc_van_chuyen_id: parseInt(phuong_thuc_van_chuyen_id),
                voucher_id: voucher_id ? parseInt(voucher_id) : null,
                ngay_dat_hang: new Date(),
                ngay_cap_nhat: new Date()
            }
        });

        // Tạo chi tiết đơn hàng (tạo nhiều record cùng lúc bằng Promise.all)
        const chiTietDonHangData = await Promise.all(
            chi_tiet_don_hang.map(item =>
                prisma.chitietdonhang.create({
                    data: {
                        don_hang_id: donHang.don_hang_id,        // ID đơn hàng vừa tạo
                        sach_id: parseInt(item.sach_id),          // ID sách
                        so_luong: parseInt(item.so_luong),      // Số lượng mua
                        gia_luc_mua: parseFloat(item.gia_luc_mua) // Giá lúc mua (lưu để không bị thay đổi)
                    }
                })
            )
        );

        // Lấy lại đơn hàng với đầy đủ thông tin (bao gồm chi tiết vừa tạo)
        const data = await prisma.donhang.findUnique({
            where: { don_hang_id: donHang.don_hang_id },
            include: {
                khachhang: true,
                phuongthucthanhtoan: true,
                phuongthucvanchuyen: true,
                voucher: true,
                chitietdonhang: {
                    include: {
                        sach: true
                    }
                },
                danhgia: true
            }
        });

        return res.status(201).json({
            message: "Tạo đơn hàng thành công",
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

// Cập nhật đơn hàng
export const updateDonHang = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            ten_nguoi_nhan,
            email_nguoi_nhan,
            sdt_nguoi_nhan,
            dia_chi_giao_hang,
            phuong_thuc_thanh_toan_id,
            phuong_thuc_van_chuyen_id,
            voucher_id,
            tam_tinh,
            phi_van_chuyen,
            giam_gia_voucher,
            tong_tien,
            trang_thai
        } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        //Kiểm tra đơn hàng có tồn tại không
        const donHang = await prisma.donhang.findUnique({
            where: { don_hang_id: parseInt(id) }
        });
        if (!donHang) {
            return res.status(404).json({
                message: "Đơn hàng không tồn tại",
                success: false,
                data: null
            });
        }

        // Chuẩn bị data để update
        const updateData = {
            ngay_cap_nhat: new Date()
        };

        if (ten_nguoi_nhan) updateData.ten_nguoi_nhan = ten_nguoi_nhan;
        if (email_nguoi_nhan !== undefined) updateData.email_nguoi_nhan = email_nguoi_nhan;
        if (sdt_nguoi_nhan) updateData.sdt_nguoi_nhan = sdt_nguoi_nhan;
        if (dia_chi_giao_hang) updateData.dia_chi_giao_hang = dia_chi_giao_hang;
        if (tam_tinh !== undefined) updateData.tam_tinh = parseFloat(tam_tinh);
        if (phi_van_chuyen !== undefined) updateData.phi_van_chuyen = parseFloat(phi_van_chuyen);
        if (giam_gia_voucher !== undefined) updateData.giam_gia_voucher = parseFloat(giam_gia_voucher);
        if (tong_tien !== undefined) updateData.tong_tien = parseFloat(tong_tien);
        if (trang_thai) updateData.trang_thai = trang_thai;

        //Kiểm tra phương thức thanh toán có tồn tại không (nếu có update)
        if (phuong_thuc_thanh_toan_id) {
            const phuongThucThanhToan = await prisma.phuongthucthanhtoan.findUnique({
                where: { phuong_thuc_thanh_toan_id: parseInt(phuong_thuc_thanh_toan_id) }
            });
            if (!phuongThucThanhToan) {
                return res.status(404).json({
                    message: "Phương thức thanh toán không tồn tại",
                    success: false,
                    data: null
                });
            }
            updateData.phuong_thuc_thanh_toan_id = parseInt(phuong_thuc_thanh_toan_id);
        }

        //Kiểm tra phương thức vận chuyển có tồn tại không (nếu có update)
        if (phuong_thuc_van_chuyen_id) {
            const phuongThucVanChuyen = await prisma.phuongthucvanchuyen.findUnique({
                where: { phuong_thuc_van_chuyen_id: parseInt(phuong_thuc_van_chuyen_id) }
            });
            if (!phuongThucVanChuyen) {
                return res.status(404).json({
                    message: "Phương thức vận chuyển không tồn tại",
                    success: false,
                    data: null
                });
            }
            updateData.phuong_thuc_van_chuyen_id = parseInt(phuong_thuc_van_chuyen_id);
        }

        //Kiểm tra voucher có tồn tại không (nếu có update)
        if (voucher_id !== undefined) {
            if (voucher_id) {
                const voucher = await prisma.voucher.findUnique({
                    where: { voucher_id: parseInt(voucher_id) }
                });
                if (!voucher) {
                    return res.status(404).json({
                        message: "Voucher không tồn tại",
                        success: false,
                        data: null
                    });
                }
                updateData.voucher_id = parseInt(voucher_id);
            } else {
                updateData.voucher_id = null;
            }
        }

        //Cập nhật đơn hàng
        const data = await prisma.donhang.update({
            where: { don_hang_id: parseInt(id) },
            data: updateData,
            include: {
                khachhang: true,
                phuongthucthanhtoan: true,
                phuongthucvanchuyen: true,
                voucher: true,
                chitietdonhang: {
                    include: {
                        sach: true
                    }
                },
                danhgia: true
            }
        });

        return res.status(200).json({
            message: "Cập nhật đơn hàng thành công",
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

// Xóa đơn hàng
export const deleteDonHang = async (req, res) => {
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

        //Kiểm tra đơn hàng có tồn tại không
        const donHang = await prisma.donhang.findUnique({
            where: { don_hang_id: parseInt(id) }
        });
        if (!donHang) {
            return res.status(404).json({
                message: "Đơn hàng không tồn tại",
                success: false,
                data: null
            });
        }

        //Xóa đơn hàng
        const data = await prisma.donhang.delete({
            where: { don_hang_id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Xóa đơn hàng thành công",
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

// Hủy đơn hàng 
export const cancelDonHang = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id; // Lấy ID user từ middleware authenticateUser

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false,
                data: null
            });
        }

        // Kiểm tra user đã đăng nhập chưa
        if (!userId) {
            return res.status(401).json({
                message: "Bạn cần đăng nhập để hủy đơn hàng",
                success: false,
                data: null
            });
        }

        // Kiểm tra đơn hàng có tồn tại không
        const donHang = await prisma.donhang.findUnique({
            where: { don_hang_id: parseInt(id) },
            include: {
                khachhang: true
            }
        });

        if (!donHang) {
            return res.status(404).json({
                message: "Đơn hàng không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra user có phải chủ sở hữu đơn hàng không
        if (donHang.khach_hang_id !== parseInt(userId)) {
            return res.status(403).json({
                message: "Bạn không có quyền hủy đơn hàng này",
                success: false,
                data: null
            });
        }

        // Kiểm tra trạng thái đơn hàng - chỉ cho phép hủy khi đơn hàng chưa được giao và chưa vận chuyển
        const allowedStatuses = ["Chờ xác nhận", "Chờ thanh toán", "Đã xác nhận"];
        const blockedStatuses = ["Đang giao hàng", "Đang vận chuyển"];

        // Kiểm tra nếu đơn hàng đang trong quá trình vận chuyển
        if (blockedStatuses.includes(donHang.trang_thai)) {
            return res.status(400).json({
                message: `Không thể hủy đơn hàng khi đang trong quá trình vận chuyển. Trạng thái hiện tại: "${donHang.trang_thai}"`,
                success: false,
                data: null
            });
        }

        // Kiểm tra nếu trạng thái không nằm trong danh sách được phép hủy
        if (!allowedStatuses.includes(donHang.trang_thai)) {
            return res.status(400).json({
                message: `Không thể hủy đơn hàng ở trạng thái "${donHang.trang_thai}". Chỉ có thể hủy khi đơn hàng ở trạng thái: ${allowedStatuses.join(", ")}`,
                success: false,
                data: null
            });
        }

        // Cập nhật trạng thái đơn hàng thành "Đã hủy"
        const data = await prisma.donhang.update({
            where: { don_hang_id: parseInt(id) },
            data: {
                trang_thai: "Đã hủy",
                ngay_cap_nhat: new Date()
            },
            include: {
                khachhang: true,
                phuongthucthanhtoan: true,
                phuongthucvanchuyen: true,
                voucher: true,
                chitietdonhang: {
                    include: {
                        sach: true
                    }
                },
                danhgia: true
            }
        });

        return res.status(200).json({
            message: "Hủy đơn hàng thành công",
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