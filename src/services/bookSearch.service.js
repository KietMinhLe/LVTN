import prisma from '../config/db.js';

/**
 * Tìm kiếm sách trong database dựa trên từ khóa
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {number} limit - Số lượng kết quả tối đa
 * @returns {Promise<Array>} - Danh sách sách tìm được
 */
export const searchBooks = async (keyword, limit = 5) => {
    try {
        if (!keyword || keyword.trim().length === 0) {
            return [];
        }

        const searchTerm = keyword.trim();

        // Tách từ khóa thành các từ riêng lẻ để tìm kiếm tốt hơn
        const searchWords = searchTerm.split(/\s+/).filter(w => w.length >= 2);

        // Tạo điều kiện OR cho mỗi từ
        const orConditions = [];

        // Tìm kiếm theo tên sách
        searchWords.forEach(word => {
            orConditions.push({ ten_sach: { contains: word } });
        });

        // Tìm kiếm theo tác giả
        searchWords.forEach(word => {
            orConditions.push({ tacgia: { ten_tac_gia: { contains: word } } });
        });

        // Tìm kiếm theo danh mục
        searchWords.forEach(word => {
            orConditions.push({
                sach_danhmuc: {
                    some: {
                        danhmuc: {
                            ten_danh_muc: { contains: word }
                        }
                    }
                }
            });
        });

        // Tìm kiếm sách theo tên sách, tác giả, hoặc danh mục
        // MySQL không hỗ trợ mode insensitive, dùng contains
        const books = await prisma.sach.findMany({
            where: {
                AND: [
                    {
                        OR: orConditions.length > 0 ? orConditions : [
                            { ten_sach: { contains: searchTerm } },
                            { tacgia: { ten_tac_gia: { contains: searchTerm } } },
                            { sach_danhmuc: { some: { danhmuc: { ten_danh_muc: { contains: searchTerm } } } } }
                        ]
                    },
                    { trang_thai: true } // Chỉ lấy sách đang hoạt động
                ]
            },
            include: {
                tacgia: {
                    select: { ten_tac_gia: true }
                },
                nhaxuatban: {
                    select: { ten_nha_xuat_ban: true }
                },
                sach_danhmuc: {
                    include: {
                        danhmuc: {
                            select: { ten_danh_muc: true }
                        }
                    },
                    take: 1
                },
                anhsach: {
                    take: 1,
                    orderBy: { thu_tu: 'asc' }
                }
            },
            take: limit,
            orderBy: {
                sl_da_ban: 'desc' // Sắp xếp theo sách bán chạy
            }
        });

        return books;
    } catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
};

/**
 * Lấy sách bán chạy nhất
 * @param {number} limit - Số lượng kết quả
 * @returns {Promise<Array>}
 */
export const getBestSellingBooks = async (limit = 5) => {
    try {
        const books = await prisma.sach.findMany({
            where: {
                trang_thai: true
            },
            include: {
                tacgia: {
                    select: { ten_tac_gia: true }
                },
                nhaxuatban: {
                    select: { ten_nha_xuat_ban: true }
                },
                anhsach: {
                    take: 1,
                    orderBy: { thu_tu: 'asc' }
                }
            },
            orderBy: {
                sl_da_ban: 'desc'
            },
            take: limit
        });

        return books;
    } catch (error) {
        console.error('Error getting best selling books:', error);
        return [];
    }
};

/**
 * Lấy sách mới nhất
 * @param {number} limit - Số lượng kết quả
 * @returns {Promise<Array>}
 */
export const getNewestBooks = async (limit = 5) => {
    try {
        const books = await prisma.sach.findMany({
            where: {
                trang_thai: true
            },
            include: {
                tacgia: {
                    select: { ten_tac_gia: true }
                },
                nhaxuatban: {
                    select: { ten_nha_xuat_ban: true }
                },
                anhsach: {
                    take: 1,
                    orderBy: { thu_tu: 'asc' }
                }
            },
            orderBy: {
                ngay_tao: 'desc'
            },
            take: limit
        });

        return books;
    } catch (error) {
        console.error('Error getting newest books:', error);
        return [];
    }
};

/**
 * Lấy sách theo danh mục
 * @param {string} categoryName - Tên danh mục
 * @param {number} limit - Số lượng kết quả
 * @returns {Promise<Array>}
 */
export const getBooksByCategory = async (categoryName, limit = 5) => {
    try {
        const books = await prisma.sach.findMany({
            where: {
                trang_thai: true,
                sach_danhmuc: {
                    some: {
                        danhmuc: {
                            ten_danh_muc: { contains: categoryName }
                        }
                    }
                }
            },
            include: {
                tacgia: {
                    select: { ten_tac_gia: true }
                },
                nhaxuatban: {
                    select: { ten_nha_xuat_ban: true }
                },
                sach_danhmuc: {
                    include: {
                        danhmuc: {
                            select: { ten_danh_muc: true }
                        }
                    }
                },
                anhsach: {
                    take: 1,
                    orderBy: { thu_tu: 'asc' }
                }
            },
            take: limit
        });

        return books;
    } catch (error) {
        console.error('Error getting books by category:', error);
        return [];
    }
};

/**
 * Format thông tin sách thành text để trả lời
 * @param {Array} books - Danh sách sách
 * @returns {string} - Text mô tả sách
 */
export const formatBooksForResponse = (books) => {
    if (!books || books.length === 0) {
        return 'Hiện tại không tìm thấy sách phù hợp. Bạn có thể tìm kiếm trên website hoặc liên hệ với chúng tôi để được hỗ trợ.';
    }

    let response = `Tôi tìm thấy ${books.length} sách phù hợp:\n\n`;

    books.forEach((book, index) => {
        const price = parseFloat(book.gia_ban) || 0;
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);

        response += `${index + 1}. **${book.ten_sach}**\n`;
        response += `   - Tác giả: ${book.tacgia?.ten_tac_gia || 'Chưa có thông tin'}\n`;
        response += `   - Giá: ${formattedPrice}\n`;

        if (book.nhaxuatban?.ten_nha_xuat_ban) {
            response += `   - Nhà xuất bản: ${book.nhaxuatban.ten_nha_xuat_ban}\n`;
        }

        if (book.sach_danhmuc && book.sach_danhmuc.length > 0) {
            const categories = book.sach_danhmuc.map(sd => sd.danhmuc?.ten_danh_muc).filter(Boolean).join(', ');
            if (categories) {
                response += `   - Danh mục: ${categories}\n`;
            }
        }

        response += '\n';
    });

    response += 'Bạn có thể xem chi tiết và đặt mua trên website của chúng tôi.';

    return response;
};

