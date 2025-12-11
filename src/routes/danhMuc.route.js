import express from "express";
import { createDanhMuc, getAllDanhMuc, getDanhMucById, searchDanhMuc, sortDanhMuc, updateDanhMuc, deleteDanhMuc } from "../controllers/danhMuc.controller.js";

const danhMucRouter = express.Router();

danhMucRouter.get("/", getAllDanhMuc);
danhMucRouter.get("/search", searchDanhMuc);
danhMucRouter.get("/sort", sortDanhMuc);
danhMucRouter.get("/:id", getDanhMucById);
danhMucRouter.post("/", createDanhMuc);
danhMucRouter.put("/:id", updateDanhMuc);
danhMucRouter.delete("/:id", deleteDanhMuc);


export default danhMucRouter;