import { Router } from 'express';
import { getUser, updateUser, subscribe, getChannelVideos, getMe } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/me', verifyToken, getMe);
router.get('/:id', getUser);
router.put('/:id', verifyToken, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateUser);
router.post('/:id/subscribe', verifyToken, subscribe);
router.get('/:id/videos', getChannelVideos);

export default router;
