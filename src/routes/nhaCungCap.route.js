import express from "express";
import { createNhaCungCap, deleteNhaCungCap, getAllNhaCungCap, getNhaCungCapById, searchNhaCungCap, searchNhaCungCapBySdt, sortNhaCungCap, updateNhaCungCap } from "../controllers/nhaCungCap.controller.js";

const nhaCungCapRouter = express.Router();

nhaCungCapRouter.get("/", getAllNhaCungCap);
nhaCungCapRouter.get("/search", searchNhaCungCap);
nhaCungCapRouter.get("/search/sdt", searchNhaCungCapBySdt);
nhaCungCapRouter.get("/sort", sortNhaCungCap);
nhaCungCapRouter.get("/:id", getNhaCungCapById);
nhaCungCapRouter.post("/", createNhaCungCap);
nhaCungCapRouter.put("/:id", updateNhaCungCap);
nhaCungCapRouter.delete("/:id", deleteNhaCungCap);

export default nhaCungCapRouter;