import express from "express";
import { loginAdmin, verifyAdminToken, logoutAdmin, getCurrentAdmin, getDashboardStats } from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middleware/auth.js";

const adminRouter = express.Router();

// Public routes (không cần xác thực)
adminRouter.post("/login", loginAdmin);

// Áp dụng middleware xác thực cho tất cả routes còn lại
adminRouter.use(authenticateAdmin);

// Protected routes (cần xác thực)
adminRouter.get("/verify", verifyAdminToken);
adminRouter.post("/logout", logoutAdmin);
adminRouter.get("/profile", getCurrentAdmin);
adminRouter.get("/stats", getDashboardStats);


export default adminRouter;
