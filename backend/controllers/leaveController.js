import LeaveRequest from '../models/LeaveRequest.js';

// @desc    Create a leave request (Student)
// @route   POST /api/leaves
// @access  Private/Student
const createLeaveRequest = async (req, res, next) => {
  try {
    const { reason, fromDate, toDate } = req.body;
    const leave = await LeaveRequest.create({
      student: req.user._id,
      reason,
      fromDate,
      toDate,
      department: req.user.department,
    });
    res.status(201).json(leave);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave requests (Admin/Faculty) or own (Student)
// @route   GET /api/leaves
// @access  Private
const getLeaveRequests = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let filter = {};

    if (role === 'Student') {
      filter = { student: _id };
    } else if (role === 'Faculty') {
      filter = { department: req.user.department };
    }
    // Admin sees all

    const leaves = await LeaveRequest.find(filter)
      .populate('student', 'name email registerNumber department')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

// @desc    Update leave request status (Approve/Reject)
// @route   PUT /api/leaves/:id
// @access  Private/Admin or Faculty
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      res.status(404);
      throw new Error('Leave request not found');
    }

    leave.status = status;
    leave.remarks = remarks || '';
    leave.approvedBy = req.user._id;
    await leave.save();

    const populated = await leave.populate([
      { path: 'student', select: 'name email registerNumber department' },
      { path: 'approvedBy', select: 'name role' },
    ]);
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a leave request
// @route   DELETE /api/leaves/:id
// @access  Private
const deleteLeaveRequest = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      res.status(404);
      throw new Error('Leave request not found');
    }

    // Only the student who created it or admin can delete
    if (leave.student.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to delete this request');
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request removed' });
  } catch (error) {
    next(error);
  }
};

export { createLeaveRequest, getLeaveRequests, updateLeaveStatus, deleteLeaveRequest };
