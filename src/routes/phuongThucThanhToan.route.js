import express from 'express';
import { getAllPhuongThucThanhToan, getPhuongThucThanhToanById, createPhuongThucThanhToan, updatePhuongThucThanhToan, deletePhuongThucThanhToan } from '../controllers/phuongThucThanhToan.controller.js';

const phuongThucThanhToanRouter = express.Router();

phuongThucThanhToanRouter.get("/", getAllPhuongThucThanhToan);
phuongThucThanhToanRouter.get("/:id", getPhuongThucThanhToanById);
phuongThucThanhToanRouter.post("/", createPhuongThucThanhToan);
phuongThucThanhToanRouter.put("/:id", updatePhuongThucThanhToan);
phuongThucThanhToanRouter.delete("/:id", deletePhuongThucThanhToan);

export default phuongThucThanhToanRouter;
