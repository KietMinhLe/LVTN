import prisma from "../config/db.js";

//Lấy tất cả độ tuổi
export const getAllDoTuoi = async (req, res) => {
    try {
        const data = await prisma.dotuoi.findMany();

        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có độ tuổi nào trong hệ thống",
                success: false,
                data: []
            })
        }

        return res.status(200).json({
            message: "Lấy tất cả độ tuổi thành công",
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

//Sắp xếp độ tuổi
export const sortDoTuoi = async (req, res) => {
    try {
        const { sortBy, order } = req.query;

        if (!sortBy || !order) {
            return res.status(400).json({
                message: "Thiếu tham số sortBy hoặc order",
                success: false
            })
        }

        if (!['do_tuoi_id', 'ten_do_tuoi', 'ngay_tao'].includes(sortBy)) {
            return res.status(400).json({
                message: "Tham số sortBy không hợp lệ",
                success: false
            })
        }

        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: "Tham số order không hợp lệ",
                success: false
            })
        }

        const orderBy = {};
        orderBy[sortBy] = order;


        const data = await prisma.dotuoi.findMany({
            orderBy: orderBy
        })

        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có độ tuổi nào trong hệ thống",
                success: false,
                data: []
            })
        }

        return res.status(200).json({
            message: "Sắp xếp độ tuổi thành công",
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

//Lấy độ tuổi theo ID
export const getDoTuoiById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            })
        }

        const data = await prisma.dotuoi.findUnique({
            where: {
                do_tuoi_id: parseInt(id)
            }
        })

        if (!data) {
            return res.status(404).json({
                message: "Không có độ tuổi nào trong hệ thống",
                success: false,
                data: []
            })
        }

        return res.status(200).json({
            message: "Lấy độ tuổi thành công",
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

//Tạo độ tuổi
export const createDoTuoi = async (req, res) => {
    try {
        const { ten_do_tuoi } = req.body;

        //Kiểm tra tên độ tuổi có được cung cấp không
        if (!ten_do_tuoi) {
            return res.status(400).json({
                message: "Tên độ tuổi không được để trống",
                success: false
            })
        }

        //Kiểm tra tên độ tuổi có đúng định dạng không
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_do_tuoi)) {
            return res.status(400).json({
                message: "Tên độ tuổi không hợp lệ",
                success: false
            })
        }

        //Kiểm tra trùng tên độ tuổi
        const existingDoTuoi = await prisma.dotuoi.findFirst({
            where: { ten_do_tuoi }
        })

        //Kiểm tra đã tồn tại độ tuổi trong DB không
        if (existingDoTuoi) {
            return res.status(400).json({
                message: "Tên độ tuổi đã tồn tại",
                success: false
            })
        }

        //Tạo độ tuổi trong DB
        const data = await prisma.dotuoi.create({
            data: {
                ten_do_tuoi
            }
        })

        return res.status(200).json({
            message: "Tạo độ tuổi thành công",
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

//Cập nhật độ tuổi
export const updateDoTuoi = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_do_tuoi } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            })
        }

        //Kiểm tra tên độ tuổi có được cung cấp Không
        if (!ten_do_tuoi) {
            return res.status(400).json({
                message: "Tên độ tuổi không được để trống",
                success: false,
                data: null
            })
        }

        //Kiểm tra tên độ tuổi có đúng định dạng không
        if (!/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_do_tuoi)) {
            return res.status(400).json({
                message: "Tên độ tuổi không hợp lệ",
                success: false
            })
        }

        //Kiểm tra độ tuổi có tồn tại trong DB không
        const existingDoTuoi = await prisma.dotuoi.findUnique({
            where: { do_tuoi_id: parseInt(id) }
        })

        if (!existingDoTuoi) {
            return res.status(404).json({
                message: "Không có độ tuổi nào trong hệ thống",
                success: false,
                data: null
            })
        }

        //Kiểm tra trùng tên độ tuổi (loại trừ chính nó)
        const duplicateDoTuoi = await prisma.dotuoi.findFirst({
            where: {
                ten_do_tuoi,
                NOT: { do_tuoi_id: parseInt(id) }
            }
        })

        if (duplicateDoTuoi) {
            return res.status(400).json({
                message: "Tên độ tuổi đã tồn tại",
                success: false
            })
        }

        //Cập nhật độ tuổi trong DB
        const data = await prisma.dotuoi.update({
            where: { do_tuoi_id: parseInt(id) },
            data: {
                ten_do_tuoi
            }
        })

        return res.status(200).json({
            message: "Cập nhật độ tuổi thành công",
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

//Xóa độ tuổi
export const deleteDoTuoi = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            })
        }

        //Kiểm tra độ tuổi có tồn tại trong DB không
        const existingDoTuoi = await prisma.dotuoi.findUnique({
            where: { do_tuoi_id: parseInt(id) }
        })

        if (!existingDoTuoi) {
            return res.status(404).json({
                message: "Không có độ tuổi nào trong hệ thống",
                success: false,
                data: null
            })
        }

        //Kiểm tra xem có sách nào đang sử dụng độ tuổi này không
        const sachUsingDoTuoi = await prisma.sach.findFirst({
            where: { do_tuoi_id: parseInt(id) }
        })

        if (sachUsingDoTuoi) {
            return res.status(400).json({
                message: "Không thể xóa độ tuổi này vì đang có sách sử dụng",
                success: false,
                data: null
            })
        }

        //Xóa độ tuổi trong DB
        const data = await prisma.dotuoi.delete({
            where: { do_tuoi_id: parseInt(id) }
        })

        return res.status(200).json({
            message: "Xóa độ tuổi thành công",
            success: true,
            data: data
        })
    } catch (error) {
        //Xử lý lỗi foreign key constraint khi xóa
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa độ tuổi này vì đang có dữ liệu liên quan",
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