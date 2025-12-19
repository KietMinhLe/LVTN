import prisma from "../config/db.js";

export const getAllThuongHieu = async (req, res) => {
    try {
        const data = await prisma.thuonghieu.findMany({
            include: {
                _count: {
                    select: {
                        sach: true
                    }
                }
            }
        });

        //Kiểm tra thương hiệu có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có thương hiệu nào trong hệ thống",
                success: false,
                data: []
            });
        }

        // Thêm số lượng sách vào mỗi thương hiệu
        const dataWithCount = data.map(th => ({
            ...th,
            so_luong_sach: th._count.sach
        }));

        return res.status(200).json({
            message: "Lấy tất cả thương hiệu thành công",
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

//Sắp xếp thương hiệu
export const sortThuongHieu = async (req, res) => {
    try {
        //Lấy tham số sortBy và order từ query params
        //sortBy: tên trường cần sắp xếp (ten_thuong_hieu, ngay_tao)
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
        const allowedSortFields = ['ten_thuong_hieu', 'ngay_tao']; //Có thể sắp xếp theo tên thương hiệu và ngày tạo
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
        const data = await prisma.thuonghieu.findMany({
            orderBy: orderBy
        });

        return res.status(200).json({
            success: true,
            message: `Sắp xếp thương hiệu theo ${sortBy} ${order === 'asc' ? 'tăng dần' : 'giảm dần'} thành công`,
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

//Tìm kiếm thương hiệu
export const searchThuongHieu = async (req, res) => {
    try {
        const { ten_thuong_hieu } = req.query;

        //Kiểm tra tên thương hiệu có được cung cấp không
        if (!ten_thuong_hieu) {
            return res.status(400).json({
                message: "Tên thương hiệu không được để trống",
                success: false
            });
        }

        // Tìm kiếm thương hiệu (hỗ trợ tiếng Việt)
        const data = await prisma.thuonghieu.findMany({
            where: {
                ten_thuong_hieu: {
                    contains: ten_thuong_hieu.trim()
                }
            }
        });

        //Kiểm tra thương hiệu có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có thương hiệu nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Tìm kiếm thương hiệu thành công",
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

//Tìm kiếm thương hiệu theo ID
export const getThuongHieuById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra thương hiệu có tồn tại trong DB không
        const data = await prisma.thuonghieu.findUnique({
            where: { thuong_hieu_id: parseInt(id) }
        });

        //Kiểm tra thương hiệu có tồn tại trong DB không
        if (!data) {
            return res.status(404).json({
                message: "Không có thương hiệu nào trong hệ thống",
                success: false,
                data: null
            });
        }

        return res.status(200).json({
            message: "Lấy thương hiệu thành công",
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

//Tạo thương hiệu
export const createThuongHieu = async (req, res) => {
    try {
        const { ten_thuong_hieu } = req.body;

        if (!ten_thuong_hieu) {
            return res.status(400).json({
                message: "Tên thương hiệu không được để trống",
                success: false
            });
        }

        //Kiểm tra tên thương hiệu có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (ten_thuong_hieu && !/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_thuong_hieu)) {
            return res.status(400).json({
                message: "Tên thương hiệu không hợp lệ",
                success: false
            });
        }

        //Kiểm tra tên thương hiệu có được cung cấp không
        if (!ten_thuong_hieu) {
            return res.status(400).json({
                message: "Tên thương hiệu không được để trống",
                success: false
            });
        }

        //Kiểm tra trùng tên thương hiệu
        const existingThuongHieu = await prisma.thuonghieu.findFirst({
            where: { ten_thuong_hieu }
        });

        //Kiểm tra trùng tên thương hiệu
        if (existingThuongHieu) {
            return res.status(400).json({
                message: "Tên thương hiệu đã tồn tại",
                success: false
            });
        }

        //Tạo thương hiệu trong DB
        const data = await prisma.thuonghieu.create({
            data: {
                ten_thuong_hieu
            }
        });

        return res.status(200).json({
            message: "Tạo thương hiệu thành công",
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

//Cập nhật thương hiệu
export const updateThuongHieu = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_thuong_hieu } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra tên thương hiệu có được cung cấp không
        if (!ten_thuong_hieu) {
            return res.status(400).json({
                message: "Tên thương hiệu không được để trống",
                success: false
            });
        }

        //Kiểm tra tên thương hiệu có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (ten_thuong_hieu && !/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_thuong_hieu)) {
            return res.status(400).json({
                message: "Tên thương hiệu không hợp lệ",
                success: false
            });
        }

        //Kiểm tra thương hiệu có tồn tại trong DB không
        const existing = await prisma.thuonghieu.findUnique({
            where: { thuong_hieu_id: parseInt(id) }
        });

        //Kiểm tra thương hiệu có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có thương hiệu nào trong hệ thống",
                success: false,
                data: null
            });
        }

        //Kiểm tra nhập liệu có hợp lệ không
        if (!ten_thuong_hieu) {
            return res.status(400).json({
                message: "Tên thương hiệu không được để trống",
                success: false
            });
        }

        //Kiểm tra tên thương hiệu có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (ten_thuong_hieu && !/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_thuong_hieu)) {
            return res.status(400).json({
                message: "Tên thương hiệu không hợp lệ",
                success: false
            });
        }

        //Kiểm tra trùng tên thương hiệu
        const existingThuongHieu = await prisma.thuonghieu.findFirst({
            where: { ten_thuong_hieu, NOT: { thuong_hieu_id: parseInt(id) } }
        });

        //Kiểm tra trùng tên thương hiệu
        if (existingThuongHieu) {
            return res.status(400).json({
                message: "Tên thương hiệu đã tồn tại",
                success: false
            });
        }

        //Cập nhật thương hiệu trong DB
        const data = await prisma.thuonghieu.update({
            where: { thuong_hieu_id: parseInt(id) },
            data: {
                ten_thuong_hieu
            }
        });

        return res.status(200).json({
            message: "Cập nhật thương hiệu thành công",
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

//Xóa thương hiệu
export const deleteThuongHieu = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra thương hiệu có tồn tại không và đếm số lượng sách
        const existing = await prisma.thuonghieu.findUnique({
            where: { thuong_hieu_id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        sach: true
                    }
                }
            }
        });

        //Kiểm tra thương hiệu có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có thương hiệu nào trong hệ thống",
                success: false,
                data: null
            });
        }

        // Kiểm tra thương hiệu có sách không - KHÔNG CHO PHÉP XÓA
        if (existing._count.sach > 0) {
            return res.status(400).json({
                message: `Không thể xóa thương hiệu này vì đang có ${existing._count.sach} sách. Vui lòng xóa hoặc chuyển sách sang thương hiệu khác trước.`,
                success: false
            });
        }

        //Xóa thương hiệu trong DB
        const data = await prisma.thuonghieu.delete({
            where: { thuong_hieu_id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Xóa thương hiệu thành công",
            success: true,
            data: data
        });
    } catch (error) {
        //Xử lý lỗi foreign key constraint khi xóa
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa thương hiệu này vì đang có dữ liệu liên quan",
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