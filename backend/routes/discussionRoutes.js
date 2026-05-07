import express from 'express';
import { createDiscussion, getDiscussions, addReply, toggleLike, togglePin, deleteDiscussion } from '../controllers/discussionController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getDiscussions).post(protect, createDiscussion);
router.post('/:id/reply', protect, addReply);
router.put('/:id/like', protect, toggleLike);
router.put('/:id/pin', protect, faculty, togglePin);
router.delete('/:id', protect, deleteDiscussion);

export default router;
