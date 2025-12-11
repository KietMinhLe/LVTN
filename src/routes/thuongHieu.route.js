import express from "express";
import { getAllThuongHieu, sortThuongHieu, searchThuongHieu, getThuongHieuById, createThuongHieu, updateThuongHieu, deleteThuongHieu } from "../controllers/thuongHieu.controller.js";

const thuongHieuRouter = express.Router();

thuongHieuRouter.get("/", getAllThuongHieu);
thuongHieuRouter.get("/sort", sortThuongHieu);
thuongHieuRouter.get("/search", searchThuongHieu);
thuongHieuRouter.get("/:id", getThuongHieuById);
thuongHieuRouter.post("/", createThuongHieu);
thuongHieuRouter.put("/:id", updateThuongHieu);
thuongHieuRouter.delete("/:id", deleteThuongHieu);

export default thuongHieuRouter;