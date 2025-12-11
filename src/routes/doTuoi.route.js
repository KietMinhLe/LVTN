import express from 'express';
import { getAllDoTuoi, sortDoTuoi, getDoTuoiById, createDoTuoi, updateDoTuoi, deleteDoTuoi } from '../controllers/doTuoi.controller.js';
const doTuoiRouter = express.Router();

doTuoiRouter.get("/", getAllDoTuoi);
doTuoiRouter.get("/sort", sortDoTuoi);
doTuoiRouter.get("/:id", getDoTuoiById);
doTuoiRouter.post("/", createDoTuoi);
doTuoiRouter.put("/:id", updateDoTuoi);
doTuoiRouter.delete("/:id", deleteDoTuoi);

export default doTuoiRouter;