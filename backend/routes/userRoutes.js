import express from 'express';
import { getAllUsers, getStudents, getFaculty, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getAllUsers);
router.route('/students').get(protect, getStudents);
router.route('/faculty').get(protect, getFaculty);
router.route('/:id')
  .get(protect, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
