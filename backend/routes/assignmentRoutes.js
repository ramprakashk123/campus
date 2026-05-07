import express from 'express';
import {
  createAssignment,
  getCourseAssignments,
  getMyAssignments,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
  getMySubmissions,
} from '../controllers/assignmentController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, faculty, createAssignment);
router.get('/mine', protect, getMyAssignments);
router.get('/my-submissions', protect, getMySubmissions);
router.get('/course/:courseId', protect, getCourseAssignments);
router.post('/:id/submit', protect, submitAssignment);
router.get('/:id/submissions', protect, faculty, getSubmissions);
router.put('/submissions/:id/grade', protect, faculty, gradeSubmission);

export default router;
