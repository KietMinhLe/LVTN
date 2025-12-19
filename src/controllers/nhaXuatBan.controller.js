import prisma from "../config/db.js";

export const getAllNhaXuatBan = async (req, res) => {
    try {
        const data = await prisma.nhaxuatban.findMany({
            include: {
                _count: {
                    select: {
                        sach: true
                    }
                }
            }
        });

        // Kiểm tra nhà xuất bản có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có nhà xuất bản nào trong hệ thống",
                success: false,
                data: []
            });
        }

        // Thêm số lượng sách vào mỗi nhà xuất bản
        const dataWithCount = data.map(nxb => ({
            ...nxb,
            so_luong_sach: nxb._count.sach
        }));

        return res.status(200).json({
            message: "Lấy tất cả nhà xuất bản thành công",
            success: true,
            data: dataWithCount
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

//Tìm kiếm nhà xuất bản
export const searchNhaXuatBan = async (req, res) => {
    try {
        const { ten_nha_xuat_ban } = req.query;

        //Kiểm tra tên nhà xuất bản có được cung cấp không
        if (!ten_nha_xuat_ban) {
            return res.status(400).json({
                message: "Tên nhà xuất bản không được để trống",
                success: false
            });
        }

        // Tìm kiếm nhà xuất bản (hỗ trợ tiếng Việt)
        const data = await prisma.nhaxuatban.findMany({
            where: {
                ten_nha_xuat_ban: {
                    contains: ten_nha_xuat_ban.trim()
                }
            }
        });

        //Kiểm tra nhà xuất bản có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có nhà xuất bản nào trong hệ thống",
                success: false,
                data: []
            });
        }
        return res.status(200).json({
            message: "Tìm kiếm nhà xuất bản thành công",
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

//Tìm kiếm nhà xuất bản theo ID
export const getNhaXuatBanById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra nhà xuất bản có tồn tại trong DB không
        const data = await prisma.nhaxuatban.findUnique({
            where: { nha_xuat_ban_id: parseInt(id) }
        });

        //Kiểm tra nhà xuất bản có tồn tại trong DB không
        if (!data) {
            return res.status(404).json({
                message: "Không có nhà xuất bản nào trong hệ thống",
                success: false,
                data: null
            });
        }
        return res.status(200).json({
            message: "Lấy nhà xuất bản thành công",
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

//Tạo nhà xuất bản
export const createNhaXuatBan = async (req, res) => {
    try {
        const { ten_nha_xuat_ban, email } = req.body;

        //Kiểm tra nhập liệu có hợp lệ không
        if (!ten_nha_xuat_ban) {
            return res.status(400).json({
                message: "Tên nhà xuất bản không được để trống",
                success: false
            });
        }

        //Kiểm tra email có được cung cấp không
        if (!email) {
            return res.status(400).json({
                message: "Email không được để trống",
                success: false
            });
        }

        //Kiểm tra email có đúng định dạng không
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Email không hợp lệ",
                success: false
            });
        }

        //Kiểm tra tên nhà xuất bản có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (ten_nha_xuat_ban && !/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_nha_xuat_ban)) {
            return res.status(400).json({
                message: "Tên nhà xuất bản không hợp lệ",
                success: false
            });
        }

        //Kiểm tra email đã tồn tại chưa
        const existingEmail = await prisma.nhaxuatban.findFirst({
            where: { email },
        });

        if (existingEmail) {
            return res.status(400).json({
                message: "Email đã tồn tại",
                success: false
            });
        }

        //Kiểm tra nhà xuất bản có tồn tại trong DB không
        const existing = await prisma.nhaxuatban.findFirst({
            where: { ten_nha_xuat_ban }
        });

        //Kiểm tra nhà xuất bản có tồn tại trong DB không
        if (existing) {
            return res.status(400).json({
                message: "Nhà xuất bản đã tồn tại",
                success: false
            });
        }

        //Tạo nhà xuất bản trong DB
        const data = await prisma.nhaxuatban.create({
            data: {
                ten_nha_xuat_ban,
                email
            }
        });

        return res.status(200).json({
            message: "Tạo nhà xuất bản thành công",
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

//Cập nhật nhà xuất bản
export const updateNhaXuatBan = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_nha_xuat_ban, email } = req.body;

        //Kiểm tra ID có được cung cấp không
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra nhà xuất bản có tồn tại trong DB không
        const existing = await prisma.nhaxuatban.findUnique({
            where: { nha_xuat_ban_id: parseInt(id) }
        });

        //Kiểm tra nhà xuất bản có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có nhà xuất bản nào trong hệ thống",
                success: false,
                data: null
            });
        }

        //Kiểm tra nhập liệu có hợp lệ không
        if (!ten_nha_xuat_ban) {
            return res.status(400).json({
                message: "Tên nhà xuất bản không được để trống",
                success: false
            });
        }

        //Kiểm tra email có được cung cấp không
        if (!email) {
            return res.status(400).json({
                message: "Email không được để trống",
                success: false
            });
        }

        //Kiểm tra email có đúng định dạng không
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Email không hợp lệ",
                success: false
            });
        }

        //Kiểm tra tên nhà xuất bản có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (ten_nha_xuat_ban && !/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_nha_xuat_ban)) {
            return res.status(400).json({
                message: "Tên nhà xuất bản không hợp lệ",
                success: false
            });
        }

        //Kiểm tra trùng email (loại trừ chính nó)
        const existingEmail = await prisma.nhaxuatban.findFirst({
            where: {
                email,
                NOT: { nha_xuat_ban_id: parseInt(id) }
            }
        });

        if (existingEmail) {
            return res.status(400).json({
                message: "Email đã tồn tại",
                success: false
            });
        }

        //Kiểm tra trùng tên nhà xuất bản
        const existingNhaXuatBan = await prisma.nhaxuatban.findFirst({
            where: {
                ten_nha_xuat_ban,
                NOT: { nha_xuat_ban_id: parseInt(id) }
            }
        });
        if (existingNhaXuatBan) {
            return res.status(400).json({
                message: "Tên nhà xuất bản đã tồn tại",
                success: false
            });
        }

        //Cập nhật nhà xuất bản trong DB
        const data = await prisma.nhaxuatban.update({
            where: { nha_xuat_ban_id: parseInt(id) },
            data: {
                ten_nha_xuat_ban,
                email
            }
        });

        return res.status(200).json({
            message: "Cập nhật nhà xuất bản thành công",
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

//Xóa nhà xuất bản
export const deleteNhaXuatBan = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra nhà xuất bản có tồn tại không và đếm số lượng sách
        const existing = await prisma.nhaxuatban.findUnique({
            where: { nha_xuat_ban_id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        sach: true
                    }
                }
            }
        });

        //Kiểm tra nhà xuất bản có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có nhà xuất bản nào trong hệ thống",
                success: false,
                data: null
            });
        }

        // Kiểm tra nhà xuất bản có sách không - KHÔNG CHO PHÉP XÓA
        if (existing._count.sach > 0) {
            return res.status(400).json({
                message: `Không thể xóa nhà xuất bản này vì đang có ${existing._count.sach} sách. Vui lòng xóa hoặc chuyển sách sang nhà xuất bản khác trước.`,
                success: false
            });
        }

        const data = await prisma.nhaxuatban.delete({
            where: { nha_xuat_ban_id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Xóa nhà xuất bản thành công",
            success: true,
            data: data
        })
    } catch (error) {
        //Xử lý lỗi foreign key constraint khi xóa
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa nhà xuất bản này vì đang có dữ liệu liên quan",
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

// Sắp xếp nhà xuất bản
export const sortNhaXuatBan = async (req, res) => {
    try {
        //Lấy tham số sortBy và order từ query params
        //sortBy: tên trường cần sắp xếp (ten_nha_xuat_ban, ngay_tao)
        //order: 'asc' hoặc 'desc'
        const { sortBy, order } = req.query;

        // Kiểm tra tham số sortBy và order
        if (!sortBy || !order) {
            return res.status(400).json({
                success: false,
                message: "Thiếu tham số sortBy hoặc order",
                data: []
            });
        }

        // Validate order phải là 'asc' hoặc 'desc'
        if (order !== 'asc' && order !== 'desc') {
            return res.status(400).json({
                success: false,
                message: "Order phải là 'asc' hoặc 'desc'",
                data: []
            });
        }

        // Validate sortBy - chỉ cho phép sắp xếp theo các trường hợp lệ
        const allowedSortFields = ['ten_nha_xuat_ban', 'ngay_tao']; //Có thể sắp xếp theo tên nhà xuất bản và ngày tạo
        if (!allowedSortFields.includes(sortBy)) { //Kiểm tra sortBy có phải là một trong các giá trị cho phép không
            return res.status(400).json({
                success: false,
                message: `sortBy phải là một trong các giá trị: ${allowedSortFields.join(', ')}`,
                data: []
            });
        }

        // Xây dựng orderBy object
        const orderBy = {};
        orderBy[sortBy] = order;

        // Lấy dữ liệu với sắp xếp
        const data = await prisma.nhaxuatban.findMany({
            orderBy: orderBy
        });

        return res.status(200).json({
            success: true,
            message: `Sắp xếp nhà xuất bản theo ${sortBy} ${order === 'asc' ? 'tăng dần' : 'giảm dần'} thành công`,
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