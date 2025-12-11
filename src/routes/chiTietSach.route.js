import express from 'express';

import { getAllChiTietSach, getChiTietSachById, createChiTietSach, updateChiTietSach, deleteChiTietSach } from '../controllers/chiTietSach.controller.js';

const chiTietSachRouter = express.Router();

chiTietSachRouter.get("/", getAllChiTietSach);
chiTietSachRouter.get("/:id", getChiTietSachById);
chiTietSachRouter.post("/", createChiTietSach);
chiTietSachRouter.put("/:id", updateChiTietSach);
chiTietSachRouter.delete("/:id", deleteChiTietSach);

export default chiTietSachRouter;