import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy đường dẫn thư mục hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
    // Định nghĩa thư mục lưu trữ file
    // path.join(__dirname, '../../uploads/images/') là đường dẫn tới thư mục lưu trữ file
    // __dirname là đường dẫn tới thư mục hiện tại
    // '../../uploads/images/' là đường dẫn tới thư mục lưu trữ file
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/images/'));
    },
    // Định nghĩa tên file
    filename: function (req, file, cb) {
        // Tạo tên file unique: timestamp-randomnumber.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
    // Chỉ chấp nhận file ảnh
    // file.mimetype.startsWith('image/') là kiểm tra xem file có phải là ảnh không
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Nếu là ảnh thì cho phép upload
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false); // Nếu không phải ảnh thì không cho phép upload
    }
};

// Cấu hình multer
const upload = multer({
    storage: storage, // Cấu hình lưu trữ file
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: fileFilter // Cấu hình kiểm tra loại file
});

// Middleware upload ảnh sách
export const uploadBookImage = upload.single('hinh_anh'); // Upload ảnh sách

// Middleware upload nhiều ảnh sách
export const uploadBookImages = upload.array('hinh_anh', 5); // Upload nhiều ảnh sách (tối đa 5 ảnh)

export default upload;

