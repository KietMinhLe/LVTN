import prisma from "../config/db.js";

// Lấy tất cả danh mục cha
export const getAllDanhMucCha = async (req, res) => {
    try {
        // Lấy tất cả danh mục cha
        const data = await prisma.danhmuccha.findMany({
            orderBy: {
                ten_danh_muc_cha: 'asc'
            }
        });

        // Kiểm tra danh mục cha có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có danh mục cha nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.json({
            message: "Lấy tất cả danh mục cha thành công",
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
};

// Lấy danh mục cha bằng ID
export const getDanhMucChaById = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy danh mục cha theo ID trong DB
        const data = await prisma.danhmuccha.findUnique({
            where: { danh_muc_cha_id: parseInt(id) }
        });

        // Kiểm tra danh mục cha có tồn tại trong DB không
        if (!data) { // Nếu danh mục cha không tồn tại
            return res.status(404).json({
                message: "Danh mục cha không tồn tại",
                success: false
            });
        }

        // Trả về danh mục cha
        return res.json({
            message: "Lấy danh mục cha thành công",
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
};

//Tạo danh mục cha
export const createDanhMucCha = async (req, res) => {
    try {
        // Lấy dữ liệu từ request
        const { ten_danh_muc_cha, mo_ta } = req.body;

        // Kiểm tra dữ liệu
        if (!ten_danh_muc_cha || !mo_ta) {
            return res.status(400).json({
                message: "Tên danh mục cha và mô tả không được để trống",
                success: false
            });
        }

        //Kiểm tra tên danh mục cha có đúng định dạng không (hỗ trợ tiếng Việt)
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_danh_muc_cha)) {
            return res.status(400).json({
                message: "Tên danh mục cha không hợp lệ",
                success: false
            });
        }

        //Kiểm tra mô tả có đúng định dạng không (hỗ trợ tiếng Việt và các ký tự đặc biệt)
        if (mo_ta && !/^[\s\S]*$/.test(mo_ta)) {
            return res.status(400).json({
                message: "Mô tả không hợp lệ",
                success: false
            });
        }

        //Kiểm tra trùng tên danh mục cha
        const existingDanhMucCha = await prisma.danhmuccha.findFirst({
            where: { ten_danh_muc_cha }
        });
        if (existingDanhMucCha) { // Nếu danh mục cha đã tồn tại
            return res.status(400).json({
                message: "Tên danh mục cha đã tồn tại",
                success: false
            });
        }

        // Tạo danh mục cha trong DB
        const data = await prisma.danhmuccha.create({
            data: {
                ten_danh_muc_cha,
                mo_ta
            }
        });

        return res.json({
            message: "Tạo danh mục cha thành công",
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
};

// Update danh mục cha
export const updateDanhMucCha = async (req, res) => {
    try {
        // Lấy dữ liệu từ request
        const { id } = req.params;
        const { ten_danh_muc_cha, mo_ta } = req.body;

        // Lấy danh mục cha theo ID trong DB
        const existing = await prisma.danhmuccha.findUnique({
            where: { danh_muc_cha_id: parseInt(id) }
        });

        // Kiểm tra danh mục cha có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Danh mục cha không tồn tại",
                success: false
            });
        }

        // Kiểm tra dữ liệu
        if (!ten_danh_muc_cha || !mo_ta) {
            return res.status(400).json({
                message: "Tên danh mục cha và mô tả không được để trống",
                success: false
            });
        }

        //Kiểm tra tên danh mục cha có đúng định dạng không (hỗ trợ tiếng Việt)
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_danh_muc_cha)) {
            return res.status(400).json({
                message: "Tên danh mục cha không hợp lệ",
                success: false
            });
        }

        //Kiểm tra mô tả có đúng định dạng không (hỗ trợ tiếng Việt và các ký tự đặc biệt)
        if (mo_ta && !/^[\s\S]*$/.test(mo_ta)) {
            return res.status(400).json({
                message: "Mô tả không hợp lệ",
                success: false
            });
        }

        //Kiểm tra trùng tên danh mục cha
        const existingDanhMucCha = await prisma.danhmuccha.findFirst({
            where: {
                ten_danh_muc_cha,
                NOT: { danh_muc_cha_id: parseInt(id) }
            }
        });
        if (existingDanhMucCha) {
            return res.status(400).json({
                message: "Tên danh mục cha đã tồn tại",
                success: false
            });
        }

        // Cập nhật danh mục cha trong DB
        const data = await prisma.danhmuccha.update({
            where: { danh_muc_cha_id: parseInt(id) },
            data: {
                ten_danh_muc_cha,
                mo_ta,
                ngay_cap_nhat: new Date()
            }
        });
        return res.json({
            message: "Cập nhật danh mục cha thành công",
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
};

// Xóa danh mục cha
export const deleteDanhMucCha = async (req, res) => {
    try {
        // Lấy dữ liệu từ request
        const { id } = req.params;

        // Kiểm tra ID danh mục cha có tồn tại trong DB không
        const existing = await prisma.danhmuccha.findUnique({
            where: { danh_muc_cha_id: parseInt(id) }
        });
        if (!existing) {
            return res.status(404).json({
                message: "Danh mục cha không tồn tại",
                success: false
            });
        }

        // Kiểm tra xem có danh mục con nào đang sử dụng danh mục cha này không
        const danhMucCon = await prisma.danhmuc.findFirst({
            where: { danh_muc_cha_id: parseInt(id) }
        });

        if (danhMucCon) {
            return res.status(400).json({
                message: "Không thể xóa danh mục cha này vì đang có danh mục con đang sử dụng",
                success: false
            });
        }

        // Xóa danh mục cha trong DB
        const data = await prisma.danhmuccha.delete({
            where: { danh_muc_cha_id: parseInt(id) }
        });
        return res.json({
            message: "Xóa danh mục cha thành công",
            success: true,
            data: data
        });
    } catch (error) {
        //Xử lý lỗi foreign key constraint khi xóa
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa danh mục cha này vì đang có dữ liệu liên quan",
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
};

//Tìm kiếm danh mục cha
export const searchDanhMucCha = async (req, res) => {
    try {
        const { ten_danh_muc_cha } = req.query;

        // Kiểm tra tên danh mục cha có được cung cấp không
        if (!ten_danh_muc_cha) {
            return res.status(400).json({
                message: "Tên danh mục cha không được để trống",
                success: false
            });
        }

        // Tìm kiếm danh mục cha (hỗ trợ tiếng Việt)
        const data = await prisma.danhmuccha.findMany({
            where: {
                ten_danh_muc_cha: {
                    contains: ten_danh_muc_cha.trim()
                }
            },
            select: {
                ten_danh_muc_cha: true,
                mo_ta: true
            }
        });

        // Kiểm tra danh mục cha có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy danh mục cha phù hợp",
                success: false,
                data: []
            });
        }

        return res.json({
            message: "Tìm kiếm danh mục cha thành công",
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

// Sắp xếp danh mục cha
export const sortDanhMucCha = async (req, res) => {
    try {
        //Lấy tham số sortBy và order từ query params
        //sortBy: tên trường cần sắp xếp (ten_danh_muc_cha, ngay_tao)
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
        const allowedSortFields = ['ten_danh_muc_cha', 'ngay_tao']; //Có thể sắp xếp theo tên danh mục cha và ngày tạo
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
        const data = await prisma.danhmuccha.findMany({
            orderBy: orderBy
        });

        return res.status(200).json({
            success: true,
            message: `Sắp xếp danh mục cha theo ${sortBy} ${order === 'asc' ? 'tăng dần' : 'giảm dần'} thành công`,
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