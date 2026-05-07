import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Faculty', 'Student'],
      default: 'Student',
    },
    // Common fields for Faculty/Student
    department: {
      type: String,
    },
    phone: {
      type: String,
    },
    // Profile fields
    avatar: {
      type: String, // base64 or URL
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    // Student specific fields
    registerNumber: {
      type: String,
    },
    year: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
