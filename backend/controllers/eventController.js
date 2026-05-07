import Event from '../models/Event.js';

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin or Faculty
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, endDate, type, targetRole, department } = req.body;
    const event = await Event.create({
      title, description, date, endDate, type, targetRole, department,
      createdBy: req.user._id,
    });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events (optionally filtered by role/date)
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res, next) => {
  try {
    const { role } = req.user;
    const filter = {
      $or: [{ targetRole: 'All' }, { targetRole: role }],
    };

    if (req.query.month && req.query.year) {
      const start = new Date(req.query.year, req.query.month - 1, 1);
      const end = new Date(req.query.year, req.query.month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name role')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming events (next 30 days)
// @route   GET /api/events/upcoming
// @access  Private
const getUpcomingEvents = async (req, res, next) => {
  try {
    const { role } = req.user;
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const events = await Event.find({
      date: { $gte: now, $lte: thirtyDays },
      $or: [{ targetRole: 'All' }, { targetRole: role }],
    })
      .populate('createdBy', 'name role')
      .sort({ date: 1 })
      .limit(10);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    res.json({ message: 'Event removed' });
  } catch (error) {
    next(error);
  }
};

export { createEvent, getEvents, getUpcomingEvents, updateEvent, deleteEvent };
