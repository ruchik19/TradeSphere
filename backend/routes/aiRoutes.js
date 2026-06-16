import express from 'express';
import { askChatbot, analyzePortfolio, simplifyJargon } from '../controllers/ai.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Lock down all AI routes to prevent API abuse
router.use(protect);

router.post('/chat', askChatbot);
router.post('/analyze', analyzePortfolio);
router.post('/simplify', simplifyJargon);

export default router;