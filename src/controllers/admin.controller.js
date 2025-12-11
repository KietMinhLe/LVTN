import prisma from "../config/db.js"; // Import Prisma Client
import bcrypt from "bcrypt";          // Dùng để so sánh mật khẩu băm
import jwt from "jsonwebtoken";       // Dùng để tạo và xác thực token JWT


export const loginAdmin = async (req, res) => {
    try {
        // Dữ liệu đầu vào
        const { email, mat_khau } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!email || !mat_khau) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin",
                success: false
            });
        }

        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Email không hợp lệ",
                success: false
            });
        }

        // Validation password length
        if (mat_khau.length < 6) {
            return res.status(400).json({
                message: "Mật khẩu phải có ít nhất 6 ký tự",
                success: false
            });
        }

        // Tìm quản trị viên bằng email
        const admin = await prisma.quantrivien.findUnique({
            where: { email }
        });

        // Kiểm tra admin có tồn tại trong DB không
        if (!admin) {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không chính xác",
                success: false
            });
        }

        // Kiểm tra trạng thái tài khoản
        if (admin.trang_thai !== true) {
            return res.status(401).json({
                message: "Tài khoản đã bị khóa",
                success: false
            });
        }

        // So sánh mật khẩu
        const passwordString = String(mat_khau);
        const isMatch = await bcrypt.compare(passwordString, admin.mat_khau_bam);

        // Kiểm tra mật khẩu có khớp không
        if (!isMatch) {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không chính xác",
                success: false
            });
        }

        // Tạo token JWT
        const token = jwt.sign(
            {
                id: admin.admin_id,
                username: admin.ten_dang_nhap,
                email: admin.email,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Trả kết quả đăng nhập
        res.json({
            message: "Đăng nhập thành công",
            success: true,
            token,
            admin: {
                id: admin.admin_id,
                ten_dang_nhap: admin.ten_dang_nhap,
                ten_hien_thi: admin.ten_hien_thi,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error("Lỗi đăng nhập admin:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Xác thực token JWT
export const verifyAdminToken = async (req, res) => {
    try {
        // Lấy admin từ middleware sau khi xác thực JWT
        const admin = req.admin;

        if (!admin || !admin.id) {
            return res.status(401).json({
                message: "Token không hợp lệ",
                success: false
            });
        }

        // Kiểm tra admin có tồn tại trong DB không
        const adminData = await prisma.quantrivien.findUnique({
            where: { admin_id: admin.id },
            select: {
                admin_id: true,
                ten_dang_nhap: true,
                ten_hien_thi: true,
                email: true,
                trang_thai: true
            }
        });

        if (!adminData) {
            return res.status(401).json({
                message: "Admin không tồn tại",
                success: false
            });
        }

        if (adminData.trang_thai !== true) {
            return res.status(401).json({
                message: "Tài khoản admin đã bị khóa",
                success: false
            });
        }

        // Token hợp lệ
        res.json({
            message: "Token hợp lệ",
            success: true,
            admin: {
                id: adminData.admin_id,
                ten_dang_nhap: adminData.ten_dang_nhap,
                ten_hien_thi: adminData.ten_hien_thi,
                email: adminData.email,
            }
        });
    } catch (error) {
        console.error("Lỗi xác thực token admin:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const logoutAdmin = async (req, res) => {
    try {
        // Không cần xử lý server-side (JWT không lưu trạng thái)
        // Client chỉ cần xóa token trong localStorage / cookie
        res.json({
            message: "Đăng xuất thành công",
            success: true
        });
    } catch (error) {
        console.error("Lỗi đăng xuất admin:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const getCurrentAdmin = async (req, res) => {
    try {
        const admin = req.admin; // Lấy từ middleware sau khi xác thực JWT

        if (!admin || !admin.id) {
            return res.status(401).json({
                message: "Token không hợp lệ",
                success: false
            });
        }

        // Lấy thông tin từ DB
        const adminData = await prisma.quantrivien.findUnique({
            where: { admin_id: admin.id },
            select: {
                admin_id: true,
                ten_dang_nhap: true,
                ten_hien_thi: true,
                email: true,
                ngay_tao: true,
                trang_thai: true
            }
        });

        if (!adminData) {
            return res.status(404).json({
                message: "Admin không tồn tại",
                success: false
            });
        }

        // Kiểm tra trạng thái tài khoản
        if (adminData.trang_thai !== true) {
            return res.status(401).json({
                message: "Tài khoản admin đã bị khóa",
                success: false
            });
        }

        res.json({
            message: "Lấy thông tin admin thành công",
            success: true,
            admin: {
                id: adminData.admin_id,
                ten_dang_nhap: adminData.ten_dang_nhap,
                ten_hien_thi: adminData.ten_hien_thi,
                email: adminData.email,
                ngay_tao: adminData.ngay_tao
            }
        });
    } catch (error) {
        console.error("Lỗi lấy thông tin admin:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Lấy thống kê dashboard
export const getDashboardStats = async (req, res) => {
    try {
        // Lấy tổng số sách
        const totalSach = await prisma.sach.count({
            where: {
                trang_thai: true
            }
        });

        // Lấy tổng số đơn hàng
        const totalDonHang = await prisma.donhang.count();

        // Lấy tổng số khách hàng
        const totalKhachHang = await prisma.khachhang.count({
            where: {
                trang_thai: true
            }
        });

        // Tính tổng doanh thu từ các đơn hàng đã hoàn thành
        const donHangDaHoanThanh = await prisma.donhang.findMany({
            where: {
                trang_thai: {
                    in: ['Đã giao hàng', 'Hoàn thành', 'Đã xác nhận']
                }
            },
            select: {
                tong_tien: true
            }
        });

        // Tính tổng doanh thu
        let totalDoanhThu = 0;
        donHangDaHoanThanh.forEach((donHang) => {
            totalDoanhThu += Number(donHang.tong_tien) || 0;
        });

        // Tính phần trăm thay đổi (tạm thời dùng giá trị cố định, có thể tính từ dữ liệu tháng trước)
        const stats = {
            totalSach,
            totalDonHang,
            totalKhachHang,
            totalDoanhThu,
            changeSach: '+0%',
            changeDonHang: '+0%',
            changeKhachHang: '+0%',
            changeDoanhThu: '+0%'
        };

        res.json({
            message: "Lấy thống kê thành công",
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};