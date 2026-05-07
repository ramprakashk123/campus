import express from 'express';
import { createEvent, getEvents, getUpcomingEvents, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getEvents).post(protect, faculty, createEvent);
router.get('/upcoming', protect, getUpcomingEvents);
router.route('/:id').put(protect, faculty, updateEvent).delete(protect, faculty, deleteEvent);

export default router;
