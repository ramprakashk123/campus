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

// @desc    Auto generate timetable
// @route   POST /api/timetable/generate
// @access  Private/Admin
const generateTimetable = async (req, res, next) => {
  try {
    await Timetable.deleteMany({});

    const courses = await Course.find();
    if (!courses || courses.length === 0) {
      res.status(400);
      throw new Error('No courses found to schedule.');
    }

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const TIME_SLOTS = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:15', end: '12:15' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
    ];
    const ROOMS = ['Room 101', 'Room 102', 'Room 103', 'Room 104', 'Lab 1', 'Lab 2'];

    const newEntries = [];
    const facultySchedule = {};
    const roomSchedule = {};

    const hasConflict = (facultyId, room, day, startTime) => {
      const fSched = facultySchedule[facultyId] || [];
      const rSched = roomSchedule[room] || [];
      return fSched.some(s => s.day === day && s.startTime === startTime) || 
             rSched.some(s => s.day === day && s.startTime === startTime);
    };

    for (const course of courses) {
      let slotsAssigned = 0;
      let attempts = 0;
      
      while (slotsAssigned < 3 && attempts < 100) {
        attempts++;
        const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
        const randomSlot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
        const randomRoom = ROOMS[Math.floor(Math.random() * ROOMS.length)];
        
        const courseAlreadyInSlot = newEntries.some(e => e.course === course._id && e.day === randomDay && e.startTime === randomSlot.start);
        
        if (!courseAlreadyInSlot && !hasConflict(course.faculty.toString(), randomRoom, randomDay, randomSlot.start)) {
          newEntries.push({
            course: course._id,
            faculty: course.faculty,
            day: randomDay,
            startTime: randomSlot.start,
            endTime: randomSlot.end,
            room: randomRoom,
            department: course.department,
          });

          if (!facultySchedule[course.faculty.toString()]) facultySchedule[course.faculty.toString()] = [];
          facultySchedule[course.faculty.toString()].push({ day: randomDay, startTime: randomSlot.start });

          if (!roomSchedule[randomRoom]) roomSchedule[randomRoom] = [];
          roomSchedule[randomRoom].push({ day: randomDay, startTime: randomSlot.start });

          slotsAssigned++;
        }
      }
    }

    await Timetable.insertMany(newEntries);
    res.status(201).json({ message: `Successfully generated ${newEntries.length} timetable entries.` });
  } catch (error) {
    next(error);
  }
};

export { createTimetable, getTimetable, getMyTimetable, updateTimetable, deleteTimetable, generateTimetable };
