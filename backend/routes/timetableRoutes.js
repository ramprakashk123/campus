import express from 'express';
import { createTimetable, getTimetable, getMyTimetable, updateTimetable, deleteTimetable } from '../controllers/timetableController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getTimetable).post(protect, admin, createTimetable);
router.get('/mine', protect, getMyTimetable);
router.route('/:id').put(protect, admin, updateTimetable).delete(protect, admin, deleteTimetable);

export default router;
