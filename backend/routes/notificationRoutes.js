import express from 'express';
import { createNotification, getNotifications, deleteNotification } from '../controllers/notificationController.js';
import { protect, faculty, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .post(protect, faculty, createNotification);

router.delete('/:id', protect, admin, deleteNotification);

export default router;
