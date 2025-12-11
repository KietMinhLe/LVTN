import prisma from "../config/db.js";

export const getAllNhaCungCap = async (req, res) => {
    try {
        const data = await prisma.nhacungcap.findMany();

        // Kiểm tra nhà cung cấp có tồn tại hay không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có nhà cung cấp nào trong hệ thống",
                success: false,
                data: []
            });
        }

        //Trả về dữ liệu
        return res.status(200).json({
            message: "Lấy tất cả nhà cung cấp thành công",
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

//Tìm kiếm nhà cung cấp
export const searchNhaCungCap = async (req, res) => {
    try {
        const { ten_nha_cung_cap } = req.query;

        //Kiểm tra tên nhà cung cấp có được cung cấp không
        if (!ten_nha_cung_cap) {
            return res.status(400).json({
                message: "Tên nhà cung cấp không được để trống",
                success: false
            });
        }

        // Tìm kiếm nhà cung cấp (hỗ trợ tiếng Việt)
        const data = await prisma.nhacungcap.findMany({
            where: {
                ten_nha_cung_cap: {
                    contains: ten_nha_cung_cap.trim()
                }
            }
        });

        //Kiểm tra nhà cung cấp có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có nhà cung cấp nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Tìm kiếm nhà cung cấp thành công",
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

//Tìm theo số điện thoại
export const searchNhaCungCapBySdt = async (req, res) => {
    try {
        const { sdt } = req.query;

        //Kiểm tra số điện thoại có được cung cấp không
        if (!sdt) {
            return res.status(400).json({
                message: "Số điện thoại không được để trống",
                success: false
            });
        }

        // Validate số điện thoại (10-11 chữ số)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(sdt.trim())) {
            return res.status(400).json({
                message: "Số điện thoại không hợp lệ (10-11 chữ số)",
                success: false
            });
        }

        // Tìm kiếm nhà cung cấp theo số điện thoại
        const data = await prisma.nhacungcap.findMany({
            where: {
                sdt: {
                    contains: sdt.trim()
                }
            }
        });

        //Kiểm tra nhà cung cấp có tồn tại trong DB không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có nhà cung cấp nào trong hệ thống",
                success: false,
                data: []
            });
        }

        return res.status(200).json({
            message: "Tìm kiếm nhà cung cấp theo số điện thoại thành công",
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

//Tìm kiếm nhà cung cấp theo ID
export const getNhaCungCapById = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra nhà cung cấp có tồn tại trong DB không
        const data = await prisma.nhacungcap.findUnique({
            where: { nha_cung_cap_id: parseInt(id) }
        });

        //Kiểm tra nhà cung cấp có tồn tại trong DB không
        if (!data) {
            return res.status(404).json({
                message: "Không có nhà cung cấp nào trong hệ thống",
                success: false,
                data: null
            });
        }
        return res.status(200).json({
            message: "Lấy nhà cung cấp thành công",
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

//Tạo nhà cung cấp
export const createNhaCungCap = async (req, res) => {
    try {
        const { ten_nha_cung_cap, email, dia_chi, sdt } = req.body;

        if (!ten_nha_cung_cap) {
            return res.status(400).json({
                message: "Tên nhà cung cấp không được để trống",
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

        //Kiểm tra tên nhà cung cấp có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (ten_nha_cung_cap && !/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_nha_cung_cap)) {
            return res.status(400).json({
                message: "Tên nhà cung cấp không hợp lệ",
                success: false
            });
        }

        //Kiểm tra địa chỉ có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (dia_chi && !/^[a-zA-Z0-9\sÀ-ỹ,.-]+$/.test(dia_chi)) {
            return res.status(400).json({
                message: "Địa chỉ không hợp lệ",
                success: false
            });
        }

        //Kiểm tra số điện thoại có đúng định dạng không (10-11 chữ số)
        if (sdt && !/^[0-9]{10,11}$/.test(sdt)) {
            return res.status(400).json({
                message: "Số điện thoại phải có 10-11 chữ số",
                success: false
            });
        }

        //Kiểm tra email đã tồn tại chưa
        const existingEmail = await prisma.nhacungcap.findFirst({
            where: { email },
        });

        if (existingEmail) {
            return res.status(400).json({
                message: "Email đã tồn tại",
                success: false
            });
        }

        //Kiểm tra nhà cung cấp có tồn tại trong DB không
        const existing = await prisma.nhacungcap.findFirst({
            where: { ten_nha_cung_cap },
        })

        //Kiểm tra nhà cung cấp có tồn tại trong DB không
        if (existing) {
            return res.status(400).json({
                message: "Nhà cung cấp đã tồn tại",
                success: false
            });
        }

        //Tạo nhà cung cấp trong DB
        const data = await prisma.nhacungcap.create({
            data: {
                ten_nha_cung_cap,
                email,
                dia_chi,
                sdt
            }
        });

        return res.status(200).json({
            message: "Tạo nhà cung cấp thành công",
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

//Cập nhật nhà cung cấp
export const updateNhaCungCap = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_nha_cung_cap, email, dia_chi, sdt } = req.body;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra nhà cung cấp có tồn tại trong DB không
        const existing = await prisma.nhacungcap.findUnique({
            where: { nha_cung_cap_id: parseInt(id) }
        });

        //Kiểm tra nhà cung cấp có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có nhà cung cấp nào trong hệ thống",
                success: false,
                data: null
            });
        }

        //Kiểm tra nhập liệu có hợp lệ không
        if (!ten_nha_cung_cap) {
            return res.status(400).json({
                message: "Tên nhà cung cấp không được để trống",
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

        //Kiểm tra tên nhà cung cấp có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (ten_nha_cung_cap && !/^[a-zA-Z0-9\sÀ-ỹ]+$/.test(ten_nha_cung_cap)) {
            return res.status(400).json({
                message: "Tên nhà cung cấp không hợp lệ",
                success: false
            });
        }

        //Kiểm tra địa chỉ có đúng định dạng không (cho phép tiếng Việt có dấu)
        if (dia_chi && !/^[a-zA-Z0-9\sÀ-ỹ,.-]+$/.test(dia_chi)) {
            return res.status(400).json({
                message: "Địa chỉ không hợp lệ",
                success: false
            });
        }

        //Kiểm tra số điện thoại có đúng định dạng không (10-11 chữ số)
        if (sdt && !/^[0-9]{10,11}$/.test(sdt)) {
            return res.status(400).json({
                message: "Số điện thoại phải có 10-11 chữ số",
                success: false
            });
        }

        //Kiểm tra trùng email (loại trừ chính nó)
        const existingEmail = await prisma.nhacungcap.findFirst({
            where: {
                email,
                NOT: { nha_cung_cap_id: parseInt(id) }
            }
        });

        if (existingEmail) {
            return res.status(400).json({
                message: "Email đã tồn tại",
                success: false
            });
        }

        //Kiểm tra trùng tên nhà cung cấp
        const existingNhaCungCap = await prisma.nhacungcap.findFirst({
            where: {
                ten_nha_cung_cap,
                NOT: { nha_cung_cap_id: parseInt(id) }
            }
        });

        //Kiểm tra trùng tên nhà cung cấp
        if (existingNhaCungCap) {
            return res.status(400).json({
                message: "Tên nhà cung cấp đã tồn tại",
                success: false
            });
        }

        //Cập nhật nhà cung cấp trong DB
        const data = await prisma.nhacungcap.update({
            where: { nha_cung_cap_id: parseInt(id) },
            data: {
                ten_nha_cung_cap,
                email,
                dia_chi,
                sdt
            }
        });

        return res.status(200).json({
            message: "Cập nhật nhà cung cấp thành công",
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

//Xóa nhà cung cấp
export const deleteNhaCungCap = async (req, res) => {
    try {
        const { id } = req.params;

        //Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        //Kiểm tra nhà cung cấp có tồn tại trong DB không
        const existing = await prisma.nhacungcap.findUnique({
            where: { nha_cung_cap_id: parseInt(id) }
        });

        //Kiểm tra nhà cung cấp có tồn tại trong DB không
        if (!existing) {
            return res.status(404).json({
                message: "Không có nhà cung cấp nào trong hệ thống",
                success: false,
                data: null
            });
        }

        //Xóa nhà cung cấp trong DB
        const data = await prisma.nhacungcap.delete({
            where: { nha_cung_cap_id: parseInt(id) }
        });

        return res.status(200).json({
            message: "Xóa nhà cung cấp thành công",
            success: true,
            data: data
        });
    } catch (error) {
        //Xử lý lỗi foreign key constraint khi xóa
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa nhà cung cấp này vì đang có dữ liệu liên quan",
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

//Sắp xếp nhà cung cấp
export const sortNhaCungCap = async (req, res) => {
    try {
        //Lấy tham số sortBy và order từ query params
        //sortBy: tên trường cần sắp xếp (ten_nha_cung_cap, ngay_tao)
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

        // Validate order phải là 'asc' hoặc 'desc'
        if (order !== 'asc' && order !== 'desc') {
            return res.status(400).json({
                success: false,
                message: "Order phải là 'asc' hoặc 'desc'",
                data: []
            });
        }

        // Validate sortBy - chỉ cho phép sắp xếp theo các trường hợp lệ
        const allowedSortFields = ['ten_nha_cung_cap', 'ngay_tao']; //Có thể sắp xếp theo tên nhà cung cấp và ngày tạo
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
        const data = await prisma.nhacungcap.findMany({
            orderBy: orderBy
        });

        return res.status(200).json({
            success: true,
            message: `Sắp xếp nhà cung cấp theo ${sortBy} ${order === 'asc' ? 'tăng dần' : 'giảm dần'} thành công`,
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