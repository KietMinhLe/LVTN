import express from "express";
import {
    registerKhachHang,
    loginKhachHang,
    verifyKhachHangToken,
    logoutKhachHang,
    getCurrentKhachHang,
    getAllKhachHang,
    getKhachHangById,
    searchKhachHang,
    sortKhachHang,
    updateKhachHang,
    updateMyProfile,
    changePassword,
    toggleKhachHangStatus,
    deleteKhachHang,
    forgotPassword,
    resetPassword
} from "../controllers/khachHang.controller.js";
import { authenticateUser } from "../middleware/auth.js";
import { authenticateAdmin } from "../middleware/auth.js";

const khachHangRouter = express.Router();

// ============ PUBLIC ROUTES (không cần xác thực) ============
khachHangRouter.post("/register", registerKhachHang);
khachHangRouter.post("/login", loginKhachHang);
khachHangRouter.post("/forgot-password", forgotPassword);
khachHangRouter.post("/reset-password", resetPassword);

// ============ ADMIN/PUBLIC ROUTES (không cần xác thực) - ĐẶT TRƯỚC route động ============
// QUAN TRỌNG: Đặt các route cụ thể TRƯỚC route động /:id để tránh conflict
khachHangRouter.get("/", getAllKhachHang); // Lấy tất cả khách hàng (có phân trang)
khachHangRouter.get("/search", searchKhachHang); // Tìm kiếm khách hàng
khachHangRouter.get("/sort", sortKhachHang); // Sắp xếp khách hàng

// ============ CUSTOMER ROUTES (cần xác thực customer) - ĐẶT TRƯỚC route động ============
// QUAN TRỌNG: Đặt các route cụ thể TRƯỚC route động /:id để tránh conflict
khachHangRouter.use(authenticateUser);

// Protected routes cho khách hàng (đặt các route cụ thể trước route động)
khachHangRouter.get("/verify", verifyKhachHangToken);
khachHangRouter.post("/logout", logoutKhachHang);
khachHangRouter.get("/profile", getCurrentKhachHang);
khachHangRouter.put("/profile", updateMyProfile); // Cập nhật profile của chính mình
khachHangRouter.put("/change-password", changePassword); // Đổi mật khẩu

// ============ ADMIN ROUTES (có thể cần xác thực admin) ============
// Route động phải đặt CUỐI CÙNG
khachHangRouter.get("/:id", getKhachHangById); // Lấy khách hàng theo ID
khachHangRouter.put("/:id", updateKhachHang); // Cập nhật khách hàng (admin)
khachHangRouter.patch("/:id/toggle-status", toggleKhachHangStatus); // Khóa/mở khóa khách hàng
khachHangRouter.delete("/:id", deleteKhachHang); // Xóa khách hàng (soft delete)



export default khachHangRouter;

