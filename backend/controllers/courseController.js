import Course from '../models/Course.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({})
      .populate('faculty', 'name email department')
      .populate('students', 'name email registerNumber');
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get my courses (faculty or student)
// @route   GET /api/courses/mine
// @access  Private
const getMyCourses = async (req, res, next) => {
  try {
    let courses;
    if (req.user.role === 'Faculty') {
      courses = await Course.find({ faculty: req.user._id })
        .populate('students', 'name email registerNumber');
    } else {
      courses = await Course.find({ students: req.user._id })
        .populate('faculty', 'name email');
    }
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res, next) => {
  try {
    const { name, code, department, faculty } = req.body;

    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      res.status(400);
      throw new Error('Course with this code already exists');
    }

    const course = new Course({
      name,
      code,
      department,
      faculty,
    });

    const createdCourse = await course.save();
    const populated = await Course.findById(createdCourse._id)
      .populate('faculty', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const { name, code, department, faculty } = req.body;
    course.name = name || course.name;
    course.code = code || course.code;
    course.department = department || course.department;
    course.faculty = faculty || course.faculty;

    const updated = await course.save();
    const populated = await Course.findById(updated._id)
      .populate('faculty', 'name email');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }
    await Course.deleteOne({ _id: course._id });
    res.json({ message: 'Course removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll a student in a course
// @route   PUT /api/courses/:id/enroll
// @access  Private/Admin
const enrollStudent = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const { studentId } = req.body;

    if (course.students.includes(studentId)) {
      res.status(400);
      throw new Error('Student already enrolled');
    }

    course.students.push(studentId);
    await course.save();
    
    const populated = await Course.findById(course._id)
      .populate('faculty', 'name email')
      .populate('students', 'name email registerNumber');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a student from a course
// @route   PUT /api/courses/:id/unenroll
// @access  Private/Admin
const unenrollStudent = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const { studentId } = req.body;
    course.students = course.students.filter(
      (s) => s.toString() !== studentId
    );
    await course.save();

    const populated = await Course.findById(course._id)
      .populate('faculty', 'name email')
      .populate('students', 'name email registerNumber');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

export { getCourses, getMyCourses, createCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent };
