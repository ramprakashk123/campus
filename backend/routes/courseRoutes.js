import express from 'express';
import { getCourses, getMyCourses, createCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent } from '../controllers/courseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCourses)
  .post(protect, admin, createCourse);

router.get('/mine', protect, getMyCourses);
router.get('/enrolled', protect, getMyCourses);

router.route('/:id')
  .put(protect, admin, updateCourse)
  .delete(protect, admin, deleteCourse);

router.put('/:id/enroll', protect, admin, enrollStudent);
router.put('/:id/unenroll', protect, admin, unenrollStudent);

export default router;
