import Timetable from '../models/Timetable.js';
import Course from '../models/Course.js';

// @desc    Create a timetable entry
// @route   POST /api/timetable
// @access  Private/Admin
const createTimetable = async (req, res, next) => {
  try {
    const { course, faculty, day, startTime, endTime, room, department } = req.body;
    const entry = await Timetable.create({ course, faculty, day, startTime, endTime, room, department });
    const populated = await entry.populate([
      { path: 'course', select: 'name code' },
      { path: 'faculty', select: 'name' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all timetable entries
// @route   GET /api/timetable
// @access  Private
const getTimetable = async (req, res, next) => {
  try {
    const entries = await Timetable.find()
      .populate('course', 'name code department')
      .populate('faculty', 'name')
      .sort({ day: 1, startTime: 1 });
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

// @desc    Get timetable for current user (student or faculty)
// @route   GET /api/timetable/mine
// @access  Private
const getMyTimetable = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let filter = {};

    if (role === 'Faculty') {
      filter = { faculty: _id };
    } else if (role === 'Student') {
      const courses = await Course.find({ students: _id }).select('_id');
      const courseIds = courses.map((c) => c._id);
      filter = { course: { $in: courseIds } };
    }

    const entries = await Timetable.find(filter)
      .populate('course', 'name code department')
      .populate('faculty', 'name')
      .sort({ day: 1, startTime: 1 });
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a timetable entry
// @route   PUT /api/timetable/:id
// @access  Private/Admin
const updateTimetable = async (req, res, next) => {
  try {
    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course', 'name code')
      .populate('faculty', 'name');
    if (!entry) {
      res.status(404);
      throw new Error('Timetable entry not found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private/Admin
const deleteTimetable = async (req, res, next) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) {
      res.status(404);
      throw new Error('Timetable entry not found');
    }
    res.json({ message: 'Entry removed' });
  } catch (error) {
    next(error);
  }
};

export { createTimetable, getTimetable, getMyTimetable, updateTimetable, deleteTimetable };
