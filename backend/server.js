import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import markRoutes from './routes/markRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
