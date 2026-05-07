import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private/Faculty
const markAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Verify faculty owns this course or is admin
    if (req.user.role !== 'Admin' && course.faculty.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to mark attendance for this course');
    }

    const attendance = new Attendance({
      course: courseId,
      date: date || Date.now(),
      records,
    });

    const createdAttendance = await attendance.save();
    res.status(201).json(createdAttendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a course
// @route   GET /api/attendance/course/:courseId
// @access  Private
const getCourseAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ course: req.params.courseId })
      .populate('records.student', 'name registerNumber');
    
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentAttendance = async (req, res, next) => {
  try {
    // Only student can view their own, or faculty/admin can view any
    if (req.user.role === 'Student' && req.user._id.toString() !== req.params.studentId) {
      res.status(401);
      throw new Error('Not authorized to view this attendance');
    }

    const attendance = await Attendance.find({ 'records.student': req.params.studentId })
      .populate('course', 'name code');
    
    // Filter records to only show the specific student's record
    const studentAttendance = attendance.map((att) => {
      const studentRecord = att.records.find(
        (r) => r.student.toString() === req.params.studentId
      );
      return {
        _id: att._id,
        course: att.course,
        date: att.date,
        status: studentRecord ? studentRecord.status : 'Unknown',
      };
    });

    res.json(studentAttendance);
  } catch (error) {
    next(error);
  }
};

export { markAttendance, getCourseAttendance, getStudentAttendance };
