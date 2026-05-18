import LeaveRequest from '../models/LeaveRequest.js';
import Notification from '../models/Notification.js';

// @desc    Create a leave request
// @route   POST /api/leaves
// @access  Private/Student or Faculty
const createLeaveRequest = async (req, res, next) => {
  try {
    const { reason, fromDate, toDate } = req.body;
    
    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start < today) {
      res.status(400);
      throw new Error('Leave request cannot be in the past');
    }
    if (end < start) {
      res.status(400);
      throw new Error('To Date cannot be before From Date');
    }

    const leave = await LeaveRequest.create({
      user: req.user._id,
      userRole: req.user.role,
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

// @desc    Get all leave requests (Admin/Faculty) or own (Student/Faculty)
// @route   GET /api/leaves
// @access  Private
const getLeaveRequests = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let filter = {};

    if (role === 'Student') {
      filter = { user: _id };
    } else if (role === 'Faculty') {
      filter = { $or: [{ user: _id }, { department: req.user.department, userRole: 'Student' }] };
    }
    // Admin sees all

    const leaves = await LeaveRequest.find(filter)
      .populate('user', 'name email registerNumber department role')
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

    // Send notification
    await Notification.create({
      title: `Leave Request ${status}`,
      message: `Your leave request from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been ${status.toLowerCase()}.`,
      targetUser: leave.user,
      createdBy: req.user._id,
    });

    const populated = await leave.populate([
      { path: 'user', select: 'name email registerNumber department role' },
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

    // Only the user who created it or admin can delete
    if (leave.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
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
