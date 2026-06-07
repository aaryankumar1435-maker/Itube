import { Router } from 'express';
import { summarizeVideo } from '../controllers/aiController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/summarize/:videoId', verifyToken, summarizeVideo);

export default router;
