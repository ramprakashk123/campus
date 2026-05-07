import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses';
import Notifications from './pages/admin/Notifications';
import AdminTimetable from './pages/admin/Timetable';
import AdminEvents from './pages/admin/Events';
import AdminLeaveRequests from './pages/admin/LeaveRequests';

// Faculty
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyAssignments from './pages/faculty/Assignments';
import FacultyMarks from './pages/faculty/Marks';
import FacultyLeaveRequests from './pages/faculty/LeaveRequests';
import FacultyDiscussions from './pages/faculty/Discussions';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import MyAttendance from './pages/student/MyAttendance';
import MyAssignments from './pages/student/MyAssignments';
import MyMarks from './pages/student/MyMarks';
import StudentTimetable from './pages/student/Timetable';
import StudentEvents from './pages/student/Events';
import StudentLeave from './pages/student/LeaveRequest';
import GpaCalculator from './pages/student/GpaCalculator';
import StudentDiscussions from './pages/student/Discussions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />

          {/* Profile (all roles) */}
          <Route path="profile" element={<Profile />} />

          {/* Admin */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/users" element={<ManageUsers />} />
          <Route path="admin/courses" element={<ManageCourses />} />
          <Route path="admin/notifications" element={<Notifications />} />
          <Route path="admin/timetable" element={<AdminTimetable />} />
          <Route path="admin/events" element={<AdminEvents />} />
          <Route path="admin/leaves" element={<AdminLeaveRequests />} />

          {/* Faculty */}
          <Route path="faculty" element={<FacultyDashboard />} />
          <Route path="faculty/attendance" element={<FacultyAttendance />} />
          <Route path="faculty/assignments" element={<FacultyAssignments />} />
          <Route path="faculty/marks" element={<FacultyMarks />} />
          <Route path="faculty/leaves" element={<FacultyLeaveRequests />} />
          <Route path="faculty/discussions" element={<FacultyDiscussions />} />

          {/* Student */}
          <Route path="student" element={<StudentDashboard />} />
          <Route path="student/courses" element={<MyCourses />} />
          <Route path="student/attendance" element={<MyAttendance />} />
          <Route path="student/assignments" element={<MyAssignments />} />
          <Route path="student/marks" element={<MyMarks />} />
          <Route path="student/timetable" element={<StudentTimetable />} />
          <Route path="student/events" element={<StudentEvents />} />
          <Route path="student/leave" element={<StudentLeave />} />
          <Route path="student/gpa" element={<GpaCalculator />} />
          <Route path="student/discussions" element={<StudentDiscussions />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
