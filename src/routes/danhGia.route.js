import express from 'express';
import {
    getAllDanhGia,
    getDanhGiaBySachId,
    createDanhGia,
    updateDanhGia,
    deleteDanhGiaByAdmin
} from '../controllers/danhGia.controller.js';
import { authenticateUser, authenticateAdmin } from '../middleware/auth.js';

const danhGiaRouter = express.Router();

// Public: Lấy đánh giá của một sách
danhGiaRouter.get('/sach/:sach_id', getDanhGiaBySachId);

// User: Tạo, cập nhật đánh giá (cần đăng nhập)
danhGiaRouter.post('/', authenticateUser, createDanhGia);
danhGiaRouter.put('/:id', authenticateUser, updateDanhGia);

// Admin: Quản lý đánh giá
danhGiaRouter.get('/admin', authenticateAdmin, getAllDanhGia);
danhGiaRouter.delete('/admin/:id', authenticateAdmin, deleteDanhGiaByAdmin);

export default danhGiaRouter;