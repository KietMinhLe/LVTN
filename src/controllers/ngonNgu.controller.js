import prisma from "../config/db.js";

//Lấy tất cả ngôn ngữ
export const getAllNgonNgu = async (req, res) => {
    try {
        const data = await prisma.ngonngu.findMany();

        //Kiểm tra xem có ngôn ngữ nào không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có ngôn ngữ nào trong hệ thống",
                success: false,
                data: []
            })
        }

        return res.status(200).json({
            message: "Lấy tất cả ngôn ngữ thành công",
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

//Sắp xếp ngôn ngữ
export const sortNgonNgu = async (req, res) => {
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
        if (!['ngon_ngu_id', 'ten_ngon_ngu', 'ma_ngon_ngu', 'ngay_tao'].includes(sortBy)) {
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
        const data = await prisma.ngonngu.findMany({
            orderBy: orderBy
        })

        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có ngôn ngữ nào trong hệ thống",
                success: false,
                data: []
            })
        }

        return res.status(200).json({
            message: "Sắp xếp ngôn ngữ thành công",
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

//Lấy ngôn ngữ theo ID
export const getNgonNguById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            })
        }

        //Lấy ngôn ngữ theo ID
        const data = await prisma.ngonngu.findUnique({
            where: { ngon_ngu_id: parseInt(id) }
        })

        //Kiểm tra ngôn ngữ có tồn tại trong DB không
        if (!data) {
            return res.status(404).json({
                message: "Không có ngôn ngữ nào trong hệ thống",
                success: false,
                data: []
            })
        }

        return res.status(200).json({
            message: "Lấy ngôn ngữ thành công",
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

//Tạo ngôn ngữ
export const createNgonNgu = async (req, res) => {
    try {
        const { ten_ngon_ngu, ma_ngon_ngu } = req.body;

        //Kiểm tra tên ngôn ngữ có được cung cấp không
        if (!ten_ngon_ngu || !ten_ngon_ngu.trim()) {
            return res.status(400).json({
                message: "Tên ngôn ngữ không được để trống",
                success: false
            })
        }

        //Kiểm tra mã ngôn ngữ có được cung cấp không
        if (!ma_ngon_ngu || !ma_ngon_ngu.trim()) {
            return res.status(400).json({
                message: "Mã ngôn ngữ không được để trống",
                success: false
            })
        }

        //Kiểm tra tên ngôn ngữ có đúng định dạng không
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_ngon_ngu.trim())) {
            return res.status(400).json({
                message: "Tên ngôn ngữ không hợp lệ",
                success: false
            })
        }

        //Kiểm tra mã ngôn ngữ có đúng định dạng không (chỉ chữ cái, số, gạch ngang, gạch dưới)
        if (!/^[a-zA-Z0-9_-]+$/.test(ma_ngon_ngu.trim())) {
            return res.status(400).json({
                message: "Mã ngôn ngữ không hợp lệ (chỉ cho phép chữ cái, số, gạch ngang và gạch dưới)",
                success: false
            })
        }

        //Kiểm tra trùng tên ngôn ngữ
        const existingNgonNguByName = await prisma.ngonngu.findFirst({
            where: { ten_ngon_ngu: ten_ngon_ngu.trim() }
        })

        if (existingNgonNguByName) {
            return res.status(400).json({
                message: "Tên ngôn ngữ đã tồn tại",
                success: false
            })
        }

        //Kiểm tra trùng mã ngôn ngữ
        const existingNgonNguByCode = await prisma.ngonngu.findFirst({
            where: { ma_ngon_ngu: ma_ngon_ngu.trim() }
        })

        if (existingNgonNguByCode) {
            return res.status(400).json({
                message: "Mã ngôn ngữ đã tồn tại",
                success: false
            })
        }

        //Tạo ngôn ngữ trong DB
        const data = await prisma.ngonngu.create({
            data: {
                ten_ngon_ngu: ten_ngon_ngu.trim(),
                ma_ngon_ngu: ma_ngon_ngu.trim()
            }
        })

        return res.status(200).json({
            message: "Tạo ngôn ngữ thành công",
            success: true,
            data: data
        })
    }
    catch (error) {
        // Xử lý lỗi unique constraint
        if (error.code === 'P2002') {
            return res.status(400).json({
                message: "Tên ngôn ngữ hoặc mã ngôn ngữ đã tồn tại",
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

//Cập nhật ngôn ngữ
export const updateNgonNgu = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_ngon_ngu, ma_ngon_ngu } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            })
        }

        //Kiểm tra ngôn ngữ có tồn tại trong DB không
        const existingNgonNgu = await prisma.ngonngu.findUnique({
            where: { ngon_ngu_id: parseInt(id) }
        })

        if (!existingNgonNgu) {
            return res.status(404).json({
                message: "Ngôn ngữ không tồn tại",
                success: false,
                data: null
            })
        }

        // Xây dựng dữ liệu cập nhật
        const updateData = {};

        if (ten_ngon_ngu !== undefined) {
            if (!ten_ngon_ngu || !ten_ngon_ngu.trim()) {
                return res.status(400).json({
                    message: "Tên ngôn ngữ không được để trống",
                    success: false
                })
            }

            //Kiểm tra tên ngôn ngữ có đúng định dạng không
            if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_ngon_ngu.trim())) {
                return res.status(400).json({
                    message: "Tên ngôn ngữ không hợp lệ",
                    success: false
                })
            }

            //Kiểm tra trùng tên ngôn ngữ (loại trừ chính nó)
            const duplicateNgonNguByName = await prisma.ngonngu.findFirst({
                where: {
                    ten_ngon_ngu: ten_ngon_ngu.trim(),
                    NOT: { ngon_ngu_id: parseInt(id) }
                }
            })

            if (duplicateNgonNguByName) {
                return res.status(400).json({
                    message: "Tên ngôn ngữ đã tồn tại",
                    success: false
                })
            }

            updateData.ten_ngon_ngu = ten_ngon_ngu.trim();
        }

        if (ma_ngon_ngu !== undefined) {
            if (!ma_ngon_ngu || !ma_ngon_ngu.trim()) {
                return res.status(400).json({
                    message: "Mã ngôn ngữ không được để trống",
                    success: false
                })
            }

            //Kiểm tra mã ngôn ngữ có đúng định dạng không
            if (!/^[a-zA-Z0-9_-]+$/.test(ma_ngon_ngu.trim())) {
                return res.status(400).json({
                    message: "Mã ngôn ngữ không hợp lệ (chỉ cho phép chữ cái, số, gạch ngang và gạch dưới)",
                    success: false
                })
            }

            //Kiểm tra trùng mã ngôn ngữ (loại trừ chính nó)
            const duplicateNgonNguByCode = await prisma.ngonngu.findFirst({
                where: {
                    ma_ngon_ngu: ma_ngon_ngu.trim(),
                    NOT: { ngon_ngu_id: parseInt(id) }
                }
            })

            if (duplicateNgonNguByCode) {
                return res.status(400).json({
                    message: "Mã ngôn ngữ đã tồn tại",
                    success: false
                })
            }

            updateData.ma_ngon_ngu = ma_ngon_ngu.trim();
        }

        // Nếu không có dữ liệu nào để cập nhật
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "Không có dữ liệu nào để cập nhật",
                success: false
            })
        }

        // Thêm ngày cập nhật
        updateData.ngay_cap_nhat = new Date();

        //Cập nhật ngôn ngữ trong DB
        const data = await prisma.ngonngu.update({
            where: { ngon_ngu_id: parseInt(id) },
            data: updateData
        })

        return res.status(200).json({
            message: "Cập nhật ngôn ngữ thành công",
            success: true,
            data: data
        })
    }
    catch (error) {
        // Xử lý lỗi unique constraint
        if (error.code === 'P2002') {
            return res.status(400).json({
                message: "Tên ngôn ngữ hoặc mã ngôn ngữ đã tồn tại",
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

//Tìm kiếm ngôn ngữ
export const searchNgonNgu = async (req, res) => {
    try {
        const { ten_ngon_ngu, ma_ngon_ngu } = req.query;

        // Kiểm tra có ít nhất một tham số tìm kiếm
        if (!ten_ngon_ngu && !ma_ngon_ngu) {
            return res.status(400).json({
                message: "Vui lòng cung cấp ít nhất một tham số tìm kiếm (ten_ngon_ngu hoặc ma_ngon_ngu)",
                success: false
            })
        }

        // Xây dựng điều kiện tìm kiếm
        const whereClause = {};

        if (ten_ngon_ngu) {
            whereClause.ten_ngon_ngu = {
                contains: ten_ngon_ngu.trim()
            }
        }

        if (ma_ngon_ngu) {
            whereClause.ma_ngon_ngu = {
                contains: ma_ngon_ngu.trim()
            }
        }

        // Tìm kiếm ngôn ngữ
        const data = await prisma.ngonngu.findMany({
            where: whereClause
        })

        //Kiểm tra ngôn ngữ có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy ngôn ngữ nào phù hợp",
                success: false,
                data: []
            })
        }

        return res.status(200).json({
            message: "Tìm kiếm ngôn ngữ thành công",
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

//Xóa ngôn ngữ
export const deleteNgonNgu = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            })
        }

        //Kiểm tra ngôn ngữ có tồn tại trong DB không
        const existingNgonNgu = await prisma.ngonngu.findUnique({
            where: { ngon_ngu_id: parseInt(id) }
        })

        if (!existingNgonNgu) {
            return res.status(404).json({
                message: "Không có ngôn ngữ nào trong hệ thống",
                success: false,
                data: []
            })
        }

        //Kiểm tra xem có sách nào đang sử dụng ngôn ngữ này không
        const sachUsingNgonNgu = await prisma.sach.findFirst({
            where: { ngon_ngu_id: parseInt(id) }
        })

        if (sachUsingNgonNgu) {
            return res.status(400).json({
                message: "Không thể xóa ngôn ngữ này vì đang có sách sử dụng",
                success: false,
                data: null
            })
        }

        //Xóa ngôn ngữ trong DB
        const data = await prisma.ngonngu.delete({
            where: { ngon_ngu_id: parseInt(id) }
        })

        return res.status(200).json({
            message: "Xóa ngôn ngữ thành công",
            success: true,
            data: data
        })
    }
    catch (error) {
        //Xử lý lỗi foreign key constraint khi xóa
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa ngôn ngữ này vì đang có dữ liệu liên quan",
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