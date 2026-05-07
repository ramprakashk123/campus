import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.department = req.body.department || user.department;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

    if (req.body.registerNumber) user.registerNumber = req.body.registerNumber;
    if (req.body.year) user.year = req.body.year;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      department: updatedUser.department,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      registerNumber: updatedUser.registerNumber,
      year: updatedUser.year,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export { updateProfile, changePassword, getProfile };
