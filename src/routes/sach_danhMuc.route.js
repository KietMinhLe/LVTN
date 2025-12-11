import express from "express";
import { getAllSachDanhMuc, sortSachDanhMuc, getSachDanhMucById, createSachDanhMuc, updateSachDanhMuc, deleteSachDanhMuc } from "../controllers/sach_danhMuc.controller.js";
const sachDanhMucRouter = express.Router();

sachDanhMucRouter.get("/", getAllSachDanhMuc);
sachDanhMucRouter.get("/sort", sortSachDanhMuc);
sachDanhMucRouter.get("/:id", getSachDanhMucById);
sachDanhMucRouter.post("/", createSachDanhMuc);
sachDanhMucRouter.put("/:id", updateSachDanhMuc);
sachDanhMucRouter.delete("/:id", deleteSachDanhMuc);

export default sachDanhMucRouter;