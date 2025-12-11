import express from 'express';
import { uploadBookImages } from '../middleware/upload.js';
import { getAllAnhSach, getAnhSachById, getAnhSachBySachId, uploadManyAnhSach, createManyAnhSach, createAnhSach, updateAnhSach, deleteAllAnhSachBySachId, deleteAnhSach } from '../controllers/anhSach.controller.js';

const anhSachRouter = express.Router();

// Lưu ý: Route cụ thể phải đặt trước route có tham số động
anhSachRouter.get("/", getAllAnhSach);
anhSachRouter.get("/sach/:sach_id", getAnhSachBySachId);
anhSachRouter.get("/:id", getAnhSachById);
anhSachRouter.post("/upload", uploadBookImages, uploadManyAnhSach); // Upload nhiều file
anhSachRouter.post("/many", createManyAnhSach); // Tạo nhiều ảnh từ URL
anhSachRouter.post("/", createAnhSach);
anhSachRouter.put("/:id", updateAnhSach);
anhSachRouter.delete("/sach/:sach_id", deleteAllAnhSachBySachId);
anhSachRouter.delete("/:id", deleteAnhSach);

export default anhSachRouter;