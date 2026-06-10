import express from 'express';
import { askChatbot,analyzePortfolio,simplifyJargon } from '../controllers/ai.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/chat',askChatbot);
router.get('/analyze',analyzePortfolio);
router.post('/simplify',simplifyJargon);

export default router;