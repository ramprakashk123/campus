import Discussion from '../models/Discussion.js';
import Course from '../models/Course.js';

// @desc    Create a discussion thread
// @route   POST /api/discussions
// @access  Private
const createDiscussion = async (req, res, next) => {
  try {
    const { course, title, body } = req.body;

    const discussion = await Discussion.create({
      course,
      title,
      body,
      author: req.user._id,
    });

    const populated = await discussion.populate([
      { path: 'author', select: 'name role avatar' },
      { path: 'course', select: 'name code' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get discussions for a course
// @route   GET /api/discussions?course=xxx
// @access  Private
const getDiscussions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.course) {
      filter.course = req.query.course;
    }

    const discussions = await Discussion.find(filter)
      .populate('author', 'name role avatar')
      .populate('course', 'name code')
      .populate('replies.author', 'name role avatar')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a reply to a discussion
// @route   POST /api/discussions/:id/reply
// @access  Private
const addReply = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      res.status(404);
      throw new Error('Discussion not found');
    }

    discussion.replies.push({
      author: req.user._id,
      body: req.body.body,
    });
    await discussion.save();

    const populated = await discussion.populate([
      { path: 'author', select: 'name role avatar' },
      { path: 'course', select: 'name code' },
      { path: 'replies.author', select: 'name role avatar' },
    ]);
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a discussion
// @route   PUT /api/discussions/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      res.status(404);
      throw new Error('Discussion not found');
    }

    const userId = req.user._id.toString();
    const idx = discussion.likes.findIndex((id) => id.toString() === userId);

    if (idx > -1) {
      discussion.likes.splice(idx, 1);
    } else {
      discussion.likes.push(req.user._id);
    }
    await discussion.save();
    res.json({ likes: discussion.likes.length, liked: idx === -1 });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle pin a discussion (Faculty/Admin)
// @route   PUT /api/discussions/:id/pin
// @access  Private/Faculty
const togglePin = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      res.status(404);
      throw new Error('Discussion not found');
    }
    discussion.isPinned = !discussion.isPinned;
    await discussion.save();
    res.json({ isPinned: discussion.isPinned });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a discussion
// @route   DELETE /api/discussions/:id
// @access  Private
const deleteDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      res.status(404);
      throw new Error('Discussion not found');
    }

    if (discussion.author.toString() !== req.user._id.toString() && 
        req.user.role !== 'Admin' && req.user.role !== 'Faculty') {
      res.status(403);
      throw new Error('Not authorized');
    }

    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discussion removed' });
  } catch (error) {
    next(error);
  }
};

export { createDiscussion, getDiscussions, addReply, toggleLike, togglePin, deleteDiscussion };
