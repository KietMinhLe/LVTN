import prisma from "../config/db.js";

//Lấy tất cả sách danh mục
export const getAllSachDanhMuc = async (req, res) => {
    try {
        const data = await prisma.sach_danhmuc.findMany({
            include: {
                sach: true,
                danhmuc: true,
            },
            orderBy: [
                { sach_id: 'asc' },
            ]
        });

        //Kiểm tra sách danh mục có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có sách danh mục nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Lấy tất cả sách danh mục thành công",
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

//Sắp xếp sách danh mục
export const sortSachDanhMuc = async (req, res) => {
    try {
        const { sortBy, order } = req.query;

        //Kiểm tra tham số sortBy và order có được cung cấp không
        if (!sortBy || !order) {
            return res.status(400).json({
                message: "Thiếu tham số sortBy hoặc order",
                success: false
            });
        }

        //Kiểm tra tham số sortBy có hợp lệ không
        if (!['sach_id', 'danhmuc_id'].includes(sortBy)) {
            return res.status(400).json({
                message: "Tham số sortBy không hợp lệ",
                success: false
            });
        }

        //Kiểm tra tham số order có hợp lệ không
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: "Tham số order không hợp lệ",
                success: false
            });
        }


        //Xây dựng orderBy object
        const orderBy = {};
        orderBy[sortBy] = order;

        //Lấy dữ liệu với sắp xếp
        const data = await prisma.sach_danhmuc.findMany({
            include: {
                sach: true,
                danhmuc: true,
            },
            orderBy: orderBy
        });

        return res.status(200).json({
            message: "Sắp xếp sách danh mục thành công",
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

//Lấy sách danh mục theo ID
export const getSachDanhMucById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Lấy sách danh mục theo ID
        const data = await prisma.sach_danhmuc.findUnique({
            where: { sach_danh_muc_id: parseInt(id) },
            include: {
                sach: true,
                danhmuc: true
            }
        });

        //Kiểm tra sách danh mục có tồn tại trong DB không
        if (!data) {
            return res.status(404).json({
                message: "Không có sách danh mục nào trong hệ thống",
                success: false,
                data: null
            });
        }

        return res.status(200).json({
            message: "Lấy sách danh mục thành công",
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

//Tạo sách danh mục
export const createSachDanhMuc = async (req, res) => {
    try {
        const { sach_id, danhmuc_id } = req.body;

        //Kiểm tra sách và danh mục có được cung cấp không
        if (!sach_id || !danhmuc_id) {
            return res.status(400).json({
                message: "Sách và danh mục không được để trống",
                success: false
            });
        }

        //Kiểm tra sách và danh mục có phải là số không
        if (isNaN(sach_id) || isNaN(danhmuc_id)) {
            return res.status(400).json({
                message: "Sách và danh mục phải là số",
                success: false
            });
        }

        //Kiểm tra sách có được cung cấp không
        if (!sach_id) {
            return res.status(400).json({
                message: "Sách không được để trống",
                success: false
            });
        }

        //Kiểm tra danh mục có được cung cấp không
        if (!danhmuc_id) {
            return res.status(400).json({
                message: "Danh mục không được để trống",
                success: false
            });
        }

        //Kiểm tra sách có phải là số không
        if (isNaN(sach_id)) {
            return res.status(400).json({
                message: "Sách phải là số",
                success: false
            });
        }

        //Kiểm tra danh mục có phải là số không
        if (isNaN(danhmuc_id)) {
            return res.status(400).json({
                message: "Danh mục phải là số",
                success: false
            });
        }

        //Kiểm tra sách và danh mục có tồn tại trong DB không
        //transaction dùng để chạy song song 2 truy vấn kiểm tra.
        const transaction = await prisma.$transaction([
            prisma.sach.findUnique({ where: { sach_id: +sach_id } }),
            prisma.danhmuc.findUnique({ where: { danh_muc_id: +danhmuc_id } }),
        ]);

        //Kiểm tra sách và danh mục có tồn tại trong DB không
        //some dùng để kiểm tra xem có item nào trong transaction là false không.
        //nếu có thì trả về lỗi.
        if (transaction.some(item => !item)) {
            return res.status(400).json({
                message: "Sách hoặc danh mục không tồn tại",
                success: false
            });
        }

        //Kiểm tra trùng sách và danh mục
        const existingSachDanhMuc = await prisma.sach_danhmuc.findFirst({
            where: { sach_id: parseInt(sach_id), danh_muc_id: parseInt(danhmuc_id) }
        });

        //Kiểm tra đã tồn tại sách danh mục trong DB không
        if (existingSachDanhMuc) {
            return res.status(400).json({
                message: "Sách danh mục đã tồn tại",
                success: false
            });
        }

        //Tạo sách danh mục trong DB
        const data = await prisma.sach_danhmuc.create({
            data: {
                sach_id: parseInt(sach_id),
                danh_muc_id: parseInt(danhmuc_id)
            }
        });

        return res.status(200).json({
            message: "Tạo sách danh mục thành công",
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

//Cập nhật sách danh mục
export const updateSachDanhMuc = async (req, res) => {
    try {
        const { id } = req.params;
        const { sach_id, danhmuc_id } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra sách và danh mục có được cung cấp không
        if (!sach_id || !danhmuc_id) {
            return res.status(400).json({
                message: "Sách và danh mục không được để trống",
                success: false
            });
        }

        //Kiểm tra sách và danh mục có phải là số không
        if (isNaN(sach_id) || isNaN(danhmuc_id)) {
            return res.status(400).json({
                message: "Sách và danh mục phải là số",
                success: false
            });
        }

        //Kiểm tra sách danh mục có tồn tại trong DB không
        const existing = await prisma.sach_danhmuc.findUnique({
            where: { sach_danh_muc_id: parseInt(id) }
        });

        //Kiểm tra sách danh mục có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có sách danh mục nào trong hệ thống",
                success: false,
                data: null
            });
        }

        //Kiểm tra sách và danh mục có được cung cấp không
        if (!sach_id || !danhmuc_id) {
            return res.status(400).json({
                message: "Sách và danh mục không được để trống",
                success: false
            });
        }

        //Kiểm tra sách và danh mục có phải là số không
        if (isNaN(sach_id) || isNaN(danhmuc_id)) {
            return res.status(400).json({
                message: "Sách và danh mục phải là số",
                success: false
            });
        }

        //transaction
        const transaction = await prisma.$transaction([
            prisma.sach.findUnique({ where: { sach_id: +sach_id } }),
            prisma.danhmuc.findUnique({ where: { danh_muc_id: +danhmuc_id } }),
        ]);

        //Kiểm tra sách và danh mục có tồn tại trong DB không
        if (transaction.some(item => !item)) {
            return res.status(400).json({
                message: "Sách hoặc danh mục không tồn tại",
                success: false
            });
        }

        //Kiểm tra trùng sách và danh mục
        const existingSachDanhMuc = await prisma.sach_danhmuc.findFirst({
            where: {
                sach_id: +sach_id, danh_muc_id: +danhmuc_id, NOT: { sach_danh_muc_id: +id }
            }
        });


        //Kiểm tra đã tồn tại sách danh mục trong DB không
        if (existingSachDanhMuc) {
            return res.status(400).json({
                message: "Sách danh mục đã tồn tại",
                success: false
            });
        }

        //Cập nhật sách danh mục trong DB
        const data = await prisma.sach_danhmuc.update({
            where: { sach_danh_muc_id: parseInt(id) },
            data: {
                sach_id: parseInt(sach_id),
                danh_muc_id: parseInt(danhmuc_id)
            }
        });

        return res.status(200).json({
            message: "Cập nhật sách danh mục thành công",
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

//Xóa sách danh mục
export const deleteSachDanhMuc = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra sách danh mục có tồn tại trong DB không
        const existing = await prisma.sach_danhmuc.findUnique({
            where: { sach_danh_muc_id: parseInt(id) }
        });

        //Kiểm tra sách danh mục có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có sách danh mục nào trong hệ thống",
                success: false,
                data: null
            });
        }

        //Xóa sách danh mục trong DB
        const data = await prisma.sach_danhmuc.delete({
            where: { sach_danh_muc_id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Xóa sách danh mục thành công",
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