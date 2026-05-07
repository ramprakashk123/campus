import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';
import Submission from '../models/Submission.js';
import Mark from '../models/Mark.js';
import Notification from '../models/Notification.js';
import LeaveRequest from '../models/LeaveRequest.js';

// @desc    Get dashboard stats based on role
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const { role, _id } = req.user;

    if (role === 'Admin') {
      const [totalStudents, totalFaculty, totalCourses, totalAssignments, recentUsers, pendingLeaves] = await Promise.all([
        User.countDocuments({ role: 'Student' }),
        User.countDocuments({ role: 'Faculty' }),
        Course.countDocuments(),
        Assignment.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
        LeaveRequest.countDocuments({ status: 'Pending' }),
      ]);

      // Department-wise student count
      const deptStats = await User.aggregate([
        { $match: { role: 'Student', department: { $ne: null } } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      // Grade distribution
      const gradeDistribution = await Mark.aggregate([
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $gte: ['$marksObtained', 90] }, then: 'A+' },
                  { case: { $gte: ['$marksObtained', 80] }, then: 'A' },
                  { case: { $gte: ['$marksObtained', 70] }, then: 'B' },
                  { case: { $gte: ['$marksObtained', 60] }, then: 'C' },
                  { case: { $gte: ['$marksObtained', 50] }, then: 'D' },
                ],
                default: 'F',
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({
        totalStudents,
        totalFaculty,
        totalCourses,
        totalAssignments,
        recentUsers,
        pendingLeaves,
        deptStats,
        gradeDistribution,
      });
    } else if (role === 'Faculty') {
      const myCourses = await Course.find({ faculty: _id });
      const courseIds = myCourses.map((c) => c._id);

      const [totalStudents, pendingSubmissions, totalAssignments, pendingLeaves] = await Promise.all([
        Course.aggregate([
          { $match: { faculty: _id } },
          { $project: { studentCount: { $size: '$students' } } },
          { $group: { _id: null, total: { $sum: '$studentCount' } } },
        ]),
        Submission.countDocuments({ status: 'Submitted' }),
        Assignment.countDocuments({ faculty: _id }),
        LeaveRequest.countDocuments({ status: 'Pending', department: req.user.department }),
      ]);

      // At-risk students (attendance < 75%)
      const allStudentIds = myCourses.flatMap((c) => c.students);
      const uniqueStudentIds = [...new Set(allStudentIds.map((id) => id.toString()))];
      const atRiskStudents = [];

      for (const studentId of uniqueStudentIds.slice(0, 50)) {
        const records = await Attendance.find({
          course: { $in: courseIds },
          'records.student': studentId,
        });
        let present = 0, total = 0;
        records.forEach((att) => {
          const rec = att.records.find((r) => r.student.toString() === studentId);
          if (rec) {
            total++;
            if (rec.status === 'Present') present++;
          }
        });
        if (total > 0 && (present / total) < 0.75) {
          const student = await User.findById(studentId).select('name registerNumber');
          if (student) {
            atRiskStudents.push({
              ...student.toObject(),
              attendance: Math.round((present / total) * 100),
            });
          }
        }
      }

      res.json({
        myCourses: myCourses.length,
        totalStudents: totalStudents[0]?.total || 0,
        pendingSubmissions,
        totalAssignments,
        pendingLeaves,
        atRiskStudents,
      });
    } else {
      // Student
      const enrolledCourses = await Course.find({ students: _id });
      const courseIds = enrolledCourses.map((c) => c._id);

      const attendanceRecords = await Attendance.find({
        course: { $in: courseIds },
        'records.student': _id,
      });

      let totalPresent = 0;
      let totalClasses = 0;
      const weeklyAttendance = {};

      attendanceRecords.forEach((att) => {
        const rec = att.records.find((r) => r.student.toString() === _id.toString());
        if (rec) {
          totalClasses++;
          if (rec.status === 'Present') totalPresent++;

          // Build weekly trend
          const weekStart = new Date(att.date);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const key = weekStart.toISOString().split('T')[0];
          if (!weeklyAttendance[key]) weeklyAttendance[key] = { present: 0, total: 0 };
          weeklyAttendance[key].total++;
          if (rec.status === 'Present') weeklyAttendance[key].present++;
        }
      });

      const attendancePercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

      // Attendance trend (last 8 weeks)
      const attendanceTrend = Object.entries(weeklyAttendance)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-8)
        .map(([week, data]) => ({
          week,
          percentage: Math.round((data.present / data.total) * 100),
        }));

      const [totalAssignments, completedSubmissions, pendingLeaves] = await Promise.all([
        Assignment.countDocuments({ course: { $in: courseIds } }),
        Submission.countDocuments({ student: _id }),
        LeaveRequest.countDocuments({ student: _id, status: 'Pending' }),
      ]);

      // Course-wise marks for GPA
      const marks = await Mark.find({ student: _id }).populate('course', 'name code');
      const courseMarks = {};
      marks.forEach((m) => {
        const key = m.course?.code || 'Unknown';
        if (!courseMarks[key]) courseMarks[key] = [];
        courseMarks[key].push({
          examType: m.examType,
          obtained: m.marksObtained,
          total: m.totalMarks,
          percentage: Math.round((m.marksObtained / m.totalMarks) * 100),
        });
      });

      res.json({
        enrolledCourses: enrolledCourses.length,
        attendancePercentage,
        totalAssignments,
        completedSubmissions,
        pendingLeaves,
        attendanceTrend,
        courseMarks,
        isAtRisk: attendancePercentage < 75 && totalClasses > 0,
      });
    }
  } catch (error) {
    next(error);
  }
};

export { getStats };
