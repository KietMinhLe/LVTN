import prisma from "../config/db.js"; // Import Prisma Client để thao tác với database

// Lấy tất cả ảnh sách trong hệ thống
export const getAllAnhSach = async (req, res) => {
    try {
        // Query lấy tất cả ảnh sách kèm thông tin sách liên quan
        const data = await prisma.anhsach.findMany({
            include: {
                sach: true // Include thông tin sách để biết ảnh thuộc sách nào
            }
        });

        // Kiểm tra xem có ảnh sách nào không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có ảnh sách nào trong hệ thống",
                success: false,
                data: []
            });
        }

        // Trả về danh sách ảnh sách thành công
        return res.status(200).json({
            message: "Lấy tất cả ảnh sách thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Lấy thông tin ảnh sách theo ID
export const getAnhSachById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL params

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        // Query lấy ảnh sách theo ID kèm thông tin sách
        const data = await prisma.anhsach.findUnique({
            where: { anh_sach_id: parseInt(id) }, // Chuyển ID sang số nguyên
            include: {
                sach: true // Include thông tin sách để biết ảnh thuộc sách nào
            }
        });

        // Kiểm tra xem có dữ liệu không
        if (!data) {
            return res.status(404).json({
                message: "Không có ảnh sách nào trong hệ thống",
                success: false,
                data: null
            });
        }

        // Trả về thông tin ảnh sách thành công
        return res.status(200).json({
            message: "Lấy ảnh sách thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Lấy tất cả ảnh của một sách theo sach_id
export const getAnhSachBySachId = async (req, res) => {
    try {
        const { sach_id } = req.params; // Lấy ID sách từ URL params

        // Kiểm tra sach_id có được cung cấp không và phải là số
        if (!sach_id || isNaN(sach_id)) {
            return res.status(400).json({
                message: "ID sách không được để trống và phải là số",
                success: false
            });
        }

        // Query lấy tất cả ảnh của sách, sắp xếp theo thứ tự
        const data = await prisma.anhsach.findMany({
            where: { sach_id: parseInt(sach_id) }, // Tìm tất cả ảnh của sách này
            include: {
                sach: true // Include thông tin sách
            },
            orderBy: {
                thu_tu: 'asc' // Sắp xếp theo thứ tự tăng dần (ảnh đầu tiên đến cuối cùng)
            }
        });

        // Kiểm tra xem có dữ liệu không
        if (data.length === 0) {
            return res.status(404).json({
                message: "Không có ảnh sách nào cho sách này",
                success: false,
                data: []
            });
        }

        // Trả về danh sách ảnh thành công
        return res.status(200).json({
            message: "Lấy ảnh sách theo sách thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Upload nhiều ảnh sách từ file (sử dụng multer middleware)
export const uploadManyAnhSach = async (req, res) => {
    try {
        const { sach_id } = req.body; // Lấy ID sách từ form data
        const files = req.files; // Lấy danh sách file đã upload (từ multer)

        // Kiểm tra dữ liệu bắt buộc (sách ID)
        if (!sach_id) {
            return res.status(400).json({
                message: "Sách ID không được để trống",
                success: false
            });
        }

        // Kiểm tra sach_id có phải là số không
        if (isNaN(sach_id)) {
            return res.status(400).json({
                message: "Sách ID phải là số",
                success: false
            });
        }

        // Kiểm tra có file nào được upload không
        if (!files || files.length === 0) {
            return res.status(400).json({
                message: "Vui lòng chọn ít nhất một ảnh",
                success: false
            });
        }

        // Kiểm tra sách có tồn tại không (đảm bảo sách hợp lệ trước khi thêm ảnh)
        const existingSach = await prisma.sach.findUnique({
            where: { sach_id: parseInt(sach_id) }
        });

        if (!existingSach) {
            return res.status(404).json({
                message: "Sách không tồn tại",
                success: false,
                data: null
            });
        }

        // Tạo dữ liệu ảnh từ các file đã upload (map qua từng file)
        const imageData = files.map((file, index) => ({
            sach_id: parseInt(sach_id),                    // ID sách
            url: `/uploads/images/${file.filename}`,       // Đường dẫn ảnh (file đã được lưu bởi multer)
            loai: "gallery",                               // Loại ảnh (mặc định là gallery)
            thu_tu: index,                                 // Thứ tự ảnh (theo thứ tự upload)
            mo_ta: null                                    // Mô tả (có thể thêm sau)
        }));

        // Tạo nhiều ảnh sách trong database cùng lúc (bulk insert)
        const data = await prisma.anhsach.createMany({
            data: imageData
        });

        // Lấy lại danh sách ảnh vừa tạo để trả về client (bao gồm ID tự động)
        const createdImages = await prisma.anhsach.findMany({
            where: {
                sach_id: parseInt(sach_id),
                url: { in: imageData.map(img => img.url) } // Tìm các ảnh vừa tạo bằng URL
            },
            include: {
                sach: true // Include thông tin sách
            },
            orderBy: {
                thu_tu: 'asc' // Sắp xếp theo thứ tự tăng dần
            }
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: `Upload ${data.count} ảnh sách thành công`,
            success: true,
            data: createdImages,
            count: data.count // Số lượng ảnh đã upload
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Tạo nhiều ảnh sách cùng lúc từ URL (không upload file, chỉ lưu URL)
export const createManyAnhSach = async (req, res) => {
    try {
        const { sach_id, images } = req.body; // Lấy ID sách và mảng ảnh từ request body

        // Kiểm tra dữ liệu bắt buộc (sách ID)
        if (!sach_id) {
            return res.status(400).json({
                message: "Sách ID không được để trống",
                success: false
            });
        }

        // Kiểm tra sach_id có phải là số không
        if (isNaN(sach_id)) {
            return res.status(400).json({
                message: "Sách ID phải là số",
                success: false
            });
        }

        // Kiểm tra images có phải là mảng không và không rỗng
        if (!Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                message: "Danh sách ảnh phải là mảng và không được rỗng",
                success: false
            });
        }

        // Kiểm tra sách có tồn tại không
        const existingSach = await prisma.sach.findUnique({
            where: { sach_id: parseInt(sach_id) }
        });

        if (!existingSach) {
            return res.status(404).json({
                message: "Sách không tồn tại",
                success: false,
                data: null
            });
        }

        // Validate từng ảnh trong mảng (kiểm tra từng phần tử)
        const imageData = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];

            // Kiểm tra URL của ảnh (bắt buộc phải có và là string)
            if (!image.url || typeof image.url !== 'string' || image.url.trim() === '') {
                return res.status(400).json({
                    message: `Ảnh thứ ${i + 1}: URL không hợp lệ`,
                    success: false
                });
            }

            // Kiểm tra loại ảnh nếu có (phải là string)
            if (image.loai && typeof image.loai !== 'string') {
                return res.status(400).json({
                    message: `Ảnh thứ ${i + 1}: Loại không hợp lệ`,
                    success: false
                });
            }

            // Kiểm tra thứ tự ảnh (nếu có thì phải là số)
            let parsedThuTu = i; // Mặc định thứ tự theo index trong mảng
            if (image.thu_tu !== undefined && image.thu_tu !== null && image.thu_tu !== '') {
                parsedThuTu = parseInt(image.thu_tu, 10);
                if (Number.isNaN(parsedThuTu)) {
                    return res.status(400).json({
                        message: `Ảnh thứ ${i + 1}: Thứ tự phải là số`,
                        success: false
                    });
                }
            }

            // Thêm dữ liệu ảnh vào mảng sau khi validate
            imageData.push({
                sach_id: parseInt(sach_id),              // ID sách
                url: image.url.trim(),                   // URL ảnh (đã trim)
                loai: image.loai ? image.loai.trim() : "gallery", // Loại ảnh (mặc định gallery)
                thu_tu: parsedThuTu,                     // Thứ tự ảnh
                mo_ta: image.mo_ta ? image.mo_ta.trim() : null // Mô tả (nếu có)
            });
        }

        // Tạo nhiều ảnh sách trong database cùng lúc (bulk insert)
        const data = await prisma.anhsach.createMany({
            data: imageData
        });

        // Lấy lại danh sách ảnh vừa tạo để trả về (bao gồm ID tự động)
        const createdImages = await prisma.anhsach.findMany({
            where: {
                sach_id: parseInt(sach_id),
                url: { in: imageData.map(img => img.url) } // Tìm bằng danh sách URL
            },
            include: {
                sach: true // Include thông tin sách
            },
            orderBy: {
                thu_tu: 'asc' // Sắp xếp theo thứ tự tăng dần
            }
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: `Tạo ${data.count} ảnh sách thành công`,
            success: true,
            data: createdImages,
            count: data.count // Số lượng ảnh đã tạo
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Tạo một ảnh sách mới (từ URL)
export const createAnhSach = async (req, res) => {
    try {
        const { sach_id, url, loai, thu_tu, mo_ta } = req.body; // Lấy dữ liệu từ request body

        // Kiểm tra dữ liệu bắt buộc (sách ID và URL)
        if (!sach_id || !url) {
            return res.status(400).json({
                message: "Sách ID và URL không được để trống",
                success: false
            });
        }

        // Kiểm tra sach_id có phải là số không
        if (isNaN(sach_id)) {
            return res.status(400).json({
                message: "Sách ID phải là số",
                success: false
            });
        }

        // Kiểm tra sách có tồn tại không
        const existingSach = await prisma.sach.findUnique({
            where: { sach_id: parseInt(sach_id) }
        });

        if (!existingSach) {
            return res.status(404).json({
                message: "Sách không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra URL có đúng định dạng không (phải là string và không rỗng)
        if (typeof url !== 'string' || url.trim() === '') {
            return res.status(400).json({
                message: "URL không hợp lệ",
                success: false
            });
        }

        // Kiểm tra loại ảnh nếu có (phải là string)
        if (loai && typeof loai !== 'string') {
            return res.status(400).json({
                message: "Loại không hợp lệ",
                success: false
            });
        }

        // Kiểm tra thứ tự ảnh (nếu có thì phải là số)
        let parsedThuTu = 0; // Mặc định là 0
        if (thu_tu !== undefined && thu_tu !== null && thu_tu !== '') {
            parsedThuTu = parseInt(thu_tu, 10);
            if (Number.isNaN(parsedThuTu)) {
                return res.status(400).json({
                    message: "Thứ tự phải là số",
                    success: false
                });
            }
        }

        // Tạo ảnh sách mới trong database
        const data = await prisma.anhsach.create({
            data: {
                sach_id: parseInt(sach_id),                    // ID sách
                url: url.trim(),                               // URL ảnh (đã trim)
                loai: loai ? loai.trim() : "gallery",         // Loại ảnh (mặc định gallery)
                thu_tu: parsedThuTu,                           // Thứ tự ảnh
                mo_ta: mo_ta ? mo_ta.trim() : null            // Mô tả (nếu có)
            },
            include: {
                sach: true // Include thông tin sách
            }
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: "Tạo ảnh sách thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Cập nhật thông tin ảnh sách
export const updateAnhSach = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID ảnh từ URL params
        const { sach_id, url, loai, thu_tu, mo_ta } = req.body; // Lấy dữ liệu cần cập nhật từ request body

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        // Kiểm tra ảnh sách có tồn tại không
        const existingAnhSach = await prisma.anhsach.findUnique({
            where: { anh_sach_id: parseInt(id) }
        });

        if (!existingAnhSach) {
            return res.status(404).json({
                message: "Ảnh sách không tồn tại",
                success: false,
                data: null
            });
        }

        // Kiểm tra sách có tồn tại không (nếu có sach_id trong body - cho phép chuyển ảnh sang sách khác)
        if (sach_id !== undefined && sach_id !== null) {
            if (isNaN(sach_id)) {
                return res.status(400).json({
                    message: "Sách ID phải là số",
                    success: false
                });
            }

            // Kiểm tra sách mới có tồn tại không
            const existingSach = await prisma.sach.findUnique({
                where: { sach_id: parseInt(sach_id) }
            });

            if (!existingSach) {
                return res.status(404).json({
                    message: "Sách không tồn tại",
                    success: false,
                    data: null
                });
            }
        }

        // Xây dựng object dữ liệu để cập nhật (chỉ cập nhật các trường được gửi lên)
        const updateData = {};

        // Cập nhật sách ID nếu có
        if (sach_id !== undefined && sach_id !== null) {
            updateData.sach_id = parseInt(sach_id);
        }

        // Cập nhật URL nếu có
        if (url !== undefined && url !== null) {
            if (typeof url !== 'string' || url.trim() === '') {
                return res.status(400).json({
                    message: "URL không hợp lệ",
                    success: false
                });
            }
            updateData.url = url.trim();
        }

        // Cập nhật loại ảnh nếu có
        if (loai !== undefined && loai !== null) {
            if (typeof loai !== 'string') {
                return res.status(400).json({
                    message: "Loại không hợp lệ",
                    success: false
                });
            }
            updateData.loai = loai.trim();
        }

        // Cập nhật thứ tự ảnh nếu có
        if (thu_tu !== undefined && thu_tu !== null && thu_tu !== '') {
            const parsedThuTu = parseInt(thu_tu, 10);
            if (Number.isNaN(parsedThuTu)) {
                return res.status(400).json({
                    message: "Thứ tự phải là số",
                    success: false
                });
            }
            updateData.thu_tu = parsedThuTu;
        }

        // Cập nhật mô tả nếu có (cho phép set null)
        if (mo_ta !== undefined) {
            updateData.mo_ta = mo_ta ? mo_ta.trim() : null;
        }

        // Cập nhật ảnh sách trong database
        const data = await prisma.anhsach.update({
            where: { anh_sach_id: parseInt(id) }, // Tìm ảnh theo ID
            data: updateData, // Dữ liệu cần cập nhật
            include: {
                sach: true // Include thông tin sách
            }
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: "Cập nhật ảnh sách thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Xóa tất cả ảnh sách của một sách theo sach_id
export const deleteAllAnhSachBySachId = async (req, res) => {
    try {
        const { sach_id } = req.params; // Lấy ID sách từ URL params

        // Kiểm tra sach_id có được cung cấp không và phải là số
        if (!sach_id || isNaN(sach_id)) {
            return res.status(400).json({
                message: "ID sách không được để trống và phải là số",
                success: false
            });
        }

        // Kiểm tra sách có tồn tại không
        const existingSach = await prisma.sach.findUnique({
            where: { sach_id: parseInt(sach_id) }
        });

        if (!existingSach) {
            return res.status(404).json({
                message: "Sách không tồn tại",
                success: false,
                data: null
            });
        }

        // Xóa tất cả ảnh sách của sách này (bulk delete)
        const data = await prisma.anhsach.deleteMany({
            where: { sach_id: parseInt(sach_id) } // Tìm tất cả ảnh của sách này
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: `Xóa ${data.count} ảnh sách thành công`,
            success: true,
            count: data.count // Số lượng ảnh đã xóa
        });
    } catch (error) {
        // Xử lý lỗi server
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

// Xóa một ảnh sách theo ID
export const deleteAnhSach = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID ảnh từ URL params

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        // Kiểm tra ảnh sách có tồn tại không
        const existingAnhSach = await prisma.anhsach.findUnique({
            where: { anh_sach_id: parseInt(id) }
        });

        if (!existingAnhSach) {
            return res.status(404).json({
                message: "Ảnh sách không tồn tại",
                success: false,
                data: null
            });
        }

        // Xóa ảnh sách trong database
        const data = await prisma.anhsach.delete({
            where: { anh_sach_id: parseInt(id) } // Tìm ảnh theo ID để xóa
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: "Xóa ảnh sách thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Xử lý lỗi foreign key constraint khi xóa (nếu có ràng buộc khóa ngoại)
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Không thể xóa ảnh sách này vì đang có dữ liệu liên quan",
                success: false,
                error: error.message
            });
        }
        // Xử lý lỗi server khác
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
}

