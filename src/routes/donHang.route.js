import express from 'express';
import { getAllDonHang, getDonHangById, createDonHang, updateDonHang, deleteDonHang, cancelDonHang } from '../controllers/donHang.controller.js';
import { authenticateUser } from '../middleware/auth.js';

const donHangRouter = express.Router();


donHangRouter.get("/", getAllDonHang);
donHangRouter.get("/:id", getDonHangById);
donHangRouter.post("/", createDonHang);
donHangRouter.put("/:id", updateDonHang);
donHangRouter.delete("/:id", deleteDonHang);

// Route hủy đơn hàng (chỉ user đã đăng nhập)
donHangRouter.patch("/:id/cancel", authenticateUser, cancelDonHang);

export default donHangRouter;