import mongoose from 'mongoose';

const markSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examType: {
      type: String,
      enum: ['Internal 1', 'Internal 2', 'Model', 'Final'],
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Mark = mongoose.model('Mark', markSchema);
export default Mark;
