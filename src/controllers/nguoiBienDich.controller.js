import prisma from "../config/db.js";

//Lấy tất cả người biên dịch
export const getAllNguoiBienDich = async (req, res) => {
    try {
        const data = await prisma.nguoibiendich.findMany();

        //Kiểm tra xem có người biên dịch nào không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có người biên dịch nào trong hệ thống",
                success: false,
                data: []
            })
        }

        return res.status(200).json({
            message: "Lấy tất cả người biên dịch thành công",
            success: true,
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        })
    }
}

//Sắp xếp người biên dịch
export const sortNguoiBienDich = async (req, res) => {
    try {
        const { sortBy, order } = req.query;

        //Kiểm tra tham số sortBy và order có được cung cấp không
        if (!sortBy || !order) {
            return res.status(400).json({
                message: "Thiếu tham số sortBy hoặc order",
                success: false
            })
        }

        //Kiểm tra tham số sortBy có hợp lệ không
        if (!['nguoi_bien_dich_id', 'ten_nguoi_bien_dich', 'ngay_tao'].includes(sortBy)) {
            return res.status(400).json({
                message: "Tham số sortBy không hợp lệ",
                success: false
            })
        }

        //Kiểm tra tham số order có hợp lệ không
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: "Tham số order không hợp lệ",
                success: false
            })
        }

        //Xây dựng orderBy object
        const orderBy = {};
        orderBy[sortBy] = order;

        //Lấy dữ liệu với sắp xếp
        const data = await prisma.nguoibiendich.findMany({
            orderBy: orderBy
        })

        //Kiểm tra xem có người biên dịch nào không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có người biên dịch nào trong hệ thống",
                success: false,
                data: []
            })
        }

        return res.status(200).json({
            message: "Sắp xếp người biên dịch thành công",
            success: true,
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        })
    }
}

//Lấy người biên dịch theo ID
export const getNguoiBienDichById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            })
        }

        const data = await prisma.nguoibiendich.findUnique({
            where: { nguoi_bien_dich_id: parseInt(id) }
        })

        //Kiểm tra xem người biên dịch có tồn tại trong DB không
        if (!data) {
            return res.status(404).json({
                message: "Không có người biên dịch nào trong hệ thống",
                success: false,
                data: []
            })
        }

        return res.status(200).json({
            message: "Lấy người biên dịch thành công",
            success: true,
            data: data
        })
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        })
    }
}

//Tạo người biên dịch
export const createNguoiBienDich = async (req, res) => {
    try {
        const { ten_nguoi_bien_dich } = req.body;

        //Kiểm tra tên người biên dịch có được cung cấp không
        if (!ten_nguoi_bien_dich) {
            return res.status(400).json({
                message: "Tên người biên dịch không được để trống",
                success: false
            })
        }

        //Kiểm tra tên người biên dịch có đúng định dạng không (hỗ trợ tiếng Việt)
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_nguoi_bien_dich)) {
            return res.status(400).json({
                message: "Tên người biên dịch không hợp lệ",
                success: false
            })
        }

        //Kiểm tra trùng tên người biên dịch
        const duplicateNguoiBienDich = await prisma.nguoibiendich.findFirst({
            where: { ten_nguoi_bien_dich }
        })

        if (duplicateNguoiBienDich) {
            return res.status(400).json({
                message: "Tên người biên dịch đã tồn tại",
                success: false
            })
        }

        //Tạo người biên dịch trong DB
        const data = await prisma.nguoibiendich.create({
            data: { ten_nguoi_bien_dich }
        })

        return res.status(200).json({
            message: "Tạo người biên dịch thành công",
            success: true,
            data: data
        })
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        })
    }
}

//Cập nhật người biên dịch
export const updateNguoiBienDich = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_nguoi_bien_dich } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            })
        }

        //Kiểm tra tên người biên dịch có được cung cấp không
        if (!ten_nguoi_bien_dich) {
            return res.status(400).json({
                message: "Tên người biên dịch không được để trống",
                success: false
            })
        }

        //Kiểm tra tên người biên dịch có đúng định dạng không (hỗ trợ tiếng Việt)
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_nguoi_bien_dich)) {
            return res.status(400).json({
                message: "Tên người biên dịch không hợp lệ",
                success: false
            })
        }

        //Kiểm tra người biên dịch có tồn tại trong DB không
        const existingNguoiBienDich = await prisma.nguoibiendich.findUnique({
            where: { nguoi_bien_dich_id: parseInt(id) }
        })

        if (!existingNguoiBienDich) {
            return res.status(404).json({
                message: "Không có người biên dịch nào trong hệ thống",
                success: false,
                data: []
            })
        }

        //Kiểm tra trùng tên người biên dịch (loại trừ chính nó)
        const duplicateNguoiBienDich = await prisma.nguoibiendich.findFirst({
            where: { ten_nguoi_bien_dich, NOT: { nguoi_bien_dich_id: parseInt(id) } }
        })

        if (duplicateNguoiBienDich) {
            return res.status(400).json({
                message: "Tên người biên dịch đã tồn tại",
                success: false
            })
        }

        //Cập nhật người biên dịch trong DB
        const data = await prisma.nguoibiendich.update({
            where: { nguoi_bien_dich_id: parseInt(id) },
            data: { ten_nguoi_bien_dich }
        })

        return res.status(200).json({
            message: "Cập nhật người biên dịch thành công",
            success: true,
            data: data
        })
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        })
    }
}

//Xóa người biên dịch
export const deleteNguoiBienDich = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            })
        }

        //Kiểm tra người biên dịch có tồn tại trong DB không
        const existingNguoiBienDich = await prisma.nguoibiendich.findUnique({
            where: { nguoibiendich_id: parseInt(id) }
        })

        if (!existingNguoiBienDich) {
            return res.status(404).json({
                message: "Không có người biên dịch nào trong hệ thống",
                success: false,
                data: []
            })
        }

        //Kiểm tra xem có sách nào đang sử dụng người biên dịch này không
        const sachUsingNguoiBienDich = await prisma.sach.findFirst({
            where: { nguoi_bien_dich_id: parseInt(id) }
        })

        if (sachUsingNguoiBienDich) {
            return res.status(400).json({
                message: "Không thể xóa người biên dịch này vì đang có sách sử dụng",
                success: false,
                data: null
            })
        }

        //Xóa người biên dịch trong DB
        const data = await prisma.nguoibiendich.delete({
            where: { nguoibiendich_id: parseInt(id) }
        })

        return res.status(200).json({
            message: "Xóa người biên dịch thành công",
            success: true,
            data: data
        })
    }
    catch (error) {
        //Xử lý lỗi foreign key constraint khi xóa
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa người biên dịch này vì đang có dữ liệu liên quan",
                success: false,
                error: error.message
            })
        }
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        })
    }
}