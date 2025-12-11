import prisma from "../config/db.js";

//Lấy tất cả chi tiết sách
export const getAllChiTietSach = async (req, res) => {
    try {
        const data = await prisma.chitietsach.findMany();

        //Kiểm tra xem có dữ liệu không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có chi tiết sách nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Lấy tất cả chi tiết sách thành công",
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

//Lấy chi tiết sách theo ID
export const getChiTietSachById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        // Lấy chi tiết sách theo ID
        const data = await prisma.chitietsach.findUnique({
            where: { chi_tiet_sach_id: parseInt(id) }
        });

        //Kiểm tra xem có dữ liệu không
        if (!data) {
            return res.status(404).json({
                message: "Không có chi tiết sách nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Lấy chi tiết sách thành công",
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

//Tạo chi tiết sách
export const createChiTietSach = async (req, res) => {
    try {
        const { sach_id, tac_gia_id, nha_xuat_ban_id, thuong_hieu_id, nha_cung_cap_id, ngon_ngu_id, nguoi_bien_dich_id, do_tuoi_id, so_trang, kich_thuoc, trong_luong, mo_ta, gia_ban, gia_khuyen_mai, gia_goc, so_luong, hinh_anh, ngay_tao, ngay_cap_nhat } = req.body;

        //Kiểm tra dữ liệu bắt buộc
        if (!sach_id || !tac_gia_id || !nha_xuat_ban_id || !thuong_hieu_id || !nha_cung_cap_id || !ngon_ngu_id || !nguoi_bien_dich_id || !do_tuoi_id || !so_trang || !kich_thuoc || !trong_luong || !mo_ta || !gia_ban || !gia_khuyen_mai || !gia_goc || !so_luong || !hinh_anh || !ngay_tao || !ngay_cap_nhat) {
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

        //Kiểm tra tác giả có tồn tại không
        const existingTacGia = await prisma.tacgia.findUnique({
            where: { tac_gia_id: parseInt(tac_gia_id) }
        });

        if (!existingTacGia) {
            return res.status(404).json({
                message: "Tác giả không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra nhà xuất bản có tồn tại không
        const existingNhaXuatBan = await prisma.nhaxuatban.findUnique({
            where: { nha_xuat_ban_id: parseInt(nha_xuat_ban_id) }
        });

        if (!existingNhaXuatBan) {
            return res.status(404).json({
                message: "Nhà xuất bản không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra thương hiệu có tồn tại không
        const existingThuongHieu = await prisma.thuonghieu.findUnique({
            where: { thuong_hieu_id: parseInt(thuong_hieu_id) }
        });

        if (!existingThuongHieu) {
            return res.status(404).json({
                message: "Thương hiệu không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra nhà cung cấp có tồn tại không
        const existingNhaCungCap = await prisma.nhacungcap.findUnique({
            where: { nha_cung_cap_id: parseInt(nha_cung_cap_id) }
        });

        if (!existingNhaCungCap) {
            return res.status(404).json({
                message: "Nhà cung cấp không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra ngôn ngữ có tồn tại không
        const existingNgonNgu = await prisma.ngonngu.findUnique({
            where: { ngon_ngu_id: parseInt(ngon_ngu_id) }
        });

        if (!existingNgonNgu) {
            return res.status(404).json({
                message: "Ngôn ngữ không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra người biên dịch có tồn tại không
        const existingNguoiBienDich = await prisma.nguoibiendich.findUnique({
            where: { nguoi_bien_dich_id: parseInt(nguoi_bien_dich_id) }
        });

        if (!existingNguoiBienDich) {
            return res.status(404).json({
                message: "Người biên dịch không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra độ tuổi có tồn tại không
        const existingDoTuoi = await prisma.dotuoi.findUnique({
            where: { do_tuoi_id: parseInt(do_tuoi_id) }
        });

        if (!existingDoTuoi) {
            return res.status(404).json({
                message: "Độ tuổi không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra số trang có đúng định dạng không
        if (so_trang === undefined || so_trang === null || so_trang === '') {
            return res.status(400).json({
                message: "Số trang không được để trống",
                success: false
            });
        }
        const parsedSoTrang = parseInt(so_trang, 10);
        if (Number.isNaN(parsedSoTrang)) {
            return res.status(400).json({
                message: "Số trang phải là số",
                success: false
            });
        }

        //Kiểm tra kích thước có đúng định dạng không
        if (kich_thuoc === undefined || kich_thuoc === null || kich_thuoc === '') {
            return res.status(400).json({
                message: "Kích thước không được để trống",
                success: false
            });
        }
        const parsedKichThuoc = parseInt(kich_thuoc, 10);
        if (Number.isNaN(parsedKichThuoc)) {
            return res.status(400).json({
                message: "Kích thước phải là số",
                success: false
            });
        }

        //Kiểm tra trong lượng có đúng định dạng không
        if (trong_luong === undefined || trong_luong === null || trong_luong === '') {
            return res.status(400).json({
                message: "Trong lượng không được để trống",
                success: false
            });
        }
        const parsedTrongLuong = parseInt(trong_luong, 10);
        if (Number.isNaN(parsedTrongLuong)) {
            return res.status(400).json({
                message: "Trong lượng phải là số",
                success: false
            });
        }

        //Kiểm tra mô tả có đúng định dạng không
        if (mo_ta === undefined || mo_ta === null || mo_ta === '') {
            return res.status(400).json({
                message: "Mô tả không được để trống",
                success: false
            });
        }

        //Kiểm tra giá bán có đúng định dạng không
        if (gia_ban === undefined || gia_ban === null || gia_ban === '') {
            return res.status(400).json({
                message: "Giá bán không được để trống",
                success: false
            });
        }
        const parsedGiaBan = parseFloat(gia_ban);
        if (Number.isNaN(parsedGiaBan)) {
            return res.status(400).json({
                message: "Giá bán phải là số",
                success: false
            });
        }

        //Kiểm tra giá khuyến mãi có đúng định dạng không
        if (gia_khuyen_mai === undefined || gia_khuyen_mai === null || gia_khuyen_mai === '') {
            return res.status(400).json({
                message: "Giá khuyến mãi không được để trống",
                success: false
            });
        }
        const parsedGiaKhuyenMai = parseFloat(gia_khuyen_mai);
        if (Number.isNaN(parsedGiaKhuyenMai)) {
            return res.status(400).json({
                message: "Giá khuyến mãi phải là số",
                success: false
            });
        }

        //Kiểm tra giá gốc có đúng định dạng không
        if (gia_goc === undefined || gia_goc === null || gia_goc === '') {
            return res.status(400).json({
                message: "Giá gốc không được để trống",
                success: false
            });
        }
        const parsedGiaGoc = parseFloat(gia_goc);
        if (Number.isNaN(parsedGiaGoc)) {
            return res.status(400).json({
                message: "Giá gốc phải là số",
                success: false
            });
        }

        //Kiểm tra số lượng có đúng định dạng không
        if (so_luong === undefined || so_luong === null || so_luong === '') {
            return res.status(400).json({
                message: "Số lượng không được để trống",
                success: false
            });
        }
        const parsedSoLuong = parseInt(so_luong, 10);
        if (Number.isNaN(parsedSoLuong)) {
            return res.status(400).json({
                message: "Số lượng phải là số",
                success: false
            });
        }

        //Kiểm tra hình ảnh có đúng định dạng không
        if (hinh_anh === undefined || hinh_anh === null || hinh_anh === '') {
            return res.status(400).json({
                message: "Hình ảnh không được để trống",
                success: false
            });
        }

        //Kiểm tra ngày tạo có đúng định dạng không
        if (ngay_tao === undefined || ngay_tao === null || ngay_tao === '') {
            return res.status(400).json({
                message: "Ngày tạo không được để trống",
                success: false
            });
        }
        const parsedNgayTao = new Date(ngay_tao);
        if (isNaN(parsedNgayTao.getTime())) {
            return res.status(400).json({
                message: "Ngày tạo không hợp lệ",
                success: false
            });
        }

        //Kiểm tra ngày cập nhật có đúng định dạng không
        let parsedNgayCapNhat = null;
        if (ngay_cap_nhat) {
            parsedNgayCapNhat = new Date(ngay_cap_nhat);
            if (isNaN(parsedNgayCapNhat.getTime())) {
                return res.status(400).json({
                    message: "Ngày cập nhật không hợp lệ",
                    success: false
                });
            }
        }

        //Tạo chi tiết sách trong DB
        const data = await prisma.chitietsach.create({
            data: { sach_id: parseInt(sach_id), tac_gia_id: parseInt(tac_gia_id), nha_xuat_ban_id: parseInt(nha_xuat_ban_id), thuong_hieu_id: parseInt(thuong_hieu_id), nha_cung_cap_id: parseInt(nha_cung_cap_id), ngon_ngu_id: parseInt(ngon_ngu_id), nguoi_bien_dich_id: parseInt(nguoi_bien_dich_id), do_tuoi_id: parseInt(do_tuoi_id), so_trang: parsedSoTrang, kich_thuoc: parsedKichThuoc, trong_luong: parsedTrongLuong, mo_ta: mo_ta, gia_ban: parsedGiaBan, gia_khuyen_mai: parsedGiaKhuyenMai, gia_goc: parsedGiaGoc, so_luong: parsedSoLuong, hinh_anh: hinh_anh, ngay_tao: parsedNgayTao, ngay_cap_nhat: parsedNgayCapNhat }
        });

        return res.status(200).json({
            message: "Tạo chi tiết sách thành công",
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

//Cập nhật chi tiết sách
export const updateChiTietSach = async (req, res) => {
    try {
        const { id } = req.params;
        const { sach_id, tac_gia_id, nha_xuat_ban_id, thuong_hieu_id, nha_cung_cap_id, ngon_ngu_id, nguoi_bien_dich_id, do_tuoi_id, so_trang, kich_thuoc, trong_luong, mo_ta, gia_ban, gia_khuyen_mai, gia_goc, so_luong, hinh_anh, ngay_tao, ngay_cap_nhat } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra chi tiết sách có tồn tại không
        const existingChiTietSach = await prisma.chitietsach.findUnique({
            where: { chi_tiet_sach_id: parseInt(id) }
        });

        if (!existingChiTietSach) {
            return res.status(404).json({
                message: "Chi tiết sách không tồn tại",
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

        //Kiểm tra tác giả có tồn tại không
        const existingTacGia = await prisma.tacgia.findUnique({
            where: { tac_gia_id: parseInt(tac_gia_id) }
        });

        if (!existingTacGia) {
            return res.status(404).json({
                message: "Tác giả không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra nhà xuất bản có tồn tại không
        const existingNhaXuatBan = await prisma.nhaxuatban.findUnique({
            where: { nha_xuat_ban_id: parseInt(nha_xuat_ban_id) }
        });

        if (!existingNhaXuatBan) {
            return res.status(404).json({
                message: "Nhà xuất bản không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra thương hiệu có tồn tại không
        const existingThuongHieu = await prisma.thuonghieu.findUnique({
            where: { thuong_hieu_id: parseInt(thuong_hieu_id) }
        });

        if (!existingThuongHieu) {
            return res.status(404).json({
                message: "Thương hiệu không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra nhà cung cấp có tồn tại không
        const existingNhaCungCap = await prisma.nhacungcap.findUnique({
            where: { nha_cung_cap_id: parseInt(nha_cung_cap_id) }
        });

        if (!existingNhaCungCap) {
            return res.status(404).json({
                message: "Nhà cung cấp không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra ngôn ngữ có tồn tại không
        const existingNgonNgu = await prisma.ngonngu.findUnique({
            where: { ngon_ngu_id: parseInt(ngon_ngu_id) }
        });

        if (!existingNgonNgu) {
            return res.status(404).json({
                message: "Ngôn ngữ không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra người biên dịch có tồn tại không
        const existingNguoiBienDich = await prisma.nguoibiendich.findUnique({
            where: { nguoi_bien_dich_id: parseInt(nguoi_bien_dich_id) }
        });

        if (!existingNguoiBienDich) {
            return res.status(404).json({
                message: "Người biên dịch không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra độ tuổi có tồn tại không
        const existingDoTuoi = await prisma.dotuoi.findUnique({
            where: { do_tuoi_id: parseInt(do_tuoi_id) }
        });

        if (!existingDoTuoi) {
            return res.status(404).json({
                message: "Độ tuổi không tồn tại",
                success: false,
                data: null
            });
        }

        //Kiểm tra số trang có đúng định dạng không
        if (so_trang === undefined || so_trang === null || so_trang === '') {
            return res.status(400).json({
                message: "Số trang không được để trống",
                success: false
            });
        }
        const parsedSoTrang = parseInt(so_trang, 10);
        if (Number.isNaN(parsedSoTrang)) {
            return res.status(400).json({
                message: "Số trang phải là số",
                success: false
            });
        }

        //Kiểm tra kích thước có đúng định dạng không
        if (kich_thuoc === undefined || kich_thuoc === null || kich_thuoc === '') {
            return res.status(400).json({
                message: "Kích thước không được để trống",
                success: false
            });
        }
        const parsedKichThuoc = parseInt(kich_thuoc, 10);
        if (Number.isNaN(parsedKichThuoc)) {
            return res.status(400).json({
                message: "Kích thước phải là số",
                success: false
            });
        }

        //Kiểm tra trong lượng có đúng định dạng không
        if (trong_luong === undefined || trong_luong === null || trong_luong === '') {
            return res.status(400).json({
                message: "Trong lượng không được để trống",
                success: false
            });
        }
        const parsedTrongLuong = parseInt(trong_luong, 10);
        if (Number.isNaN(parsedTrongLuong)) {
            return res.status(400).json({
                message: "Trong lượng phải là số",
                success: false
            });
        }

        //Kiểm tra mô tả có đúng định dạng không
        if (mo_ta === undefined || mo_ta === null || mo_ta === '') {
            return res.status(400).json({
                message: "Mô tả không được để trống",
                success: false
            });
        }

        //Kiểm tra giá bán có đúng định dạng không
        if (gia_ban === undefined || gia_ban === null || gia_ban === '') {
            return res.status(400).json({
                message: "Giá bán không được để trống",
                success: false
            });
        }
        const parsedGiaBan = parseFloat(gia_ban);
        if (Number.isNaN(parsedGiaBan)) {
            return res.status(400).json({
                message: "Giá bán phải là số",
                success: false
            });
        }

        //Kiểm tra giá khuyến mãi có đúng định dạng không
        if (gia_khuyen_mai === undefined || gia_khuyen_mai === null || gia_khuyen_mai === '') {
            return res.status(400).json({
                message: "Giá khuyến mãi không được để trống",
                success: false
            });
        }
        const parsedGiaKhuyenMai = parseFloat(gia_khuyen_mai);
        if (Number.isNaN(parsedGiaKhuyenMai)) {
            return res.status(400).json({
                message: "Giá khuyến mãi phải là số",
                success: false
            });
        }

        //Kiểm tra giá gốc có đúng định dạng không
        if (gia_goc === undefined || gia_goc === null || gia_goc === '') {
            return res.status(400).json({
                message: "Giá gốc không được để trống",
                success: false
            });
        }
        const parsedGiaGoc = parseFloat(gia_goc);
        if (Number.isNaN(parsedGiaGoc)) {
            return res.status(400).json({
                message: "Giá gốc phải là số",
                success: false
            });
        }

        //Kiểm tra số lượng có đúng định dạng không
        if (so_luong === undefined || so_luong === null || so_luong === '') {
            return res.status(400).json({
                message: "Số lượng không được để trống",
                success: false
            });
        }
        const parsedSoLuong = parseInt(so_luong, 10);
        if (Number.isNaN(parsedSoLuong)) {
            return res.status(400).json({
                message: "Số lượng phải là số",
                success: false
            });
        }

        //Kiểm tra ngày tạo có đúng định dạng không
        let parsedNgayTao = null;
        if (ngay_tao) {
            parsedNgayTao = new Date(ngay_tao);
            if (isNaN(parsedNgayTao.getTime())) {
                return res.status(400).json({
                    message: "Ngày tạo không hợp lệ",
                    success: false
                });
            }
        }

        //Kiểm tra ngày cập nhật có đúng định dạng không
        let parsedNgayCapNhat = null;
        if (ngay_cap_nhat) {
            parsedNgayCapNhat = new Date(ngay_cap_nhat);
            if (isNaN(parsedNgayCapNhat.getTime())) {
                return res.status(400).json({
                    message: "Ngày cập nhật không hợp lệ",
                    success: false
                });
            }
        }

        //Cập nhật chi tiết sách trong DB
        const data = await prisma.chitietsach.update({
            where: { chi_tiet_sach_id: parseInt(id) },
            data: { sach_id: parseInt(sach_id), tac_gia_id: parseInt(tac_gia_id), nha_xuat_ban_id: parseInt(nha_xuat_ban_id), thuong_hieu_id: parseInt(thuong_hieu_id), nha_cung_cap_id: parseInt(nha_cung_cap_id), ngon_ngu_id: parseInt(ngon_ngu_id), nguoi_bien_dich_id: parseInt(nguoi_bien_dich_id), do_tuoi_id: parseInt(do_tuoi_id), so_trang: parsedSoTrang, kich_thuoc: parsedKichThuoc, trong_luong: parsedTrongLuong, mo_ta: mo_ta, gia_ban: parsedGiaBan, gia_khuyen_mai: parsedGiaKhuyenMai, gia_goc: parsedGiaGoc, so_luong: parsedSoLuong, hinh_anh: hinh_anh, ngay_tao: parsedNgayTao, ngay_cap_nhat: parsedNgayCapNhat }
        });

        return res.status(200).json({
            message: "Cập nhật chi tiết sách thành công",
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

//Xóa chi tiết sách
export const deleteChiTietSach = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra chi tiết sách có tồn tại không
        const existingChiTietSach = await prisma.chitietsach.findUnique({
            where: { chi_tiet_sach_id: parseInt(id) }
        });

        if (!existingChiTietSach) {
            return res.status(404).json({
                message: "Chi tiết sách không tồn tại",
                success: false,
                data: null
            });
        }

        //Xóa chi tiết sách trong DB
        const data = await prisma.chitietsach.delete({
            where: { chi_tiet_sach_id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Xóa chi tiết sách thành công",
            success: true,
            data: data
        });
    } catch (error) {
        //Xử lý lỗi foreign key constraint khi xóa
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa chi tiết sách này vì đang có dữ liệu liên quan",
                success: false,
                error: error.message
            });
        }
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}