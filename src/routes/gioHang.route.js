import express from 'express';
import { getAllGioHang, sortGioHang, getGioHangById, createGioHang, deleteGioHangById } from '../controllers/gioHang.controller.js';

const gioHangRouter = express.Router();

gioHangRouter.get("/", getAllGioHang);
gioHangRouter.get("/sort", sortGioHang);
gioHangRouter.post("/", createGioHang);
gioHangRouter.get("/:id", getGioHangById);
gioHangRouter.delete("/:id", deleteGioHangById);

export default gioHangRouter;