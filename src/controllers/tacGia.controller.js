import prisma from "../config/db.js";

//Lấy tất cả tác giả
export const getAllTacGia = async (req, res) => {
    try {
        const data = await prisma.tacgia.findMany({
            include: {
                _count: {
                    select: {
                        sach: true
                    }
                }
            }
        });

        //Kiểm tra tác giả có tồn tại trong DB không
        if (!data.length) {
            return res.status(404).json({
                message: "Không có tác giả nào trong hệ thống",
                success: false,
                data: []
            });
        }

        // Thêm số lượng sách vào mỗi tác giả
        const dataWithCount = data.map(tacGia => ({
            ...tacGia,
            so_luong_sach: tacGia._count.sach
        }));

        return res.status(200).json({
            message: "Lấy tất cả tác giả thành công",
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

//Sắp xếp tác giả
export const sortTacGia = async (req, res) => {
    try {
        //Lấy tham số sortBy và order từ query params
        //sortBy: tên trường cần sắp xếp (ten_tac_gia, ngay_tao)
        //order: 'asc' hoặc 'desc'
        const { sortBy, order } = req.query;

        //Kiểm tra tham số sortBy và order
        if (!sortBy || !order) {
            return res.status(400).json({
                success: false,
                message: "Thiếu tham số sortBy hoặc order",
                data: []
            });
        }

        //Validate order phải là 'asc' hoặc 'desc'
        if (order !== 'asc' && order !== 'desc') {
            return res.status(400).json({
                success: false,
                message: "Order phải là 'asc' hoặc 'desc'",
                data: []
            });
        }

        //Validate sortBy - chỉ cho phép sắp xếp theo các trường hợp lệ
        const allowedSortFields = ['ten_tac_gia', 'ngay_tao']; //Có thể sắp xếp theo tên tác giả và ngày tạo
        if (!allowedSortFields.includes(sortBy)) { //Kiểm tra sortBy có phải là một trong các giá trị cho phép không
            return res.status(400).json({
                success: false,
                message: `sortBy phải là một trong các giá trị: ${allowedSortFields.join(', ')}`,
                data: []
            });
        }

        //Xây dựng orderBy object
        const orderBy = {};
        orderBy[sortBy] = order;

        //Lấy dữ liệu với sắp xếp
        const data = await prisma.tacgia.findMany({
            orderBy: orderBy
        });

        //Trả về dữ liệu với sắp xếp
        return res.status(200).json({
            success: true,
            message: `Sắp xếp tác giả theo ${sortBy} ${order === 'asc' ? 'tăng dần' : 'giảm dần'} thành công`,
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

//Tìm kiếm tác giả
export const searchTacGia = async (req, res) => {
    try {
        const { ten_tac_gia } = req.query;

        //Kiểm tra tên tác giả có được cung cấp không
        if (!ten_tac_gia) {
            return res.status(400).json({
                message: "Tên tác giả không được để trống",
                success: false
            });
        }

        // Tìm kiếm tác giả (hỗ trợ tiếng Việt)
        const data = await prisma.tacgia.findMany({
            where: {
                ten_tac_gia: {
                    contains: ten_tac_gia.trim()
                }
            }
        });

        //Kiểm tra tác giả có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có tác giả nào trong hệ thống",
                success: false,
                data: []
            });
        }

        //Trả về dữ liệu với sắp xếp
        return res.status(200).json({
            success: true,
            message: "Tìm kiếm tác giả thành công",
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

//Lấy tác giả theo ID
export const getTacGiaById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Lấy tác giả theo ID
        const data = await prisma.tacgia.findUnique({
            where: { tac_gia_id: parseInt(id) }
        });

        //Kiểm tra tác giả có tồn tại trong DB không
        if (!data) {
            return res.status(404).json({
                message: "Không có tác giả nào trong hệ thống",
                success: false,
                data: null
            });
        }

        //Trả về dữ liệu với sắp xếp
        return res.status(200).json({
            success: true,
            message: "Lấy tác giả thành công",
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

//Tạo tác giả
export const createTacGia = async (req, res) => {
    try {
        const { ten_tac_gia, tieu_su } = req.body;

        //Kiểm tra tên tác giả có được cung cấp không
        if (!ten_tac_gia) {
            return res.status(400).json({
                message: "Tên tác giả không được để trống",
                success: false
            });
        }

        //Kiểm tra tên tác giả có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (ten_tac_gia && !/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_tac_gia)) {
            return res.status(400).json({
                message: "Tên tác giả không hợp lệ",
                success: false
            });
        }

        //Tiểu sử cho phép mọi ký tự (không cần validation)

        //Kiểm tra trùng tên tác giả
        const existingTacGia = await prisma.tacgia.findFirst({
            where: { ten_tac_gia }
        });

        //Kiểm tra đã tồn tại tác giả trong DB không
        if (existingTacGia) {
            return res.status(400).json({
                message: "Tên tác giả đã tồn tại",
                success: false
            });
        }

        //Tạo tác giả trong DB
        const data = await prisma.tacgia.create({
            data: {
                ten_tac_gia,
                tieu_su
            }
        });

        //Trả về dữ liệu với sắp xếp
        return res.status(200).json({
            success: true,
            message: "Tạo tác giả thành công",
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

//Cập nhật tác giả
export const updateTacGia = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_tac_gia, tieu_su } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra nhập liệu có hợp lệ không
        if (!ten_tac_gia) {
            return res.status(400).json({
                message: "Tên tác giả không được để trống",
                success: false
            });
        }

        //Kiểm tra tên tác giả có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (ten_tac_gia && !/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_tac_gia)) {
            return res.status(400).json({
                message: "Tên tác giả không hợp lệ",
                success: false
            });
        }

        //Tiểu sử cho phép mọi ký tự (không cần validation)

        //Lấy tác giả theo ID
        const existing = await prisma.tacgia.findUnique({
            where: { tac_gia_id: parseInt(id) }
        });

        //Kiểm tra tác giả có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có tác giả nào trong hệ thống",
                success: false,
                data: null
            });
        }

        //Kiểm tra trùng tên tác giả
        const existingTacGia = await prisma.tacgia.findFirst({
            where: { ten_tac_gia, NOT: { tac_gia_id: parseInt(id) } }
        });

        //Kiểm tra trùng tên tác giả
        if (existingTacGia) {
            return res.status(400).json({
                message: "Tên tác giả đã tồn tại",
                success: false
            });
        }

        //Cập nhật tác giả trong DB
        const data = await prisma.tacgia.update({
            where: { tac_gia_id: parseInt(id) },
            data: {
                ten_tac_gia,
                tieu_su
            }
        });

        //Trả về dữ liệu với sắp xếp
        return res.status(200).json({
            success: true,
            message: "Cập nhật tác giả thành công",
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

//Xóa tác giả
export const deleteTacGia = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra tác giả có tồn tại không và đếm số lượng sách
        const existing = await prisma.tacgia.findUnique({
            where: { tac_gia_id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        sach: true
                    }
                }
            }
        });

        //Kiểm tra tác giả có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có tác giả nào trong hệ thống",
                success: false,
                data: null
            });
        }

        // Kiểm tra tác giả có sách không - KHÔNG CHO PHÉP XÓA
        if (existing._count.sach > 0) {
            return res.status(400).json({
                message: `Không thể xóa tác giả này vì đang có ${existing._count.sach} sách. Vui lòng xóa hoặc chuyển sách sang tác giả khác trước.`,
                success: false
            });
        }

        //Xóa tác giả trong DB
        const data = await prisma.tacgia.delete({
            where: { tac_gia_id: parseInt(id) }
        });

        //Trả về dữ liệu với sắp xếp
        return res.status(200).json({
            success: true,
            message: "Xóa tác giả thành công",
            data: data
        });
    } catch (error) {
        //Xử lý lỗi foreign key constraint khi xóa
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa tác giả này vì đang có dữ liệu liên quan",
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