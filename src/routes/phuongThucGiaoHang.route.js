import express from 'express';

import { getAllPhuongThucGiaoHang, getPhuongThucGiaoHangById, createPhuongThucGiaoHang, updatePhuongThucGiaoHang, deletePhuongThucGiaoHang } from '../controllers/phuongThucGiaoHang.controller.js';

const phuongThucGiaoHangRouter = express.Router();


phuongThucGiaoHangRouter.get("/", getAllPhuongThucGiaoHang);
phuongThucGiaoHangRouter.get("/:id", getPhuongThucGiaoHangById);
phuongThucGiaoHangRouter.post("/", createPhuongThucGiaoHang);
phuongThucGiaoHangRouter.put("/:id", updatePhuongThucGiaoHang);
phuongThucGiaoHangRouter.delete("/:id", deletePhuongThucGiaoHang);

export default phuongThucGiaoHangRouter;

