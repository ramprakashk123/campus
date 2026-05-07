import express from 'express';
import { createLeaveRequest, getLeaveRequests, updateLeaveStatus, deleteLeaveRequest } from '../controllers/leaveController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getLeaveRequests).post(protect, createLeaveRequest);
router.route('/:id').put(protect, faculty, updateLeaveStatus).delete(protect, deleteLeaveRequest);

export default router;
