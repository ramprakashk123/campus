import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Course from '../models/Course.js';

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Faculty
const createAssignment = async (req, res, next) => {
  try {
    const { courseId, title, description, dueDate } = req.body;

    const assignment = new Assignment({
      course: courseId,
      title,
      description,
      dueDate,
      faculty: req.user._id,
    });

    const createdAssignment = await assignment.save();
    res.status(201).json(createdAssignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getCourseAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('faculty', 'name')
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all assignments for current user's courses
// @route   GET /api/assignments/mine
// @access  Private
const getMyAssignments = async (req, res, next) => {
  try {
    let assignments;
    if (req.user.role === 'Faculty') {
      assignments = await Assignment.find({ faculty: req.user._id })
        .populate('course', 'name code')
        .sort({ dueDate: -1 });
    } else {
      // Student — get from enrolled courses
      const courses = await Course.find({ students: req.user._id });
      const courseIds = courses.map((c) => c._id);
      assignments = await Assignment.find({ course: { $in: courseIds } })
        .populate('course', 'name code')
        .sort({ dueDate: -1 });
    }
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
const submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }

    // Check if already submitted
    const existing = await Submission.findOne({
      assignment: req.params.id,
      student: req.user._id,
    });
    if (existing) {
      res.status(400);
      throw new Error('You have already submitted this assignment');
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    const submission = new Submission({
      assignment: req.params.id,
      student: req.user._id,
      fileUrl: req.body.fileUrl || 'submitted',
      status: isLate ? 'Late' : 'Submitted',
    });

    const created = await submission.save();
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private/Faculty
const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email registerNumber')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Grade a submission
// @route   PUT /api/assignments/submissions/:id/grade
// @access  Private/Faculty
const gradeSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      res.status(404);
      throw new Error('Submission not found');
    }

    submission.marks = req.body.marks;
    submission.feedback = req.body.feedback || '';
    submission.status = 'Graded';

    const updated = await submission.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get my submissions (student)
// @route   GET /api/assignments/my-submissions
// @access  Private/Student
const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate({
        path: 'assignment',
        populate: { path: 'course', select: 'name code' },
      })
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

export {
  createAssignment,
  getCourseAssignments,
  getMyAssignments,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
  getMySubmissions,
};
