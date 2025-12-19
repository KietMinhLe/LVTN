import prisma from "../config/db.js"; // Import Prisma Client để thao tác với database
import bcrypt from "bcrypt";          // Dùng để hash và so sánh mật khẩu
import jwt from "jsonwebtoken";       // Dùng để tạo và xác thực token JWT
import { sendPasswordResetEmail } from "../services/email.service.js";

// Đăng ký khách hàng mới
export const registerKhachHang = async (req, res) => {
    try {
        // Lấy dữ liệu đầu vào
        const { email, mat_khau, ho_ten, so_dien_thoai, ngay_sinh } = req.body;

        // Kiểm tra dữ liệu đầu vào bắt buộc
        if (!email || !mat_khau || !ho_ten) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin (email, mật khẩu, họ tên)",
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

        // Kiểm tra độ dài mật khẩu
        if (mat_khau.length < 6) {
            return res.status(400).json({
                message: "Mật khẩu phải có ít nhất 6 ký tự",
                success: false
            });
        }

        // Kiểm tra email đã tồn tại chưa
        const existingKhachHang = await prisma.khachhang.findUnique({
            where: { email }
        });

        if (existingKhachHang) {
            return res.status(400).json({
                message: "Email đã được sử dụng",
                success: false
            });
        }

        // Hash mật khẩu
        const saltRounds = 10;         // Số lần hash mật khẩu
        const matKhauBam = await bcrypt.hash(String(mat_khau), saltRounds); // Hash mật khẩu

        // Tạo khách hàng mới và giỏ hàng trong một transaction (transaction để đảm bảo tính nhất quán dữ liệu)
        const result = await prisma.$transaction(async (tx) => {
            // Tạo khách hàng mới
            const khachHangMoi = await tx.khachhang.create({
                data: {
                    email, // Email khách hàng
                    mat_khau: matKhauBam, // Lưu mật khẩu đã hash
                    ho_ten, // Họ tên khách hàng
                    so_dien_thoai: so_dien_thoai || null, // Số điện thoại khách hàng
                    ngay_sinh: ngay_sinh ? new Date(ngay_sinh) : null, // Ngày sinh khách hàng
                    diem_fpoint: 0, // Điểm F-point khách hàng
                    trang_thai: true // Trạng thái khách hàng
                },
                select: { // Chọn các trường cần lấy sau khi tạo khách hàng
                    khach_hang_id: true, // ID khách hàng
                    email: true, // Email khách hàng
                    ho_ten: true, // Họ tên khách hàng
                    so_dien_thoai: true, // Số điện thoại khách hàng
                    ngay_sinh: true, // Ngày sinh khách hàng
                    diem_fpoint: true, // Điểm F-point khách hàng
                    ngay_tham_gia: true // Ngày tham gia khách hàng
                }
            });

            // Kiểm tra xem khách hàng đã có giỏ hàng chưa (để tránh trùng lặp) (nếu khách hàng đã tồn tại thì không tạo giỏ hàng mới)
            const existingGioHang = await tx.giohang.findFirst({
                where: {
                    khach_hang_id: khachHangMoi.khach_hang_id // Tìm giỏ hàng theo ID khách hàng        
                }
            });

            // Chỉ tạo giỏ hàng mới nếu chưa có giỏ hàng nào
            if (!existingGioHang) {
                await tx.giohang.create({
                    data: {
                        khach_hang_id: khachHangMoi.khach_hang_id // Tạo giỏ hàng theo ID khách hàng
                    }
                });
            }

            return khachHangMoi; // Trả về khách hàng mới   
        });

        // Tạo token JWT
        const token = jwt.sign(
            {
                id: result.khach_hang_id, // ID khách hàng
                email: result.email, // Email khách hàng
                role: 'customer' // Vai trò khách hàng
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Thời gian hết hạn token (1 giờ) 
        );

        // Trả kết quả đăng ký thành công
        res.status(201).json({
            message: "Đăng ký thành công",
            success: true,
            token,
            khach_hang: {
                id: result.khach_hang_id, // ID khách hàng
                email: result.email, // Email khách hàng
                ho_ten: result.ho_ten, // Họ tên khách hàng
                so_dien_thoai: result.so_dien_thoai, // Số điện thoại khách hàng        
                ngay_sinh: result.ngay_sinh, // Ngày sinh khách hàng
                diem_fpoint: result.diem_fpoint, // Điểm F-point khách hàng
                ngay_tham_gia: result.ngay_tham_gia // Ngày tham gia khách hàng
            }
        });
    } catch (error) {
        console.error("Lỗi đăng ký khách hàng:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Đăng nhập bằng Facebook
export const loginFacebook = async (req, res) => {
    try {
        const { accessToken, userID, email, name } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!accessToken || !userID) {
            return res.status(400).json({
                message: "Thiếu thông tin xác thực Facebook",
                success: false
            });
        }

        // Xác thực token với Facebook API
        try {
            const fbResponse = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`);
            const fbData = await fbResponse.json();

            if (fbData.error) {
                return res.status(401).json({
                    message: "Token Facebook không hợp lệ",
                    success: false
                });
            }

            // Kiểm tra userID có khớp không
            if (fbData.id !== userID) {
                return res.status(401).json({
                    message: "Thông tin xác thực không khớp",
                    success: false
                });
            }

            // Tìm khách hàng theo facebook_id hoặc email
            let khachHang = await prisma.khachhang.findFirst({
                where: {
                    OR: [
                        { facebook_id: userID },
                        { email: fbData.email || email }
                    ]
                }
            });

            if (khachHang) {
                // Nếu tìm thấy khách hàng nhưng chưa có facebook_id, cập nhật
                if (!khachHang.facebook_id) {
                    khachHang = await prisma.khachhang.update({
                        where: { khach_hang_id: khachHang.khach_hang_id },
                        data: { facebook_id: userID }
                    });
                }

                // Kiểm tra trạng thái tài khoản
                if (khachHang.trang_thai !== true) {
                    return res.status(403).json({
                        message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
                        success: false,
                        code: "ACCOUNT_LOCKED"
                    });
                }
            } else {
                // Tạo khách hàng mới nếu chưa tồn tại
                // Tạo email nếu không có từ Facebook
                const customerEmail = fbData.email || email || `fb_${userID}@facebook.com`;
                const customerName = fbData.name || name || 'Người dùng Facebook';

                // Tạo mật khẩu ngẫu nhiên (khách hàng đăng nhập Facebook không cần mật khẩu)
                const randomPassword = Math.random().toString(36).slice(-12);
                const matKhauBam = await bcrypt.hash(randomPassword, 10);

                const result = await prisma.$transaction(async (tx) => {
                    // Tạo khách hàng mới
                    const khachHangMoi = await tx.khachhang.create({
                        data: {
                            email: customerEmail,
                            mat_khau: matKhauBam,
                            ho_ten: customerName,
                            facebook_id: userID,
                            diem_fpoint: 0,
                            trang_thai: true
                        }
                    });

                    // Tạo giỏ hàng cho khách hàng mới
                    await tx.giohang.create({
                        data: {
                            khach_hang_id: khachHangMoi.khach_hang_id
                        }
                    });

                    return khachHangMoi;
                });

                khachHang = result;
            }

            // Tạo token JWT
            const token = jwt.sign(
                {
                    id: khachHang.khach_hang_id,
                    email: khachHang.email,
                    role: 'customer'
                },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            // Trả kết quả đăng nhập
            res.json({
                message: "Đăng nhập Facebook thành công",
                success: true,
                token,
                khach_hang: {
                    id: khachHang.khach_hang_id,
                    email: khachHang.email,
                    ho_ten: khachHang.ho_ten,
                    so_dien_thoai: khachHang.so_dien_thoai,
                    ngay_sinh: khachHang.ngay_sinh,
                    diem_fpoint: khachHang.diem_fpoint,
                    ngay_tham_gia: khachHang.ngay_tham_gia
                }
            });
        } catch (fbError) {
            console.error("Lỗi xác thực Facebook:", fbError);
            return res.status(401).json({
                message: "Không thể xác thực với Facebook",
                success: false
            });
        }
    } catch (error) {
        console.error("Lỗi đăng nhập Facebook:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Đăng nhập khách hàng
export const loginKhachHang = async (req, res) => {
    try {
        // Lấy dữ liệu đầu vào
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

        // Kiểm tra độ dài mật khẩu
        if (mat_khau.length < 6) {
            return res.status(400).json({
                message: "Mật khẩu phải có ít nhất 6 ký tự",
                success: false
            });
        }

        // Tìm khách hàng bằng email
        const khachHang = await prisma.khachhang.findUnique({
            where: { email }
        });

        // Kiểm tra khách hàng có tồn tại trong DB không
        if (!khachHang) {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không chính xác",
                success: false
            });
        }

        // Kiểm tra trạng thái tài khoản
        if (khachHang.trang_thai !== true) {
            return res.status(403).json({
                message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
                success: false,
                code: "ACCOUNT_LOCKED"
            });
        }

        // So sánh mật khẩu
        const passwordString = String(mat_khau);
        const isMatch = await bcrypt.compare(passwordString, khachHang.mat_khau);

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
                id: khachHang.khach_hang_id,
                email: khachHang.email,
                role: 'customer'
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Trả kết quả đăng nhập
        res.json({
            message: "Đăng nhập thành công",
            success: true,
            token,
            khach_hang: {
                id: khachHang.khach_hang_id,
                email: khachHang.email,
                ho_ten: khachHang.ho_ten,
                so_dien_thoai: khachHang.so_dien_thoai,
                ngay_sinh: khachHang.ngay_sinh,
                diem_fpoint: khachHang.diem_fpoint,
                ngay_tham_gia: khachHang.ngay_tham_gia
            }
        });
    } catch (error) {
        console.error("Lỗi đăng nhập khách hàng:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Xác thực token JWT cho khách hàng
export const verifyKhachHangToken = async (req, res) => {
    try {
        // Lấy khách hàng từ middleware sau khi xác thực JWT
        const user = req.user;

        if (!user || !user.id) {
            return res.status(401).json({
                message: "Token không hợp lệ",
                success: false
            });
        }

        // Kiểm tra khách hàng có tồn tại trong DB không
        const khachHangData = await prisma.khachhang.findUnique({
            where: { khach_hang_id: user.id },
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                so_dien_thoai: true,
                ngay_sinh: true,
                diem_fpoint: true,
                ngay_tham_gia: true,
                trang_thai: true
            }
        });

        if (!khachHangData) {
            return res.status(401).json({
                message: "Khách hàng không tồn tại",
                success: false
            });
        }

        if (khachHangData.trang_thai !== true) {
            return res.status(403).json({
                message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
                success: false,
                code: "ACCOUNT_LOCKED"
            });
        }

        // Token hợp lệ
        res.json({
            message: "Token hợp lệ",
            success: true,
            khach_hang: {
                id: khachHangData.khach_hang_id,
                email: khachHangData.email,
                ho_ten: khachHangData.ho_ten,
                so_dien_thoai: khachHangData.so_dien_thoai,
                ngay_sinh: khachHangData.ngay_sinh,
                diem_fpoint: khachHangData.diem_fpoint,
                ngay_tham_gia: khachHangData.ngay_tham_gia
            }
        });
    } catch (error) {
        console.error("Lỗi xác thực token khách hàng:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Lấy thông tin khách hàng hiện tại
export const getCurrentKhachHang = async (req, res) => {
    try {
        const user = req.user; // Lấy từ middleware sau khi xác thực JWT

        if (!user || !user.id) {
            return res.status(401).json({
                message: "Token không hợp lệ",
                success: false
            });
        }

        // Lấy thông tin từ DB
        const khachHangData = await prisma.khachhang.findUnique({
            where: { khach_hang_id: user.id },
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                so_dien_thoai: true,
                ngay_sinh: true,
                diem_fpoint: true,
                ngay_tham_gia: true,
                trang_thai: true
            }
        });

        if (!khachHangData) {
            return res.status(404).json({
                message: "Khách hàng không tồn tại",
                success: false
            });
        }

        // Kiểm tra trạng thái tài khoản
        if (khachHangData.trang_thai !== true) {
            return res.status(403).json({
                message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
                success: false,
                code: "ACCOUNT_LOCKED"
            });
        }

        res.json({
            message: "Lấy thông tin khách hàng thành công",
            success: true,
            khach_hang: {
                id: khachHangData.khach_hang_id,
                email: khachHangData.email,
                ho_ten: khachHangData.ho_ten,
                so_dien_thoai: khachHangData.so_dien_thoai,
                ngay_sinh: khachHangData.ngay_sinh,
                diem_fpoint: khachHangData.diem_fpoint,
                ngay_tham_gia: khachHangData.ngay_tham_gia
            }
        });
    } catch (error) {
        console.error("Lỗi lấy thông tin khách hàng:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Đăng xuất khách hàng
export const logoutKhachHang = async (req, res) => {
    try {
        // Không cần xử lý server-side (JWT không lưu trạng thái)
        // Client chỉ cần xóa token trong localStorage / cookie
        res.json({
            message: "Đăng xuất thành công",
            success: true
        });
    } catch (error) {
        console.error("Lỗi đăng xuất khách hàng:", error);
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Lấy toàn bộ khách hàng (có phân trang)
export const getAllKhachHang = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Lấy tổng số khách hàng
        const total = await prisma.khachhang.count();

        // Lấy dữ liệu với phân trang và không trả về mật khẩu
        const data = await prisma.khachhang.findMany({
            skip: skip,
            take: limit,
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                so_dien_thoai: true,
                ngay_sinh: true,
                diem_fpoint: true,
                ngay_tham_gia: true,
                trang_thai: true
            },
            orderBy: {
                khach_hang_id: 'desc'
            }
        });

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            message: "Lấy toàn bộ khách hàng thành công",
            success: true,
            data: data,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách khách hàng:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Sắp xếp khách hàng
export const sortKhachHang = async (req, res) => {
    try {
        const { sortBy, order } = req.query;

        // Kiểm tra tham số sortBy và order có được cung cấp không
        if (!sortBy || !order) {
            return res.status(400).json({
                message: "Thiếu tham số sortBy hoặc order",
                success: false
            });
        }

        // Kiểm tra tham số sortBy có hợp lệ không (theo schema thực tế)
        const validSortFields = ['khach_hang_id', 'ho_ten', 'email', 'so_dien_thoai', 'ngay_tham_gia', 'diem_fpoint'];
        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({
                message: `Tham số sortBy không hợp lệ. Các giá trị hợp lệ: ${validSortFields.join(', ')}`,
                success: false
            });
        }

        // Kiểm tra tham số order có hợp lệ không
        if (!['asc', 'desc'].includes(order.toLowerCase())) {
            return res.status(400).json({
                message: "Tham số order không hợp lệ. Chỉ chấp nhận 'asc' hoặc 'desc'",
                success: false
            });
        }

        // Xây dựng orderBy object
        const orderBy = {};
        orderBy[sortBy] = order.toLowerCase();

        // Lấy dữ liệu với sắp xếp (không trả về mật khẩu)
        const data = await prisma.khachhang.findMany({
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                so_dien_thoai: true,
                ngay_sinh: true,
                diem_fpoint: true,
                ngay_tham_gia: true,
                trang_thai: true
            },
            orderBy: orderBy
        });

        return res.status(200).json({
            message: "Sắp xếp khách hàng thành công",
            success: true,
            data: data,
            sortBy: sortBy,
            order: order.toLowerCase()
        });
    } catch (error) {
        console.error("Lỗi sắp xếp khách hàng:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Tìm kiếm khách hàng (theo nhiều trường)
export const searchKhachHang = async (req, res) => {
    try {
        const { ho_ten, email, so_dien_thoai } = req.query;

        // Kiểm tra có ít nhất một tham số tìm kiếm
        if (!ho_ten && !email && !so_dien_thoai) {
            return res.status(400).json({
                message: "Vui lòng cung cấp ít nhất một tham số tìm kiếm (ho_ten, email, hoặc so_dien_thoai)",
                success: false
            });
        }

        // Xây dựng điều kiện tìm kiếm
        const whereClause = {};

        // Tìm kiếm theo họ tên (hỗ trợ tiếng Việt)
        if (ho_ten) {
            whereClause.ho_ten = {
                contains: ho_ten.trim()
            };
        }

        // Tìm kiếm theo email
        if (email) {
            whereClause.email = {
                contains: email.trim()
            };
        }

        // Tìm kiếm theo số điện thoại
        if (so_dien_thoai) {
            whereClause.so_dien_thoai = {
                contains: so_dien_thoai.trim()
            };
        }

        // Tìm kiếm khách hàng (không trả về mật khẩu)
        const data = await prisma.khachhang.findMany({
            where: whereClause,
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                so_dien_thoai: true,
                ngay_sinh: true,
                diem_fpoint: true,
                ngay_tham_gia: true,
                trang_thai: true
            }
        });

        if (data.length === 0) {
            return res.status(200).json({
                message: "Không tìm thấy khách hàng nào",
                success: true,
                data: []
            });
        }

        return res.status(200).json({
            message: "Tìm kiếm khách hàng thành công",
            success: true,
            data: data,
            count: data.length
        });
    } catch (error) {
        console.error("Lỗi tìm kiếm khách hàng:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}


// Lấy khách hàng theo ID
export const getKhachHangById = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có hợp lệ không
        const khachHangId = parseInt(id);
        if (isNaN(khachHangId)) {
            return res.status(400).json({
                message: "ID khách hàng không hợp lệ",
                success: false
            });
        }

        // Tìm khách hàng theo ID (không trả về mật khẩu)
        const khachHang = await prisma.khachhang.findUnique({
            where: { khach_hang_id: khachHangId },
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                so_dien_thoai: true,
                ngay_sinh: true,
                diem_fpoint: true,
                ngay_tham_gia: true,
                trang_thai: true,
                donhang: {
                    select: {
                        don_hang_id: true,
                        ma_don_hang: true,
                        tong_tien: true,
                        trang_thai: true,
                        ngay_dat_hang: true
                    },
                    orderBy: {
                        ngay_dat_hang: 'desc'
                    },
                    take: 10 // Chỉ lấy 10 đơn hàng gần nhất
                }
            }
        });

        if (!khachHang) {
            return res.status(404).json({
                message: "Không tìm thấy khách hàng",
                success: false
            });
        }

        return res.status(200).json({
            message: "Lấy thông tin khách hàng thành công",
            success: true,
            data: khachHang
        });
    } catch (error) {
        console.error("Lỗi lấy thông tin khách hàng theo ID:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Cập nhật thông tin khách hàng
export const updateKhachHang = async (req, res) => {
    try {
        const { id } = req.params;
        const { ho_ten, so_dien_thoai, ngay_sinh } = req.body;

        // Kiểm tra ID có hợp lệ không
        const khachHangId = parseInt(id);
        if (isNaN(khachHangId)) {
            return res.status(400).json({
                message: "ID khách hàng không hợp lệ",
                success: false
            });
        }

        // Kiểm tra khách hàng có tồn tại không
        const existingKhachHang = await prisma.khachhang.findUnique({
            where: { khach_hang_id: khachHangId }
        });

        if (!existingKhachHang) {
            return res.status(404).json({
                message: "Không tìm thấy khách hàng",
                success: false
            });
        }

        // Xây dựng dữ liệu cập nhật
        const updateData = {};

        if (ho_ten !== undefined) {
            if (!ho_ten || ho_ten.trim() === '') {
                return res.status(400).json({
                    message: "Họ tên không được để trống",
                    success: false
                });
            }
            updateData.ho_ten = ho_ten.trim();
        }

        if (so_dien_thoai !== undefined) {
            // Validate số điện thoại (tùy chọn, có thể để null)
            if (so_dien_thoai && so_dien_thoai.trim() !== '') {
                const phoneRegex = /^[0-9]{10,11}$/;
                if (!phoneRegex.test(so_dien_thoai.trim())) {
                    return res.status(400).json({
                        message: "Số điện thoại không hợp lệ (10-11 chữ số)",
                        success: false
                    });
                }
                updateData.so_dien_thoai = so_dien_thoai.trim();
            } else {
                updateData.so_dien_thoai = null;
            }
        }

        if (ngay_sinh !== undefined) {
            if (ngay_sinh) {
                const ngaySinhDate = new Date(ngay_sinh);
                if (isNaN(ngaySinhDate.getTime())) {
                    return res.status(400).json({
                        message: "Ngày sinh không hợp lệ",
                        success: false
                    });
                }
                // Kiểm tra ngày sinh không được là tương lai
                if (ngaySinhDate > new Date()) {
                    return res.status(400).json({
                        message: "Ngày sinh không thể là ngày tương lai",
                        success: false
                    });
                }
                updateData.ngay_sinh = ngaySinhDate;
            } else {
                updateData.ngay_sinh = null;
            }
        }

        // Nếu không có dữ liệu nào để cập nhật
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "Không có dữ liệu nào để cập nhật",
                success: false
            });
        }

        // Cập nhật thông tin khách hàng
        const updatedKhachHang = await prisma.khachhang.update({
            where: { khach_hang_id: khachHangId },
            data: updateData,
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                so_dien_thoai: true,
                ngay_sinh: true,
                diem_fpoint: true,
                ngay_tham_gia: true,
                trang_thai: true
            }
        });

        return res.status(200).json({
            message: "Cập nhật thông tin khách hàng thành công",
            success: true,
            data: updatedKhachHang
        });
    } catch (error) {
        console.error("Lỗi cập nhật thông tin khách hàng:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Cập nhật profile của chính khách hàng (từ token)
export const updateMyProfile = async (req, res) => {
    try {
        const user = req.user; // Lấy từ middleware sau khi xác thực JWT
        const { ho_ten, so_dien_thoai, ngay_sinh } = req.body;

        if (!user || !user.id) {
            return res.status(401).json({
                message: "Token không hợp lệ",
                success: false
            });
        }

        // Xây dựng dữ liệu cập nhật
        const updateData = {};

        if (ho_ten !== undefined) {
            if (!ho_ten || ho_ten.trim() === '') {
                return res.status(400).json({
                    message: "Họ tên không được để trống",
                    success: false
                });
            }
            updateData.ho_ten = ho_ten.trim();
        }

        if (so_dien_thoai !== undefined) {
            if (so_dien_thoai && so_dien_thoai.trim() !== '') {
                const phoneRegex = /^[0-9]{10,11}$/;
                if (!phoneRegex.test(so_dien_thoai.trim())) {
                    return res.status(400).json({
                        message: "Số điện thoại không hợp lệ (10-11 chữ số)",
                        success: false
                    });
                }
                updateData.so_dien_thoai = so_dien_thoai.trim();
            } else {
                updateData.so_dien_thoai = null;
            }
        }

        if (ngay_sinh !== undefined) {
            if (ngay_sinh) {
                const ngaySinhDate = new Date(ngay_sinh);
                if (isNaN(ngaySinhDate.getTime())) {
                    return res.status(400).json({
                        message: "Ngày sinh không hợp lệ",
                        success: false
                    });
                }
                if (ngaySinhDate > new Date()) {
                    return res.status(400).json({
                        message: "Ngày sinh không thể là ngày tương lai",
                        success: false
                    });
                }
                updateData.ngay_sinh = ngaySinhDate;
            } else {
                updateData.ngay_sinh = null;
            }
        }

        // Nếu không có dữ liệu nào để cập nhật
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "Không có dữ liệu nào để cập nhật",
                success: false
            });
        }

        // Cập nhật thông tin khách hàng
        const updatedKhachHang = await prisma.khachhang.update({
            where: { khach_hang_id: user.id },
            data: updateData,
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                so_dien_thoai: true,
                ngay_sinh: true,
                diem_fpoint: true,
                ngay_tham_gia: true,
                trang_thai: true
            }
        });

        return res.status(200).json({
            message: "Cập nhật thông tin cá nhân thành công",
            success: true,
            data: updatedKhachHang
        });
    } catch (error) {
        console.error("Lỗi cập nhật thông tin cá nhân:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Đổi mật khẩu
export const changePassword = async (req, res) => {
    try {
        const user = req.user; // Lấy từ middleware sau khi xác thực JWT
        const { mat_khau_cu, mat_khau_moi } = req.body;

        // Log để debug
        console.log("changePassword: Request received", {
            hasUser: !!user,
            userKeys: user ? Object.keys(user) : [],
            userId: user?.id,
            userIdType: typeof user?.id,
            email: user?.email,
            role: user?.role
        });

        // Kiểm tra user và id
        if (!user) {
            console.error("changePassword: req.user is null or undefined");
            return res.status(401).json({
                message: "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
                success: false
            });
        }

        // Kiểm tra id - có thể là id hoặc khach_hang_id
        let khachHangId = user.id || user.khach_hang_id;

        if (!khachHangId) {
            console.error("changePassword: user.id and user.khach_hang_id are both missing. User object:", JSON.stringify(user, null, 2));
            return res.status(401).json({
                message: "ID khách hàng không hợp lệ. Vui lòng đăng nhập lại.",
                success: false
            });
        }

        // Kiểm tra id có phải là số không
        khachHangId = parseInt(khachHangId);
        if (isNaN(khachHangId) || khachHangId <= 0) {
            console.error("changePassword: Invalid user.id:", user.id, "or user.khach_hang_id:", user.khach_hang_id);
            return res.status(401).json({
                message: "ID khách hàng không hợp lệ. Vui lòng đăng nhập lại.",
                success: false
            });
        }

        console.log("changePassword: Using khachHangId:", khachHangId);

        // Kiểm tra dữ liệu đầu vào - trim để loại bỏ khoảng trắng
        const matKhauCu = String(mat_khau_cu || '').trim();
        const matKhauMoi = String(mat_khau_moi || '').trim();

        console.log("changePassword: Password data received", {
            hasOldPassword: !!mat_khau_cu,
            oldPasswordLength: matKhauCu.length,
            hasNewPassword: !!mat_khau_moi,
            newPasswordLength: matKhauMoi.length
        });

        if (!matKhauCu || matKhauCu.length === 0) {
            return res.status(400).json({
                message: "Vui lòng nhập mật khẩu cũ",
                success: false
            });
        }

        if (!matKhauMoi || matKhauMoi.length === 0) {
            return res.status(400).json({
                message: "Vui lòng nhập mật khẩu mới",
                success: false
            });
        }

        // Kiểm tra độ dài mật khẩu mới
        if (matKhauMoi.length < 6) {
            return res.status(400).json({
                message: "Mật khẩu mới phải có ít nhất 6 ký tự",
                success: false
            });
        }

        // Kiểm tra mật khẩu mới và cũ không được giống nhau
        if (matKhauCu === matKhauMoi) {
            return res.status(400).json({
                message: "Mật khẩu mới không được trùng với mật khẩu cũ",
                success: false
            });
        }

        // Lấy thông tin khách hàng
        const khachHang = await prisma.khachhang.findUnique({
            where: { khach_hang_id: khachHangId }
        });

        if (!khachHang) {
            return res.status(404).json({
                message: "Không tìm thấy khách hàng",
                success: false
            });
        }

        // Kiểm tra mật khẩu cũ có đúng không
        const isMatch = await bcrypt.compare(matKhauCu, khachHang.mat_khau);
        if (!isMatch) {
            return res.status(400).json({
                message: "Mật khẩu cũ không chính xác",
                success: false
            });
        }

        // Hash mật khẩu mới
        const saltRounds = 10;
        const matKhauMoiBam = await bcrypt.hash(matKhauMoi, saltRounds);

        // Cập nhật mật khẩu
        await prisma.khachhang.update({
            where: { khach_hang_id: khachHangId },
            data: { mat_khau: matKhauMoiBam }
        });

        return res.status(200).json({
            message: "Đổi mật khẩu thành công",
            success: true
        });
    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error);
        console.error("Error stack:", error.stack);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            code: error.code
        });

        // Kiểm tra nếu là lỗi Prisma
        if (error.code === 'P2002') {
            return res.status(400).json({
                message: "Lỗi cập nhật dữ liệu",
                success: false
            });
        }

        return res.status(500).json({
            message: "Lỗi server khi đổi mật khẩu",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Khóa/Mở khóa khách hàng (admin only - cần xác thực admin)
export const toggleKhachHangStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có hợp lệ không
        const khachHangId = parseInt(id);
        if (isNaN(khachHangId)) {
            return res.status(400).json({
                message: "ID khách hàng không hợp lệ",
                success: false
            });
        }

        // Kiểm tra khách hàng có tồn tại không
        const existingKhachHang = await prisma.khachhang.findUnique({
            where: { khach_hang_id: khachHangId },
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                trang_thai: true
            }
        });

        if (!existingKhachHang) {
            return res.status(404).json({
                message: "Không tìm thấy khách hàng",
                success: false
            });
        }

        // Đảo ngược trạng thái
        const newStatus = !existingKhachHang.trang_thai;

        // Nếu đang muốn khóa tài khoản, kiểm tra xem khách hàng có đơn hàng không
        if (!newStatus) {
            const donHangCount = await prisma.donhang.count({
                where: { khach_hang_id: khachHangId }
            });

            if (donHangCount > 0) {
                return res.status(400).json({
                    message: `Không thể khóa tài khoản khách hàng này vì đang có ${donHangCount} đơn hàng. Vui lòng xử lý các đơn hàng trước khi khóa tài khoản.`,
                    success: false
                });
            }
        }

        // Cập nhật trạng thái
        const updatedKhachHang = await prisma.khachhang.update({
            where: { khach_hang_id: khachHangId },
            data: { trang_thai: newStatus },
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                trang_thai: true
            }
        });

        return res.status(200).json({
            message: newStatus ? "Mở khóa khách hàng thành công" : "Khóa khách hàng thành công",
            success: true,
            data: updatedKhachHang
        });
    } catch (error) {
        console.error("Lỗi thay đổi trạng thái khách hàng:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Xóa khách hàng (soft delete - chỉ khóa tài khoản)
export const deleteKhachHang = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có hợp lệ không
        const khachHangId = parseInt(id);
        if (isNaN(khachHangId)) {
            return res.status(400).json({
                message: "ID khách hàng không hợp lệ",
                success: false
            });
        }

        // Kiểm tra khách hàng có tồn tại không
        const existingKhachHang = await prisma.khachhang.findUnique({
            where: { khach_hang_id: khachHangId }
        });

        if (!existingKhachHang) {
            return res.status(404).json({
                message: "Không tìm thấy khách hàng",
                success: false
            });
        }

        // Kiểm tra xem khách hàng có đơn hàng không
        const donHangCount = await prisma.donhang.count({
            where: { khach_hang_id: khachHangId }
        });

        if (donHangCount > 0) {
            return res.status(400).json({
                message: `Không thể xóa khách hàng này vì đang có ${donHangCount} đơn hàng. Vui lòng xử lý các đơn hàng trước khi xóa khách hàng.`,
                success: false
            });
        }

        // Soft delete - chỉ set trang_thai = false
        const deletedKhachHang = await prisma.khachhang.update({
            where: { khach_hang_id: khachHangId },
            data: { trang_thai: false },
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                trang_thai: true
            }
        });

        return res.status(200).json({
            message: "Xóa khách hàng thành công",
            success: true,
            data: deletedKhachHang
        });
    } catch (error) {
        console.error("Lỗi xóa khách hàng:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Quên mật khẩu - Gửi email reset password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra email có được cung cấp không
        if (!email) {
            return res.status(400).json({
                message: "Vui lòng nhập email",
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

        // Tìm khách hàng bằng email
        const khachHang = await prisma.khachhang.findUnique({
            where: { email },
            select: {
                khach_hang_id: true,
                email: true,
                ho_ten: true,
                trang_thai: true
            }
        });

        // Kiểm tra email có tồn tại trong hệ thống không
        if (!khachHang) {
            return res.status(404).json({
                message: "Email không tồn tại trong hệ thống",
                success: false
            });
        }

        // Kiểm tra tài khoản có bị khóa không
        if (!khachHang.trang_thai) {
            return res.status(403).json({
                message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên",
                success: false
            });
        }

        // Tạo reset token (JWT với thời gian hết hạn 1 giờ)
        const resetToken = jwt.sign(
            {
                id: khachHang.khach_hang_id,
                email: khachHang.email,
                type: 'password_reset'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Gửi email reset password
        try {
            console.log('\n🔄 Attempting to send password reset email...');
            console.log('Email:', khachHang.email);
            console.log('User Name:', khachHang.ho_ten);
            await sendPasswordResetEmail(khachHang.email, resetToken, khachHang.ho_ten);
            console.log('✅ Email sent successfully!\n');
        } catch (emailError) {
            console.error('\n❌ Error sending reset email:');
            console.error('Error Type:', emailError.name);
            console.error('Error Message:', emailError.message);
            if (emailError.code) {
                console.error('Error Code:', emailError.code);
            }
            if (emailError.response) {
                console.error('SMTP Response:', emailError.response);
            }
            console.error('Full Error:', emailError);
            console.error('===================================\n');
            // Vẫn trả về thành công để không tiết lộ lỗi email
        }

        return res.status(200).json({
            message: "Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn",
            success: true
        });
    } catch (error) {
        console.error("Lỗi quên mật khẩu:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Reset mật khẩu - Đặt lại mật khẩu mới với token
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin (token, mật khẩu mới và xác nhận mật khẩu)",
                success: false
            });
        }

        // Kiểm tra mật khẩu mới không được bỏ trống
        if (!newPassword || newPassword.trim() === '') {
            return res.status(400).json({
                message: "Mật khẩu mới không được bỏ trống",
                success: false
            });
        }

        // Kiểm tra độ dài mật khẩu
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Mật khẩu phải có ít nhất 8 ký tự",
                success: false
            });
        }

        // Kiểm tra mật khẩu xác nhận phải khớp với mật khẩu mới
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Mật khẩu xác nhận không khớp",
                success: false
            });
        }

        // Xác thực token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(400).json({
                    message: "Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu lại",
                    success: false
                });
            }
            return res.status(400).json({
                message: "Token không hợp lệ",
                success: false
            });
        }

        // Kiểm tra token có phải là password reset token không
        if (decoded.type !== 'password_reset') {
            return res.status(400).json({
                message: "Token không hợp lệ",
                success: false
            });
        }

        // Tìm khách hàng
        const khachHang = await prisma.khachhang.findUnique({
            where: { khach_hang_id: decoded.id }
        });

        if (!khachHang) {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản",
                success: false
            });
        }

        // Kiểm tra email có khớp không
        if (khachHang.email !== decoded.email) {
            return res.status(400).json({
                message: "Token không hợp lệ",
                success: false
            });
        }

        // Hash mật khẩu mới
        const saltRounds = 10;
        const matKhauBam = await bcrypt.hash(String(newPassword), saltRounds);

        // Cập nhật mật khẩu
        await prisma.khachhang.update({
            where: { khach_hang_id: decoded.id },
            data: { mat_khau: matKhauBam }
        });

        return res.status(200).json({
            message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới",
            success: true
        });
    } catch (error) {
        console.error("Lỗi reset mật khẩu:", error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}