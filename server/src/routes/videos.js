import { Router } from 'express';
import {
  uploadVideo, getVideo, incrementView, getFeed, getTrending,
  getSubscriptionFeed, searchVideos, likeVideo, dislikeVideo, deleteVideo,
} from '../controllers/videoController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', getFeed);
router.get('/trending', getTrending);
router.get('/search', searchVideos);
router.get('/subscriptions', verifyToken, getSubscriptionFeed);
router.get('/:id', optionalAuth, getVideo);
router.post('/', verifyToken, (req, res, next) => {
  console.log('Upload request received, content-type:', req.headers['content-type']);
  next();
}, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), (err, req, res, next) => {
  console.error('Multer error:', err);
  next(err);
}, uploadVideo);
router.post('/:id/view', incrementView);
router.post('/:id/like', verifyToken, likeVideo);
router.post('/:id/dislike', verifyToken, dislikeVideo);
router.delete('/:id', verifyToken, deleteVideo);

export default router;
