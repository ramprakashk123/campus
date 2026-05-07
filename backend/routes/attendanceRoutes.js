import express from 'express';
import { markAttendance, getCourseAttendance, getStudentAttendance } from '../controllers/attendanceController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, faculty, markAttendance);
router.get('/course/:courseId', protect, getCourseAttendance);
router.get('/student/:studentId', protect, getStudentAttendance);

export default router;
