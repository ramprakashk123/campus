import express from 'express';
import { addMarks, getStudentMarks, getCourseMarks } from '../controllers/markController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, faculty, addMarks);
router.get('/student/:studentId', protect, getStudentMarks);
router.get('/course/:courseId', protect, faculty, getCourseMarks);

export default router;
