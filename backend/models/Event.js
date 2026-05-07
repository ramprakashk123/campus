import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    type: {
      type: String,
      enum: ['Exam', 'Holiday', 'Event', 'Deadline', 'Meeting', 'Seminar'],
      default: 'Event',
    },
    targetRole: {
      type: String,
      enum: ['All', 'Student', 'Faculty', 'Admin'],
      default: 'All',
    },
    department: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;
