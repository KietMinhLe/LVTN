import express from 'express';
import { getAllKhuyenMai, getKhuyenMaiById, createKhuyenMai, updateKhuyenMai, deleteKhuyenMai } from '../controllers/khuyenMai.controller.js';

const khuyenMaiRouter = express.Router();

khuyenMaiRouter.get("/", getAllKhuyenMai);
khuyenMaiRouter.get("/:id", getKhuyenMaiById);
khuyenMaiRouter.post("/", createKhuyenMai);
khuyenMaiRouter.put("/:id", updateKhuyenMai);
khuyenMaiRouter.delete("/:id", deleteKhuyenMai);


export default khuyenMaiRouter;