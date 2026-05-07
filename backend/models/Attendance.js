import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['Present', 'Absent', 'Late'],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
