import express from 'express';

import { getAllNgonNgu, sortNgonNgu, getNgonNguById, createNgonNgu, updateNgonNgu, deleteNgonNgu, searchNgonNgu } from '../controllers/ngonNgu.controller.js';

const ngonNguRouter = express.Router();

ngonNguRouter.get("/", getAllNgonNgu);
ngonNguRouter.get("/sort", sortNgonNgu);
ngonNguRouter.get("/search", searchNgonNgu);
ngonNguRouter.get("/:id", getNgonNguById);
ngonNguRouter.post("/", createNgonNgu);
ngonNguRouter.put("/:id", updateNgonNgu);
ngonNguRouter.delete("/:id", deleteNgonNgu);

export default ngonNguRouter;