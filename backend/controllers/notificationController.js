import Notification from '../models/Notification.js';

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private/Admin or Faculty
const createNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole } = req.body;

    const notification = new Notification({
      title,
      message,
      targetRole: targetRole || 'All',
      createdBy: req.user._id,
    });

    const created = await notification.save();
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

// @desc    Get notifications for current user's role
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const { role } = req.user;

    const notifications = await Notification.find({
      $or: [{ targetRole: 'All' }, { targetRole: role }],
    })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }
    await Notification.deleteOne({ _id: notification._id });
    res.json({ message: 'Notification removed' });
  } catch (error) {
    next(error);
  }
};

export { createNotification, getNotifications, deleteNotification };
