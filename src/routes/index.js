import adminRoutes from "./admin.route.js";
import danhMucRouter from "./danhMuc.route.js";
import danhMucChaRouter from "./danhMucCha.route.js";
import nhaCungCapRouter from "./nhaCungCap.route.js";
import nhaXuatBanRouter from "./nhaXuatBan.route.js";
import sachRouter from "./sach.route.js";
import sachDanhMucRouter from "./sach_danhMuc.route.js";
import tacGiaRouter from "./tacGia.route.js";
import thuongHieuRouter from "./thuongHieu.route.js";
import khachHangRouter from "./khachHang.route.js";
import soDiaChiRouter from "./soDiaChi.route.js";
import gioHangRouter from "./gioHang.route.js";
import chiTietGioHangRouter from "./chiTietGioHang.route.js";
import khuyenMaiRouter from "./khuyenMai.route.js";
import sachKhuyenMaiRouter from "./sach_KhuyenMai.route.js";
import donHangRouter from "./donHang.route.js";
import phuongThucThanhToanRouter from "./phuongThucThanhToan.route.js";
import phuongThucGiaoHangRouter from "./phuongThucGiaoHang.route.js";
import voucherRouter from "./voucher.route.js";
import doTuoiRouter from "./doTuoi.route.js";
import ngonNguRouter from "./ngonNgu.route.js";
import nguoiBienDichRouter from "./nguoiBienDich.route.js";
import chiTietSachRouter from "./chiTietSach.route.js";
import anhSachRouter from "./anhSach.route.js";
import vnpayRouter from "./vnpay.route.js";
import sepayRouter from "./sepay.route.js";
import { sepayWebhook } from "../controllers/sepay.controller.js";
import shippingRouter from "./shipping.route.js";
import openaiRouter from "./openai.route.js";
import danhGiaRouter from "./danhGia.route.js";


const Routes = (app) => {
    // Route IPN cho SePay ở root level TRƯỚC các route khác để match với ngrok URL
    app.post("/ipn", sepayWebhook);
    
    // API routes
    app.use("/admin", adminRoutes);
    app.use("/khachhang", khachHangRouter);
    app.use("/danhmuccha", danhMucChaRouter);
    app.use("/danhmuc", danhMucRouter);
    app.use("/sach", sachRouter);
    app.use("/sachdanhmuc", sachDanhMucRouter);
    app.use("/nhacungcap", nhaCungCapRouter);
    app.use("/nhaxuatban", nhaXuatBanRouter);
    app.use("/thuonghieu", thuongHieuRouter);
    app.use("/tacgia", tacGiaRouter);
    app.use("/sodiachi", soDiaChiRouter);
    app.use("/giohang", gioHangRouter);
    app.use("/chitietgiohang", chiTietGioHangRouter);
    app.use("/khuyenmai", khuyenMaiRouter);
    app.use("/sachkhuyenmai", sachKhuyenMaiRouter);
    app.use("/donhang", donHangRouter);
    app.use("/phuongthucthanhtoan", phuongThucThanhToanRouter);
    app.use("/phuongthucgiaohang", phuongThucGiaoHangRouter);
    app.use("/voucher", voucherRouter);
    app.use("/dotuoi", doTuoiRouter);
    app.use("/ngonngu", ngonNguRouter);
    app.use("/nguoibiendich", nguoiBienDichRouter);
    app.use("/chitiet", chiTietSachRouter);
    app.use("/anhsach", anhSachRouter);
    app.use("/vnpay", vnpayRouter);
    app.use("/sepay", sepayRouter);
    app.use("/shipping", shippingRouter);
    app.use("/openai", openaiRouter);
    app.use("/danhgia", danhGiaRouter);
    
    // 404 handler cho các route không tồn tại
    app.use((req, res) => {
        // Chỉ trả về JSON cho API routes, không phải static files
        if (!req.path.startsWith('/uploads') && !req.path.startsWith('/favicon.ico')) {
            res.status(404).json({
                success: false,
                message: "Route not found",
                method: req.method,
                path: req.path,
                url: req.url
            });
        } else {
            res.status(404).send('Not Found');
        }
    });
}

export default Routes;