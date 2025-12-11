import express from 'express';
import { chat } from '../controllers/openai.controller.js';

const router = express.Router();

// Route để chat với OpenAI
router.post('/chat', chat);

export default router;

