import Mark from '../models/Mark.js';
import Course from '../models/Course.js';

// @desc    Add marks for a student
// @route   POST /api/marks
// @access  Private/Faculty
const addMarks = async (req, res, next) => {
  try {
    const { courseId, studentId, examType, marksObtained, totalMarks } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Check if faculty owns this course or is admin
    if (req.user.role !== 'Admin' && course.faculty.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to add marks for this course');
    }

    // Check if mark already exists for this student/course/examType
    const existingMark = await Mark.findOne({ course: courseId, student: studentId, examType });
    if (existingMark) {
      existingMark.marksObtained = marksObtained;
      existingMark.totalMarks = totalMarks || 100;
      const updatedMark = await existingMark.save();
      return res.json(updatedMark);
    }

    const mark = new Mark({
      course: courseId,
      student: studentId,
      examType,
      marksObtained,
      totalMarks: totalMarks || 100,
    });

    const createdMark = await mark.save();
    res.status(201).json(createdMark);
  } catch (error) {
    next(error);
  }
};

// @desc    Get marks for a student
// @route   GET /api/marks/student/:studentId
// @access  Private
const getStudentMarks = async (req, res, next) => {
  try {
    if (req.user.role === 'Student' && req.user._id.toString() !== req.params.studentId) {
      res.status(401);
      throw new Error('Not authorized to view these marks');
    }

    const marks = await Mark.find({ student: req.params.studentId })
      .populate('course', 'name code')
      .sort({ createdAt: -1 });

    res.json(marks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get marks for a course
// @route   GET /api/marks/course/:courseId
// @access  Private/Faculty
const getCourseMarks = async (req, res, next) => {
  try {
    const marks = await Mark.find({ course: req.params.courseId })
      .populate('student', 'name registerNumber email')
      .sort({ examType: 1 });

    res.json(marks);
  } catch (error) {
    next(error);
  }
};

export { addMarks, getStudentMarks, getCourseMarks };
