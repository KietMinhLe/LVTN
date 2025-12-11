import express from 'express';
import { getAllDonHang, getDonHangById, createDonHang, updateDonHang, deleteDonHang } from '../controllers/donHang.controller.js';
const donHangRouter = express.Router();


donHangRouter.get("/", getAllDonHang);
donHangRouter.get("/:id", getDonHangById);
donHangRouter.post("/", createDonHang);
donHangRouter.put("/:id", updateDonHang);
donHangRouter.delete("/:id", deleteDonHang);

export default donHangRouter;