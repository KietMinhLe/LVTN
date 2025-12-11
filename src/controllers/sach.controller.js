import prisma from "../config/db.js"; // Import Prisma Client để thao tác với database

// Lấy tất cả sách trong hệ thống
export const getAllSach = async (req, res) => {
    try {
        // Query lấy tất cả sách kèm thông tin liên quan
        const data = await prisma.sach.findMany({
            include: {
                tacgia: true,           // Thông tin tác giả
                nhaxuatban: true,       // Thông tin nhà xuất bản
                thuonghieu: true,       // Thông tin thương hiệu
                nhacungcap: true,       // Thông tin nhà cung cấp
                ngonngu: true,          // Thông tin ngôn ngữ
                nguoibiendich: true,    // Thông tin người biên dịch
                dotuoi: true,           // Thông tin độ tuổi
                sach_danhmuc: {         // Danh mục của sách
                    include: {
                        danhmuc: true   // Chi tiết danh mục
                    }
                },
                anhsach: {              // Ảnh của sách
                    orderBy: {
                        thu_tu: 'asc'   // Sắp xếp theo thứ tự tăng dần
                    },
                    take: 1              // Chỉ lấy ảnh đầu tiên cho danh sách (tối ưu hiệu suất)
                }
            }
        });

        // Trả về danh sách sách thành công (kể cả khi rỗng)
        return res.status(200).json({
            message: data.length === 0 ? "Không có sách nào trong hệ thống" : "Lấy tất cả sách thành công",
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

// Sắp xếp danh sách sách theo tiêu chí
export const sortSach = async (req, res) => {
    try {
        const { sortBy, order } = req.query; // Lấy tham số sắp xếp từ query string

        // Kiểm tra tham số sortBy và order có được cung cấp không
        if (!sortBy || !order) {
            return res.status(400).json({
                message: "Thiếu tham số sortBy hoặc order",
                success: false
            });
        }

        // Kiểm tra tham số sortBy có hợp lệ không (chỉ cho phép các trường được định nghĩa)
        const allowedSortFields = ['sach_id', 'ten_sach', 'tacgia_id', 'nhaxuatban_id', 'thuonghieu_id', 'nhacungcap_id', 'danhmuc_id', 'ngay_tao'];
        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({
                message: "Tham số sortBy không hợp lệ",
                success: false
            });
        }

        // Kiểm tra tham số order có hợp lệ không (chỉ cho phép asc hoặc desc)
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: "Tham số order không hợp lệ",
                success: false
            });
        }

        // Xây dựng object orderBy để truyền vào Prisma
        const orderBy = {};
        orderBy[sortBy] = order; // Ví dụ: { ten_sach: 'asc' }

        // Lấy dữ liệu với sắp xếp
        const data = await prisma.sach.findMany({
            include: {
                tacgia: true,
                nhaxuatban: true,
                thuonghieu: true,
                nhacungcap: true,
                ngonngu: true,
                nguoibiendich: true,
                dotuoi: true,
                sach_danhmuc: {
                    include: {
                        danhmuc: true
                    }
                }
            },
            orderBy: orderBy
        });

        return res.status(200).json({
            message: "Sắp xếp sách thành công",
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

// Tìm kiếm sách (FULLTEXT trên tên sách + tác giả + danh mục, kèm fallback LIKE)
// Cần tạo index FULLTEXT một lần trên DB MySQL:
//  ALTER TABLE sach     ADD FULLTEXT INDEX ft_sach_ten      (ten_sach);
//  ALTER TABLE tacgia   ADD FULLTEXT INDEX ft_tacgia_ten    (ten_tac_gia);
//  ALTER TABLE danhmuc  ADD FULLTEXT INDEX ft_danhmuc_ten   (ten_danh_muc);
export const searchSach = async (req, res) => {
    try {
        // Hỗ trợ cả ?ten_sach= và ?keyword=
        const rawKeyword = (req.query.ten_sach || req.query.keyword || '').toString();
        let keyword = rawKeyword.trim();

        if (!keyword) {
            return res.status(400).json({
                message: "Từ khóa tìm kiếm không được để trống",
                success: false
            });
        }

        // Chuẩn hóa keyword: loại bỏ khoảng trắng thừa, chuyển về lowercase để tìm kiếm tốt hơn
        keyword = keyword.toLowerCase().replace(/\s+/g, ' ').trim();

        let sachIds = [];

        // Kiểm tra độ dài keyword để quyết định dùng FULLTEXT hay LIKE
        // FULLTEXT thường yêu cầu minimum word length >= 3-4 ký tự
        const useFulltext = keyword.length >= 3;

        if (useFulltext) {
            // Thử dùng FULLTEXT MATCH AGAINST trên:
            //  - ten_sach      (trọng số 3)
            //  - ten_tac_gia   (trọng số 2)
            //  - ten_danh_muc  (trọng số 1)
            try {
                // Tạo search term với wildcard cho BOOLEAN MODE để tìm kiếm tốt hơn
                const searchTerm = `*${keyword}*`;
                
                const rows = await prisma.$queryRawUnsafe(
                    `
                    SELECT 
                        s.sach_id,
                        (
                            COALESCE(MATCH(s.ten_sach) AGAINST (? IN BOOLEAN MODE), 0) * 3 +
                            COALESCE(MATCH(t.ten_tac_gia) AGAINST (? IN BOOLEAN MODE), 0) * 2 +
                            COALESCE(MATCH(dm.ten_danh_muc) AGAINST (? IN BOOLEAN MODE), 0) * 1
                        ) AS relevance
                    FROM sach s
                    LEFT JOIN tacgia t 
                        ON t.tac_gia_id = s.tac_gia_id
                    LEFT JOIN sach_danhmuc sd 
                        ON sd.sach_id = s.sach_id
                    LEFT JOIN danhmuc dm 
                        ON dm.danh_muc_id = sd.danh_muc_id
                    WHERE 
                        MATCH(s.ten_sach) AGAINST (? IN BOOLEAN MODE)
                        OR MATCH(t.ten_tac_gia) AGAINST (? IN BOOLEAN MODE)
                        OR MATCH(dm.ten_danh_muc) AGAINST (? IN BOOLEAN MODE)
                    ORDER BY relevance DESC
                    LIMIT 100
                    `,
                    searchTerm,
                    searchTerm,
                    searchTerm,
                    searchTerm,
                    searchTerm
                );

                if (Array.isArray(rows)) {
                    sachIds = rows
                        .map((r) => r.sach_id)
                        .filter((id) => typeof id === 'number' && !isNaN(id));
                }
            } catch (err) {
                console.error('Fulltext search error, fallback to LIKE:', err?.message || err);
            }
        }

        let data;

        if (sachIds.length > 0) {
            // Lấy dữ liệu đầy đủ theo danh sách ID (giữ nguyên thứ tự relevance)
            data = await prisma.sach.findMany({
                where: {
                    sach_id: { in: sachIds }
                },
                include: {
                    tacgia: true,
                    nhaxuatban: true,
                    thuonghieu: true,
                    nhacungcap: true,
                    ngonngu: true,
                    nguoibiendich: true,
                    dotuoi: true,
                    sach_danhmuc: {
                        include: {
                            danhmuc: true
                        }
                    },
                    anhsach: {
                        orderBy: {
                            thu_tu: 'asc'
                        },
                        take: 1
                    }
                }
            });

            const orderMap = new Map();
            sachIds.forEach((id, idx) => orderMap.set(id, idx));
            data.sort((a, b) => (orderMap.get(a.sach_id) ?? 0) - (orderMap.get(b.sach_id) ?? 0));
        }
        
        // Nếu không có kết quả từ FULLTEXT hoặc keyword quá ngắn, dùng LIKE search
        if (sachIds.length === 0) {
            // Fallback: tìm kiếm LIKE trên tên sách, mã sách, tên tác giả, tên danh mục
            // MySQL contains đã là case-insensitive mặc định
            data = await prisma.sach.findMany({
                where: {
                    OR: [
                        { ten_sach: { contains: keyword } },
                        { ma_sach:   { contains: keyword } },
                        { tacgia:    { ten_tac_gia: { contains: keyword } } },
                        { sach_danhmuc: {
                            some: {
                                danhmuc: {
                                    ten_danh_muc: { contains: keyword }
                                }
                            }
                        } }
                    ]
                },
                include: {
                    tacgia: true,
                    nhaxuatban: true,
                    thuonghieu: true,
                    nhacungcap: true,
                    ngonngu: true,
                    nguoibiendich: true,
                    dotuoi: true,
                    sach_danhmuc: {
                        include: {
                            danhmuc: true
                        }
                    },
                    anhsach: {
                        orderBy: {
                            thu_tu: 'asc'
                        },
                        take: 1
                    }
                },
                // Sắp xếp theo độ liên quan (tên sách trước, sau đó tác giả)
                orderBy: [
                    { ten_sach: 'asc' }
                ],
                take: 100
            });
        } else {
            // Nếu có kết quả từ FULLTEXT, lấy dữ liệu đầy đủ
            data = await prisma.sach.findMany({
                where: {
                    sach_id: { in: sachIds }
                },
                include: {
                    tacgia: true,
                    nhaxuatban: true,
                    thuonghieu: true,
                    nhacungcap: true,
                    ngonngu: true,
                    nguoibiendich: true,
                    dotuoi: true,
                    sach_danhmuc: {
                        include: {
                            danhmuc: true
                        }
                    },
                    anhsach: {
                        orderBy: {
                            thu_tu: 'asc'
                        },
                        take: 1
                    }
                }
            });

            // Giữ nguyên thứ tự relevance từ FULLTEXT
            const orderMap = new Map();
            sachIds.forEach((id, idx) => orderMap.set(id, idx));
            data.sort((a, b) => (orderMap.get(a.sach_id) ?? 0) - (orderMap.get(b.sach_id) ?? 0));
        }

        // Trả về kết quả tìm kiếm (kể cả khi rỗng)
        return res.status(200).json({
            message: (!data || data.length === 0) ? "Không tìm thấy sách phù hợp với từ khóa" : "Tìm kiếm sách thành công",
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('searchSach error:', error);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message
        });
    }
};

// Lấy thông tin chi tiết sách theo ID
export const getSachById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL params

        // Kiểm tra ID có được cung cấp không và phải là số
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        // Lấy sách theo ID kèm tất cả thông tin liên quan
        const data = await prisma.sach.findUnique({
            where: { sach_id: parseInt(id) }, // Chuyển ID sang số nguyên
            include: {
                tacgia: true,           // Thông tin tác giả
                nhaxuatban: true,       // Thông tin nhà xuất bản
                thuonghieu: true,       // Thông tin thương hiệu
                nhacungcap: true,       // Thông tin nhà cung cấp
                ngonngu: true,          // Thông tin ngôn ngữ
                nguoibiendich: true,    // Thông tin người biên dịch
                dotuoi: true,           // Thông tin độ tuổi
                sach_danhmuc: {         // Danh mục của sách
                    include: {
                        danhmuc: true   // Chi tiết danh mục
                    }
                },
                anhsach: {              // Tất cả ảnh của sách
                    orderBy: {
                        thu_tu: 'asc'   // Sắp xếp theo thứ tự tăng dần
                    }
                }
            }
        });

        // Kiểm tra sách có tồn tại trong DB không
        if (!data) {
            return res.status(404).json({
                message: "Không có sách nào trong hệ thống",
                success: false,
                data: null
            });
        }

        // Trả về thông tin sách thành công
        return res.status(200).json({
            message: "Lấy sách thành công",
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

// Tạo sách mới trong hệ thống
export const createSach = async (req, res) => {
    try {
        // Lấy tất cả dữ liệu từ request body
        const {
            ten_sach,              // Tên sách (bắt buộc)
            ma_sach,               // Mã sách (bắt buộc, unique)
            mo_ta,                 // Mô tả sách (tùy chọn)
            gia_bia,               // Giá bìa (bắt buộc)
            gia_ban,               // Giá bán (bắt buộc)
            trong_luong,           // Trọng lượng (bắt buộc)
            ngay_xuat_ban,         // Ngày xuất bản (tùy chọn)
            so_trang,              // Số trang (tùy chọn)
            isbn,                  // ISBN (tùy chọn)
            nguoi_dich,            // Người dịch (tùy chọn)
            so_luong,              // Số lượng tồn kho (mặc định 0)
            trang_thai,            // Trạng thái hoạt động (mặc định true)
            tac_gia_id,            // ID tác giả (bắt buộc)
            nha_xuat_ban_id,       // ID nhà xuất bản (bắt buộc)
            thuong_hieu_id,        // ID thương hiệu (bắt buộc)
            nha_cung_cap_id,       // ID nhà cung cấp (bắt buộc)
            ngon_ngu_id,           // ID ngôn ngữ (bắt buộc)
            do_tuoi_id,            // ID độ tuổi (bắt buộc)
            nguoi_bien_dich_id     // ID người biên dịch (bắt buộc)
        } = req.body;

        // Log để debug (chỉ trong môi trường development)
        console.log('Request body:', req.body);
        console.log('File:', req.file); // File ảnh bìa (nếu có)

        // Kiểm tra dữ liệu bắt buộc (tên sách và mã sách)
        if (
            !ten_sach ||
            !ten_sach.trim() ||
            !ma_sach ||
            !ma_sach.trim()
        ) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc",
                success: false
            });
        }

        // Loại bỏ khoảng trắng thừa
        const trimmedTenSach = ten_sach.trim();
        const trimmedMaSach = ma_sach.trim();

        // Kiểm tra mã sách có đúng định dạng không (chỉ cho phép chữ cái, số, khoảng trắng, dấu gạch ngang và gạch dưới)
        if (!/^[a-zA-Z0-9\s_-]+$/.test(trimmedMaSach)) {
            return res.status(400).json({
                message: "Mã sách không hợp lệ",
                success: false
            });
        }

        // Kiểm tra giá bìa có đúng định dạng không (phải là số dương)
        if (gia_bia === undefined || gia_bia === null || gia_bia === '') {
            return res.status(400).json({
                message: "Giá bìa không được để trống",
                success: false
            });
        }
        const parsedGiaBia = parseFloat(gia_bia); // Chuyển sang số thực
        if (Number.isNaN(parsedGiaBia)) {
            return res.status(400).json({
                message: "Giá bìa phải là số",
                success: false
            });
        }

        // Kiểm tra giá bán có đúng định dạng không (phải là số dương)
        if (gia_ban === undefined || gia_ban === null || gia_ban === '') {
            return res.status(400).json({
                message: "Giá bán không được để trống",
                success: false
            });
        }
        const parsedGiaBan = parseFloat(gia_ban); // Chuyển sang số thực
        if (Number.isNaN(parsedGiaBan)) {
            return res.status(400).json({
                message: "Giá bán phải là số",
                success: false
            });
        }

        // Kiểm tra trọng lượng có đúng định dạng không (phải là số nguyên dương)
        if (trong_luong === undefined || trong_luong === null || trong_luong === '') {
            return res.status(400).json({
                message: "Trong lượng không được để trống",
                success: false
            });
        }
        const parsedTrongLuong = parseInt(trong_luong, 10); // Chuyển sang số nguyên
        if (Number.isNaN(parsedTrongLuong)) {
            return res.status(400).json({
                message: "Trong lượng phải là số",
                success: false
            });
        }

        // Kiểm tra mã sách đã tồn tại chưa (mã sách phải unique)
        const existingSach = await prisma.sach.findUnique({
            where: { ma_sach: trimmedMaSach }
        });

        if (existingSach) {
            return res.status(400).json({
                message: "Mã sách đã tồn tại",
                success: false
            });
        }

        // Xử lý ảnh bìa (nếu có upload file)
        let anh_bia_url = null; // Mặc định không có ảnh
        if (req.file) {
            // Lưu đường dẫn ảnh vào thư mục uploads/images
            anh_bia_url = `/uploads/images/${req.file.filename}`;
        }

        // Xử lý ngày xuất bản (hỗ trợ cả timestamp và string date từ frontend)
        let ngayXuatBanDate = null;
        if (ngay_xuat_ban) {
            // Nếu là timestamp (số), chuyển sang Date object
            if (!isNaN(ngay_xuat_ban)) {
                ngayXuatBanDate = new Date(parseInt(ngay_xuat_ban));
            } else {
                // Nếu là string date, chuyển trực tiếp
                ngayXuatBanDate = new Date(ngay_xuat_ban);
            }
            // Kiểm tra date hợp lệ (nếu không hợp lệ thì set null)
            if (isNaN(ngayXuatBanDate.getTime())) {
                ngayXuatBanDate = null;
            }
        }

        // Xử lý trạng thái (có thể nhận string "true"/"false" từ form hoặc boolean)
        let trangThaiValue = true; // Mặc định là true (hoạt động)
        if (trang_thai !== undefined && trang_thai !== null && trang_thai !== '') {
            if (typeof trang_thai === 'string') {
                // Nếu là string, kiểm tra giá trị
                trangThaiValue = trang_thai === 'true' || trang_thai === '1';
            } else {
                // Nếu là boolean, chuyển trực tiếp
                trangThaiValue = Boolean(trang_thai);
            }
        }

        // Kiểm tra các ID tham chiếu có hợp lệ không (phải là số nguyên)
        const tacGiaId = parseInt(tac_gia_id, 10);
        const nhaXuatBanId = parseInt(nha_xuat_ban_id, 10);
        const thuongHieuId = parseInt(thuong_hieu_id, 10);
        const nhaCungCapId = parseInt(nha_cung_cap_id, 10);
        const ngonNguId = parseInt(ngon_ngu_id, 10);
        const doTuoiId = parseInt(do_tuoi_id, 10);
        const nguoiBienDichId = parseInt(nguoi_bien_dich_id, 10);

        // Kiểm tra tất cả ID đều hợp lệ
        if (
            Number.isNaN(tacGiaId) ||
            Number.isNaN(nhaXuatBanId) ||
            Number.isNaN(thuongHieuId) ||
            Number.isNaN(nhaCungCapId) ||
            Number.isNaN(ngonNguId) ||
            Number.isNaN(doTuoiId) ||
            Number.isNaN(nguoiBienDichId)
        ) {
            return res.status(400).json({
                message: "ID tham chiếu không hợp lệ",
                success: false
            });
        }

        // Xử lý số lượng tồn kho (mặc định là 0 nếu không có)
        let parsedSoLuong = 0;
        if (so_luong !== undefined && so_luong !== null && so_luong !== '') {
            const parsed = parseInt(so_luong, 10);
            parsedSoLuong = Number.isNaN(parsed) ? 0 : parsed; // Nếu không phải số thì mặc định 0
        }

        // Tạo sách mới trong database
        const data = await prisma.sach.create({
            data: {
                ten_sach: trimmedTenSach,
                ma_sach: trimmedMaSach,
                mo_ta: mo_ta || null,
                gia_bia: parsedGiaBia,
                gia_ban: parsedGiaBan,
                anh_bia_url,
                trong_luong: parsedTrongLuong,
                ngay_xuat_ban: ngayXuatBanDate,
                so_trang: so_trang ? parseInt(so_trang, 10) : null,
                isbn: isbn || null,
                nguoi_dich: nguoi_dich || null,
                so_luong: parsedSoLuong,
                trang_thai: trangThaiValue,
                tac_gia_id: tacGiaId,
                nha_xuat_ban_id: nhaXuatBanId,
                thuong_hieu_id: thuongHieuId,
                nha_cung_cap_id: nhaCungCapId,
                ngon_ngu_id: ngonNguId,
                do_tuoi_id: doTuoiId,
                nguoi_bien_dich_id: nguoiBienDichId
            },
            include: {
                tacgia: true,
                nhaxuatban: true,
                thuonghieu: true,
                nhacungcap: true,
                ngonngu: true,
                nguoibiendich: true,
                dotuoi: true,
                sach_danhmuc: {
                    include: {
                        danhmuc: true
                    }
                }
            }
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: "Tạo sách thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Log lỗi để debug (chỉ trong development)
        console.error('Error creating sach:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined // Chỉ hiển thị stack trace trong dev
        });
    }
}

// Cập nhật thông tin sách
export const updateSach = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID sách từ URL params
        // Lấy tất cả dữ liệu từ request body (có thể cập nhật một phần)
        const {
            ten_sach,              // Tên sách
            ma_sach,               // Mã sách
            mo_ta,                 // Mô tả
            gia_bia,               // Giá bìa
            gia_ban,               // Giá bán
            trong_luong,           // Trọng lượng
            ngay_xuat_ban,         // Ngày xuất bản
            so_trang,              // Số trang
            isbn,                  // ISBN
            nguoi_dich,            // Người dịch
            so_luong,              // Số lượng
            trang_thai,            // Trạng thái
            tac_gia_id,            // ID tác giả
            nha_xuat_ban_id,       // ID nhà xuất bản
            thuong_hieu_id,        // ID thương hiệu
            nha_cung_cap_id,       // ID nhà cung cấp
            ngon_ngu_id,           // ID ngôn ngữ
            do_tuoi_id,            // ID độ tuổi
            nguoi_bien_dich_id     // ID người biên dịch
        } = req.body;

        // Log để debug (chỉ trong development)
        console.log('Update request body:', req.body);
        console.log('Update file:', req.file); // File ảnh bìa mới (nếu có)

        // Kiểm tra ID có hợp lệ không
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        // Kiểm tra dữ liệu bắt buộc (tên sách và mã sách)
        if (!ten_sach || !ten_sach.trim() || !ma_sach || !ma_sach.trim()) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc",
                success: false
            });
        }

        // Loại bỏ khoảng trắng thừa
        const trimmedTenSach = ten_sach.trim();
        const trimmedMaSach = ma_sach.trim();

        // Kiểm tra trọng lượng có đúng định dạng không (nếu có)
        if (trong_luong !== undefined && trong_luong !== null && trong_luong !== '' && isNaN(trong_luong)) {
            return res.status(400).json({
                message: "Trong lượng phải là số",
                success: false
            });
        }

        // Kiểm tra số trang có đúng định dạng không (nếu có)
        if (so_trang && isNaN(so_trang)) {
            return res.status(400).json({
                message: "Số trang phải là số",
                success: false
            });
        }

        // Kiểm tra ISBN có đúng định dạng không (chỉ cho phép chữ cái, số, khoảng trắng và dấu gạch ngang)
        if (isbn && !/^[a-zA-Z0-9\s-]+$/.test(isbn)) {
            return res.status(400).json({
                message: "ISBN phải chỉ chứa chữ cái, số và khoảng trắng",
                success: false
            });
        }

        // Kiểm tra sách có tồn tại không
        const existing = await prisma.sach.findUnique({
            where: { sach_id: parseInt(id) }
        });
        if (!existing) {
            return res.status(404).json({
                message: "Không tìm thấy sách",
                success: false
            });
        }

        // Xử lý ngày xuất bản (hỗ trợ cả timestamp và string date)
        let ngayXuatBanDate = existing.ngay_xuat_ban; // Giữ ngày cũ nếu không có giá trị mới
        if (ngay_xuat_ban) {
            // Nếu là timestamp (số), chuyển sang Date object
            if (!isNaN(ngay_xuat_ban)) {
                ngayXuatBanDate = new Date(parseInt(ngay_xuat_ban));
            } else {
                // Nếu là string date, chuyển trực tiếp
                ngayXuatBanDate = new Date(ngay_xuat_ban);
            }
            // Kiểm tra date hợp lệ (nếu không hợp lệ thì giữ ngày cũ)
            if (isNaN(ngayXuatBanDate.getTime())) {
                ngayXuatBanDate = existing.ngay_xuat_ban; // Giữ ngày cũ nếu không hợp lệ
            }
        }

        // Kiểm tra mã sách có trùng với sách khác không (nếu mã sách thay đổi)
        if (trimmedMaSach !== existing.ma_sach) {
            const duplicateMa = await prisma.sach.findFirst({
                where: {
                    ma_sach: trimmedMaSach, // Tìm sách có mã sách mới
                    NOT: {
                        sach_id: existing.sach_id // Loại trừ sách hiện tại
                    }
                },
            });
            if (duplicateMa) {
                return res.status(400).json({
                    message: "Mã sách đã tồn tại",
                    success: false
                });
            }
        }

        // Xử lý trạng thái (có thể nhận string "true"/"false" từ form hoặc boolean)
        let trangThaiValue = existing.trang_thai; // Giữ giá trị cũ nếu không có giá trị mới
        if (trang_thai !== undefined && trang_thai !== null && trang_thai !== '') {
            if (typeof trang_thai === 'string') {
                // Nếu là string, kiểm tra giá trị
                trangThaiValue = trang_thai === 'true' || trang_thai === '1';
            } else {
                // Nếu là boolean, chuyển trực tiếp
                trangThaiValue = Boolean(trang_thai);
            }
        }

        // Kiểm tra các ID tham chiếu có hợp lệ không (chỉ kiểm tra nếu có gửi lên)
        // Mặc định giữ giá trị cũ, chỉ cập nhật nếu có giá trị mới
        let tacGiaId = existing.tac_gia_id; // Giữ ID tác giả cũ
        let nhaXuatBanId = existing.nha_xuat_ban_id; // Giữ ID nhà xuất bản cũ
        let thuongHieuId = existing.thuong_hieu_id; // Giữ ID thương hiệu cũ
        let nhaCungCapId = existing.nha_cung_cap_id; // Giữ ID nhà cung cấp cũ

        // Cập nhật ID tác giả nếu có
        if (tac_gia_id !== undefined) {
            tacGiaId = parseInt(tac_gia_id, 10);
            if (Number.isNaN(tacGiaId)) {
                return res.status(400).json({
                    message: "ID tác giả không hợp lệ",
                    success: false
                });
            }
        }
        // Cập nhật ID nhà xuất bản nếu có
        if (nha_xuat_ban_id !== undefined) {
            nhaXuatBanId = parseInt(nha_xuat_ban_id, 10);
            if (Number.isNaN(nhaXuatBanId)) {
                return res.status(400).json({
                    message: "ID nhà xuất bản không hợp lệ",
                    success: false
                });
            }
        }
        // Cập nhật ID thương hiệu nếu có
        if (thuong_hieu_id !== undefined) {
            thuongHieuId = parseInt(thuong_hieu_id, 10);
            if (Number.isNaN(thuongHieuId)) {
                return res.status(400).json({
                    message: "ID thương hiệu không hợp lệ",
                    success: false
                });
            }
        }
        // Cập nhật ID nhà cung cấp nếu có
        if (nha_cung_cap_id !== undefined) {
            nhaCungCapId = parseInt(nha_cung_cap_id, 10);
            if (Number.isNaN(nhaCungCapId)) {
                return res.status(400).json({
                    message: "ID nhà cung cấp không hợp lệ",
                    success: false
                });
            }
        }
        // Cập nhật ID ngôn ngữ nếu có
        let ngonNguId = existing.ngon_ngu_id; // Giữ ID ngôn ngữ cũ
        if (ngon_ngu_id !== undefined) {
            ngonNguId = parseInt(ngon_ngu_id, 10);
            if (Number.isNaN(ngonNguId)) {
                return res.status(400).json({
                    message: "ID ngôn ngữ không hợp lệ",
                    success: false
                });
            }
        }
        // Cập nhật ID độ tuổi nếu có
        let doTuoiId = existing.do_tuoi_id; // Giữ ID độ tuổi cũ
        if (do_tuoi_id !== undefined) {
            doTuoiId = parseInt(do_tuoi_id, 10);
            if (Number.isNaN(doTuoiId)) {
                return res.status(400).json({
                    message: "ID độ tuổi không hợp lệ",
                    success: false
                });
            }
        }
        // Cập nhật ID người biên dịch nếu có
        let nguoiBienDichId = existing.nguoi_bien_dich_id; // Giữ ID người biên dịch cũ
        if (nguoi_bien_dich_id !== undefined) {
            nguoiBienDichId = parseInt(nguoi_bien_dich_id, 10);
            if (Number.isNaN(nguoiBienDichId)) {
                return res.status(400).json({
                    message: "ID người biên dịch không hợp lệ",
                    success: false
                });
            }
        }

        // Xử lý ảnh bìa (nếu có upload file mới thì cập nhật, không thì giữ ảnh cũ)
        let anh_bia_url = existing.anh_bia_url; // Giữ ảnh cũ nếu không upload ảnh mới
        if (req.file) {
            // Lưu đường dẫn ảnh mới vào thư mục uploads/images
            anh_bia_url = `/uploads/images/${req.file.filename}`;
        }

        // Chuẩn bị dữ liệu cập nhật - kiểm tra và parse các giá trị số
        // Giá bìa (nếu có thì cập nhật, không thì giữ giá trị cũ)
        let parsedGiaBia = existing.gia_bia; // Giữ giá bìa cũ
        if (gia_bia !== undefined && gia_bia !== null && gia_bia !== '') {
            parsedGiaBia = parseFloat(gia_bia); // Chuyển sang số thực
            if (Number.isNaN(parsedGiaBia)) {
                return res.status(400).json({
                    message: "Giá bìa phải là số",
                    success: false
                });
            }
        }
        // Giá bán (nếu có thì cập nhật, không thì giữ giá trị cũ)
        let parsedGiaBan = existing.gia_ban; // Giữ giá bán cũ
        if (gia_ban !== undefined && gia_ban !== null && gia_ban !== '') {
            parsedGiaBan = parseFloat(gia_ban); // Chuyển sang số thực
            if (Number.isNaN(parsedGiaBan)) {
                return res.status(400).json({
                    message: "Giá bán phải là số",
                    success: false
                });
            }
        }
        // Trọng lượng (nếu có thì cập nhật, không thì giữ giá trị cũ)
        let parsedTrongLuong = existing.trong_luong; // Giữ trọng lượng cũ
        if (trong_luong !== undefined && trong_luong !== null && trong_luong !== '') {
            parsedTrongLuong = parseInt(trong_luong, 10); // Chuyển sang số nguyên
            if (Number.isNaN(parsedTrongLuong)) {
                return res.status(400).json({
                    message: "Trong lượng phải là số",
                    success: false
                });
            }
        }
        // Số trang (nếu có thì cập nhật, không thì giữ giá trị cũ)
        let parsedSoTrang = existing.so_trang; // Giữ số trang cũ
        if (so_trang !== undefined && so_trang !== null && so_trang !== '') {
            parsedSoTrang = parseInt(so_trang, 10); // Chuyển sang số nguyên
            if (Number.isNaN(parsedSoTrang)) {
                return res.status(400).json({
                    message: "Số trang phải là số",
                    success: false
                });
            }
        }

        // Xử lý số lượng tồn kho (nếu có thì cập nhật, không thì giữ giá trị cũ)
        let parsedSoLuong = existing.so_luong ?? 0; // Giữ số lượng cũ (mặc định 0 nếu null)
        if (so_luong !== undefined && so_luong !== null && so_luong !== '') {
            const parsed = parseInt(so_luong, 10); // Chuyển sang số nguyên
            if (Number.isNaN(parsed)) {
                return res.status(400).json({
                    message: "Số lượng phải là số",
                    success: false
                });
            }
            parsedSoLuong = parsed;
        }

        // Xây dựng object dữ liệu cập nhật
        const updateData = {
            ten_sach: trimmedTenSach,                                                      // Tên sách (đã trim)
            ma_sach: trimmedMaSach,                                                        // Mã sách (đã trim)
            mo_ta: mo_ta !== undefined && mo_ta !== '' ? mo_ta.trim() : null,             // Mô tả (trim hoặc null)
            gia_bia: parsedGiaBia,                                                         // Giá bìa
            gia_ban: parsedGiaBan,                                                         // Giá bán
            trong_luong: parsedTrongLuong,                                                 // Trọng lượng
            ngay_xuat_ban: ngayXuatBanDate,                                                // Ngày xuất bản
            so_trang: parsedSoTrang,                                                       // Số trang
            isbn: isbn ? isbn.trim() : null,                                               // ISBN (trim hoặc null)
            nguoi_dich: nguoi_dich !== undefined && nguoi_dich !== '' ? nguoi_dich.trim() : null, // Người dịch (trim hoặc null)
            so_luong: parsedSoLuong,                                                       // Số lượng
            trang_thai: trangThaiValue,                                                    // Trạng thái
            tac_gia_id: tacGiaId,                                                          // ID tác giả
            nha_xuat_ban_id: nhaXuatBanId,                                                 // ID nhà xuất bản
            thuong_hieu_id: thuongHieuId,                                                 // ID thương hiệu
            nha_cung_cap_id: nhaCungCapId,                                                 // ID nhà cung cấp
            ngon_ngu_id: ngonNguId,                                                        // ID ngôn ngữ
            do_tuoi_id: doTuoiId,                                                         // ID độ tuổi
            nguoi_bien_dich_id: nguoiBienDichId,                                          // ID người biên dịch
            anh_bia_url: anh_bia_url,                                                      // URL ảnh bìa
            ngay_cap_nhat: new Date()                                                      // Cập nhật ngày cập nhật tự động
        };

        // Cập nhật sách trong database
        const data = await prisma.sach.update({
            where: { sach_id: parseInt(id) },
            data: updateData,
            include: {
                tacgia: true,
                nhaxuatban: true,
                thuonghieu: true,
                nhacungcap: true,
                ngonngu: true,
                nguoibiendich: true,
                dotuoi: true,
                sach_danhmuc: {
                    include: {
                        danhmuc: true
                    }
                }
            }
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: "Cập nhật sách thành công",
            success: true,
            data: data
        });
    } catch (error) {
        // Log lỗi để debug (chỉ trong development)
        console.error('Error updating sach:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({
            message: "Lỗi server",
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined // Chỉ hiển thị stack trace trong dev
        });
    }
}

// Xóa sách khỏi hệ thống
export const deleteSach = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID sách từ URL params

        // Kiểm tra ID có hợp lệ không
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "ID không được để trống và phải là số",
                success: false
            });
        }

        // Kiểm tra sách có tồn tại không (trước khi xóa)
        const existing = await prisma.sach.findUnique({
            where: { sach_id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Không tìm thấy sách",
                success: false
            });
        }

        // Xóa sách trong database (sẽ tự động xóa các dữ liệu liên quan do cascade delete)
        const data = await prisma.sach.delete({
            where: { sach_id: parseInt(id) } // Tìm sách theo ID để xóa
        });

        // Trả về kết quả thành công
        return res.status(200).json({
            message: "Xóa sách thành công",
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