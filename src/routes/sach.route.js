import express from 'express';
import { getAllSach, sortSach, searchSach, getSachById, createSach, updateSach, deleteSach } from '../controllers/sach.controller.js';
import { uploadBookImage } from '../middleware/upload.js';

const sachRouter = express.Router();

sachRouter.get('/', getAllSach);
sachRouter.get('/sort', sortSach);
sachRouter.get('/search', searchSach);
sachRouter.get('/:id', getSachById);
sachRouter.post('/', uploadBookImage, createSach);
sachRouter.put('/:id', uploadBookImage, updateSach);
sachRouter.delete('/:id', deleteSach);

export default sachRouter;

