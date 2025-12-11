import express from 'express';
import { getAllSachKhuyenMai, getSachKhuyenMaiById, createSachKhuyenMai, updateSachKhuyenMai, deleteSachKhuyenMai } from '../controllers/sach_KhuyenMai.controller.js';

const sachKhuyenMaiRouter = express.Router();

sachKhuyenMaiRouter.get('/', getAllSachKhuyenMai);
sachKhuyenMaiRouter.get('/:id', getSachKhuyenMaiById);
sachKhuyenMaiRouter.post('/', createSachKhuyenMai);
sachKhuyenMaiRouter.put('/:id', updateSachKhuyenMai);
sachKhuyenMaiRouter.delete('/:id', deleteSachKhuyenMai);

export default sachKhuyenMaiRouter;