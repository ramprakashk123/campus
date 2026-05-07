import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getProfile).put(protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;
