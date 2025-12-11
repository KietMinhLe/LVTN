import express from "express";
import { getAllTacGia, sortTacGia, searchTacGia, getTacGiaById, createTacGia, updateTacGia, deleteTacGia } from "../controllers/tacGia.controller.js";

const tacGiaRouter = express.Router();

tacGiaRouter.get("/", getAllTacGia);
tacGiaRouter.get("/sort", sortTacGia);
tacGiaRouter.get("/search", searchTacGia);
tacGiaRouter.get("/:id", getTacGiaById);
tacGiaRouter.post("/", createTacGia);
tacGiaRouter.put("/:id", updateTacGia);
tacGiaRouter.delete("/:id", deleteTacGia);

export default tacGiaRouter;