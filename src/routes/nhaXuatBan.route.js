import express from "express";
import { createNhaXuatBan, deleteNhaXuatBan, getAllNhaXuatBan, getNhaXuatBanById, searchNhaXuatBan, sortNhaXuatBan, updateNhaXuatBan } from "../controllers/nhaXuatBan.controller.js";

const nhaXuatBanRouter = express.Router();

nhaXuatBanRouter.get("/", getAllNhaXuatBan);
nhaXuatBanRouter.get("/search", searchNhaXuatBan);
nhaXuatBanRouter.get("/sort", sortNhaXuatBan);
nhaXuatBanRouter.get("/:id", getNhaXuatBanById);
nhaXuatBanRouter.post("/", createNhaXuatBan);
nhaXuatBanRouter.put("/:id", updateNhaXuatBan);
nhaXuatBanRouter.delete("/:id", deleteNhaXuatBan);

export default nhaXuatBanRouter;
