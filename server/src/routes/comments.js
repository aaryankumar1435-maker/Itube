import { Router } from 'express';
import { getComments, addComment, deleteComment, likeComment } from '../controllers/commentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/:videoId', getComments);
router.post('/:videoId', verifyToken, addComment);
router.delete('/:commentId', verifyToken, deleteComment);
router.post('/:commentId/like', verifyToken, likeComment);

export default router;
