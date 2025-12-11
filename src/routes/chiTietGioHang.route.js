import express from 'express';
import { getAllChiTietGioHang, getChiTietGioHangById, getChiTietGioHangByGioHangId, createChiTietGioHang, updateChiTietGioHang, deleteChiTietGioHang, deleteAllChiTietGioHangByGioHangId } from '../controllers/chiTietGioHang.controller.js';

const chiTietGioHangRouter = express.Router();

chiTietGioHangRouter.get('/', getAllChiTietGioHang);
chiTietGioHangRouter.get('/giohang/:id', getChiTietGioHangByGioHangId);
chiTietGioHangRouter.get('/:id', getChiTietGioHangById);
chiTietGioHangRouter.post('/', createChiTietGioHang);
chiTietGioHangRouter.put('/:id', updateChiTietGioHang);
chiTietGioHangRouter.delete('/:id', deleteChiTietGioHang);
chiTietGioHangRouter.delete('/giohang/:id/all', deleteAllChiTietGioHangByGioHangId);

export default chiTietGioHangRouter;

