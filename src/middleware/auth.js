import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

// Middleware xác thực JWT cho admin
export const authenticateAdmin = (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        const token = req.header("Authorization")?.replace("Bearer ", "");

        // Kiểm tra token có tồn tại không
        if (!token) {
            return res.status(401).json({ message: "Không có token xác thực" });
        }

        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã token
        req.admin = decoded; // Lưu decoded vào req.admin
        next(); // Tiếp tục middleware
    } catch (error) {
        // Kiểm tra lỗi nếu token đã hết hạn
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token đã hết hạn" }); // Trả về lỗi nếu token đã hết hạn
        }
        // Kiểm tra lỗi JsonWebTokenError
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token không hợp lệ" }); // Trả về lỗi nếu token không hợp lệ
        }
        // Trả về lỗi
        return res.status(500).json({ message: "Lỗi xác thực token" }); // Trả về lỗi nếu có lỗi khác
    }
};

// Middleware xác thực JWT cho user thường (nếu cần)
export const authenticateUser = async (req, res, next) => {
    try {
        // Lấy token từ header Authorization (thử nhiều cách)
        let token = req.header("Authorization") || req.header("authorization");

        // Nếu không có, thử lấy từ req.headers
        if (!token && req.headers.authorization) {
            token = req.headers.authorization; // Lấy token từ req.headers
        }

        // Loại bỏ "Bearer " prefix nếu có
        if (token) {
            token = token.replace("Bearer ", "").replace("bearer ", "").trim();
        }

        // Kiểm tra token có tồn tại không
        if (!token || token === 'null' || token === 'undefined') {
            console.error("authenticateUser: No token provided", {
                hasAuthHeader: !!req.header("Authorization"),
                hasAuthHeaderLower: !!req.header("authorization"),
                headersKeys: Object.keys(req.headers)
            });
            return res.status(401).json({
                message: "Không có token xác thực",
                success: false
            });
        }

        // Kiểm tra JWT_SECRET có tồn tại không
        if (!process.env.JWT_SECRET) {
            console.error("authenticateUser: JWT_SECRET is not set in environment variables");
            return res.status(500).json({
                message: "Lỗi cấu hình server",
                success: false
            });
        }

        // Giải mã token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (verifyError) {
            console.error("authenticateUser: Token verification failed", {
                errorName: verifyError.name,
                errorMessage: verifyError.message,
                tokenPreview: token.substring(0, 20) + "..."
            });
            throw verifyError; // Re-throw để xử lý ở catch block bên dưới
        }

        // Log để debug
        console.log("authenticateUser: Token decoded successfully", {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            hasId: !!decoded.id,
            idType: typeof decoded.id,
            allKeys: Object.keys(decoded)
        });

        // Kiểm tra decoded có id không
        if (!decoded) {
            console.error("authenticateUser: Decoded token là null hoặc undefined");
            return res.status(401).json({
                message: "Token không hợp lệ - không thể giải mã",
                success: false
            });
        }

        if (!decoded.id) {
            console.error("authenticateUser: Decoded token thiếu id", {
                decoded: decoded,
                keys: Object.keys(decoded)
            });
            return res.status(401).json({
                message: "Token không hợp lệ - thiếu id khách hàng. Vui lòng đăng nhập lại.",
                success: false
            });
        }

        // Kiểm tra trạng thái tài khoản khách hàng (chỉ kiểm tra nếu role là 'customer')
        if (decoded.role === 'customer') {
            try {
                const khachHang = await prisma.khachhang.findUnique({
                    where: { khach_hang_id: decoded.id },
                    select: { trang_thai: true }
                });

                if (!khachHang) {
                    return res.status(401).json({
                        message: "Khách hàng không tồn tại",
                        success: false
                    });
                }

                if (khachHang.trang_thai !== true) {
                    return res.status(403).json({
                        message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
                        success: false,
                        code: "ACCOUNT_LOCKED"
                    });
                }
            } catch (dbError) {
                console.error("authenticateUser: Database error checking account status", dbError);
                // Không chặn request nếu có lỗi database, để tránh làm gián đoạn hệ thống
                // Chỉ log lỗi và tiếp tục
            }
        }

        req.user = decoded; // Lưu decoded vào req.user
        next(); // Tiếp tục middleware
    } catch (error) {
        // Kiểm tra lỗi
        if (error.name === "TokenExpiredError") {
            console.error("authenticateUser: Token expired");
            return res.status(401).json({
                message: "Token đã hết hạn. Vui lòng đăng nhập lại.",
                success: false
            });
        }
        // Kiểm tra lỗi JsonWebTokenError
        if (error.name === "JsonWebTokenError") {
            console.error("authenticateUser: Invalid token", error.message);
            return res.status(401).json({
                message: "Token không hợp lệ",
                success: false
            });
        }
        // Trả về lỗi
        console.error("authenticateUser: Unexpected error", error);
        return res.status(500).json({
            message: "Lỗi xác thực token",
            success: false
        });
    }
};
