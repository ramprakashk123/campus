import express from 'express';
import { authUser, registerUser, getUserProfile, createFaculty } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/faculty', protect, admin, createFaculty);

export default router;
