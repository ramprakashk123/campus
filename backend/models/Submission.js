import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String, // Store URL if using cloud storage, or local path
      required: true,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Graded', 'Late'],
      default: 'Submitted',
    },
    marks: {
      type: Number,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
