import prisma from "../config/db.js";

export const getAllDanhMuc = async (req, res) => {
    try {
        // Thực hiện truy vấn với Prisma
        const data = await prisma.danhmuc.findMany({
            include: {
                danhmuccha: true,
                _count: {
                    select: {
                        sach_danhmuc: true
                    }
                }
            },
            orderBy: [
                { danhmuccha: { ten_danh_muc_cha: 'asc' } },
                { ten_danh_muc: 'asc' }
            ]
        });

        // Kiểm tra danh mục có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không có danh mục nào trong hệ thống",
                data: []
            });
        }

        // Thêm số lượng sách vào mỗi danh mục
        const dataWithCount = data.map(danhMuc => ({
            ...danhMuc,
            so_luong_sach: danhMuc._count.sach_danhmuc
        }));

        return res.status(200).json({
            success: true,
            message: "Lấy danh mục và danh mục cha thành công",
            data: dataWithCount
        });

    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
};


// Tìm kiếm danh mục
export const searchDanhMuc = async (req, res) => {
    try {
        const { ten_danh_muc } = req.query;

        // Kiểm tra tên danh mục có được cung cấp không
        if (!ten_danh_muc) {
            return res.status(400).json({
                message: "Tên danh mục không được để trống",
                success: false
            });
        }

        // Tìm kiếm danh mục (hỗ trợ tiếng Việt)
        const data = await prisma.danhmuc.findMany({
            where: {
                ten_danh_muc: {
                    contains: ten_danh_muc.trim()
                }
            },
            include: {
                danhmuccha: true
            }
        });

        //Kiểm tra danh mục có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có danh mục nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tìm kiếm danh mục thành công",
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


// Lấy danh mục theo ID
export const getDanhMucById = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy danh mục theo ID trong DB
        const data = await prisma.danhmuc.findUnique({
            where: { danh_muc_id: parseInt(id) },
            include: {
                danhmuccha: true,
                _count: {
                    select: {
                        sach_danhmuc: true
                    }
                }
            }
        });

        // Kiểm tra danh mục có tồn tại trong DB không
        if (!data) {
            return res.status(404).json({
                message: "Danh mục không tồn tại",
                success: false,
                data: null
            });
        }

        // Thêm số lượng sách vào danh mục
        const dataWithCount = {
            ...data,
            so_luong_sach: data._count.sach_danhmuc
        };

        return res.status(200).json({
            success: true,
            message: "Lấy danh mục thành công",
            data: dataWithCount
        });

    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
};

// Tạo danh mục
export const createDanhMuc = async (req, res) => {
    try {
        const { ten_danh_muc, mo_ta, slug, danh_muc_cha_id } = req.body;

        // Kiểm tra dữ liệu
        if (!ten_danh_muc || !mo_ta || !slug || !danh_muc_cha_id) {
            return res.status(400).json({
                message: "Tên danh mục, mô tả, slug và danh mục cha không được để trống",
                success: false
            });
        }

        //Kiểm tra tên danh mục (cho phép ký tự tiếng Việt - bỏ validation regex quá strict)
        if (!ten_danh_muc || ten_danh_muc.trim().length === 0) {
            return res.status(400).json({
                message: "Tên danh mục không được để trống",
                success: false
            });
        }

        //Kiểm tra slug có đúng định dạng không (chỉ cho phép chữ thường, số, dấu gạch ngang)
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return res.status(400).json({
                message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
                success: false
            });
        }

        //Kiểm tra danh mục cha có phải là số không
        if (!danh_muc_cha_id || isNaN(danh_muc_cha_id)) {
            return res.status(400).json({
                message: "Danh mục cha không hợp lệ",
                success: false
            });
        }

        //Kiểm tra danh mục cha có tồn tại trong DB không
        const existingDanhMucCha = await prisma.danhmuccha.findUnique({
            where: { danh_muc_cha_id: parseInt(danh_muc_cha_id) }
        });
        if (!existingDanhMucCha) {
            return res.status(400).json({
                message: "Danh mục cha không tồn tại",
                success: false
            });
        }


        // Tạo danh mục trong DB
        const data = await prisma.danhmuc.create({
            data: {
                ten_danh_muc,
                mo_ta,
                slug,
                danh_muc_cha_id: parseInt(danh_muc_cha_id)
            },
            include: {
                danhmuccha: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Tạo danh mục thành công",
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

// Cập nhật danh mục
export const updateDanhMuc = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_danh_muc, mo_ta, slug, danh_muc_cha_id } = req.body;

        // Kiểm tra danh mục có tồn tại trong DB không
        const existing = await prisma.danhmuc.findUnique({
            where: { danh_muc_id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Danh mục không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra dữ liệu
        if (!ten_danh_muc || !mo_ta || !slug || !danh_muc_cha_id) {
            return res.status(400).json({
                message: "Tên danh mục, mô tả, slug và danh mục cha không được để trống",
                success: false
            });
        }

        //Kiểm tra tên danh mục (cho phép ký tự tiếng Việt - bỏ validation regex quá strict)
        if (!ten_danh_muc || ten_danh_muc.trim().length === 0) {
            return res.status(400).json({
                message: "Tên danh mục không được để trống",
                success: false
            });
        }

        //Kiểm tra slug có đúng định dạng không (chỉ cho phép chữ thường, số, dấu gạch ngang)
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return res.status(400).json({
                message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
                success: false
            });
        }

        //Kiểm tra danh mục cha có phải là số không
        if (!danh_muc_cha_id || isNaN(danh_muc_cha_id)) {
            return res.status(400).json({
                message: "Danh mục cha không hợp lệ",
                success: false
            });
        }

        // Kiểm tra danh mục cha có tồn tại trong DB không
        const existingDanhMucCha = await prisma.danhmuccha.findUnique({
            where: { danh_muc_cha_id: parseInt(danh_muc_cha_id) }
        });
        if (!existingDanhMucCha) {
            return res.status(400).json({
                message: "Danh mục cha không tồn tại",
                success: false
            });
        }

        // Cập nhật danh mục trong DB
        const updatedData = await prisma.danhmuc.update({
            where: { danh_muc_id: parseInt(id) },
            data: {
                ten_danh_muc,
                mo_ta,
                slug,
                danh_muc_cha_id: parseInt(danh_muc_cha_id)
            },
            include: {
                danhmuccha: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Cập nhật danh mục thành công",
            data: updatedData
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
};

// Sắp xếp danh mục
export const sortDanhMuc = async (req, res) => {
    try {
        //Lấy tham số sortBy và order từ query params
        //sortBy: tên trường cần sắp xếp (ten_danh_muc, ngay_tao)
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
        const allowedSortFields = ['ten_danh_muc', 'ngay_tao']; //Có thể sắp xếp theo tên danh mục và ngày tạo
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

        // Lấy dữ liệu với sắp xếp và bao gồm danh mục cha
        const data = await prisma.danhmuc.findMany({
            include: {
                danhmuccha: true
            },
            orderBy: orderBy
        });

        return res.status(200).json({
            success: true,
            message: `Sắp xếp danh mục theo ${sortBy} ${order === 'asc' ? 'tăng dần' : 'giảm dần'} thành công`,
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

// Xóa danh mục
export const deleteDanhMuc = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        // Kiểm tra danh mục có tồn tại không và đếm số lượng sách
        const existing = await prisma.danhmuc.findUnique({
            where: { danh_muc_id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        sach_danhmuc: true
                    }
                }
            }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Danh mục không tồn tại",
                success: false
            });
        }

        // Kiểm tra danh mục có sách không - KHÔNG CHO PHÉP XÓA
        if (existing._count.sach_danhmuc > 0) {
            return res.status(400).json({
                message: `Không thể xóa danh mục này vì đang có ${existing._count.sach_danhmuc} sách. Vui lòng xóa hoặc chuyển sách sang danh mục khác trước.`,
                success: false
            });
        }

        // Xóa danh mục
        const data = await prisma.danhmuc.delete({
            where: { danh_muc_id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Xóa danh mục thành công",
            success: true,
            data: data
        });
    } catch (error) {
        //Xử lý lỗi foreign key constraint khi xóa
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa danh mục này vì đang có dữ liệu liên quan",
                success: false,
                error: error.message
            });
        }
        console.error('Error deleting danh muc:', error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}
