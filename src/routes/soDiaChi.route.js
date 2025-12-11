import express from "express";
import {
    getAllSoDiaChi,
    getSoDiaChiById,
    getSoDiaChiByKhachHangId,
    getDefaultSoDiaChi,
    createSoDiaChi,
    updateSoDiaChi,
    deleteSoDiaChi,
    searchSoDiaChi,
    sortSoDiaChi
} from "../controllers/soDiaChi.controller.js";
import { authenticateUser } from "../middleware/auth.js";
const soDiaChiRouter = express.Router();


soDiaChiRouter.get("/", getAllSoDiaChi);
soDiaChiRouter.get("/sort", sortSoDiaChi);
soDiaChiRouter.get("/search", searchSoDiaChi);
soDiaChiRouter.get("/khachhang/:khachHangId", getSoDiaChiByKhachHangId);
soDiaChiRouter.get("/default/me", authenticateUser, getDefaultSoDiaChi);
soDiaChiRouter.get("/:id", getSoDiaChiById);
soDiaChiRouter.post("/", createSoDiaChi);
soDiaChiRouter.put("/:id", updateSoDiaChi);
soDiaChiRouter.delete("/:id", deleteSoDiaChi);

export default soDiaChiRouter;