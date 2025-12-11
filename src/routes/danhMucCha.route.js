import express from "express";
import { createDanhMucCha, deleteDanhMucCha, getAllDanhMucCha, getDanhMucChaById, searchDanhMucCha, sortDanhMucCha, updateDanhMucCha } from "../controllers/danhMucCha.controller.js";

const danhMucChaRouter = express.Router();

danhMucChaRouter.get("/", getAllDanhMucCha);
danhMucChaRouter.get("/search", searchDanhMucCha); // Không đặt sau :id vì nó sẽ bị lỗi khi tìm kiếm danh mục cha
danhMucChaRouter.get("/sort", sortDanhMucCha);
danhMucChaRouter.get("/:id", getDanhMucChaById);
danhMucChaRouter.post("/", createDanhMucCha);
danhMucChaRouter.put("/:id", updateDanhMucCha);
danhMucChaRouter.delete("/:id", deleteDanhMucCha);


export default danhMucChaRouter;