import express from 'express';

import { getAllNguoiBienDich, sortNguoiBienDich, getNguoiBienDichById, createNguoiBienDich, updateNguoiBienDich, deleteNguoiBienDich } from '../controllers/nguoiBienDich.controller.js';

const nguoiBienDichRouter = express.Router();

nguoiBienDichRouter.get("/", getAllNguoiBienDich);
nguoiBienDichRouter.get("/sort", sortNguoiBienDich);
nguoiBienDichRouter.get("/:id", getNguoiBienDichById);
nguoiBienDichRouter.post("/", createNguoiBienDich);
nguoiBienDichRouter.put("/:id", updateNguoiBienDich);
nguoiBienDichRouter.delete("/:id", deleteNguoiBienDich);

export default nguoiBienDichRouter;