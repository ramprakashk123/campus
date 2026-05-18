import { Outlet, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { useState, useEffect } from 'react';
import {
  LogOut, LayoutDashboard, Users, BookOpen, ClipboardList, Calendar,
  Bell, Menu, X, GraduationCap, FileText, BarChart3, Award, ChevronRight,
  Clock, MessageSquare, Calculator, User, Search
} from 'lucide-react';
import API from '../utils/api';
import CommandPalette from './ui/CommandPalette';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (user) {
      API.get('/notifications')
        .then((res) => setNotifications(res.data.slice(0, 5)))
        .catch(() => {});
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    Admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Manage Users', path: '/admin/users', icon: Users },
      { name: 'Manage Courses', path: '/admin/courses', icon: BookOpen },
      { name: 'Timetable', path: '/admin/timetable', icon: Calendar },
      { name: 'Events', path: '/admin/events', icon: Clock },
      { name: 'Leave Requests', path: '/admin/leaves', icon: FileText },
      { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    ],
    Faculty: [
      { name: 'Dashboard', path: '/faculty', icon: LayoutDashboard },
      { name: 'Attendance', path: '/faculty/attendance', icon: ClipboardList },
      { name: 'Assignments', path: '/faculty/assignments', icon: FileText },
      { name: 'Marks', path: '/faculty/marks', icon: Award },
      { name: 'Leave Requests', path: '/faculty/leaves', icon: Clock },
      { name: 'Discussions', path: '/faculty/discussions', icon: MessageSquare },
    ],
    Student: [
      { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
      { name: 'My Courses', path: '/student/courses', icon: BookOpen },
      { name: 'Attendance', path: '/student/attendance', icon: Calendar },
      { name: 'Assignments', path: '/student/assignments', icon: FileText },
      { name: 'Marks', path: '/student/marks', icon: BarChart3 },
      { name: 'Timetable', path: '/student/timetable', icon: Clock },
      { name: 'Events', path: '/student/events', icon: Calendar },
      { name: 'GPA Calculator', path: '/student/gpa', icon: Calculator },
      { name: 'Leave Request', path: '/student/leave', icon: FileText },
      { name: 'Discussions', path: '/student/discussions', icon: MessageSquare },
    ],
  };

  const links = navItems[user.role] || [];

  const roleColors = {
    Admin: 'from-indigo-500 to-purple-500',
    Faculty: 'from-emerald-500 to-teal-500',
    Student: 'from-blue-500 to-cyan-500',
  };

  return (
    <div className="flex h-screen bg-surface-800 overflow-hidden">
      {/* Command Palette */}
      <CommandPalette />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col
        bg-surface-900/80 backdrop-blur-xl border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">CampusPro</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Menu</p>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-400' : ''} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
                </Link>
              );
            })}
          </nav>

          {/* Profile Link */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Account</p>
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                location.pathname === '/profile'
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={18} className={location.pathname === '/profile' ? 'text-indigo-400' : ''} />
              <span>My Profile</span>
            </Link>
          </div>

        </div>

        {/* User section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-surface-800/80 backdrop-blur-lg">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu size={22} />
          </button>

          <div className="hidden lg:flex items-center gap-4">
            <h1 className="text-sm font-medium text-slate-400">
              Welcome back, <span className="text-white font-semibold">{user.name}</span>
            </h1>
            {/* Search hint */}
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/3 border border-white/5 text-slate-500 hover:text-slate-400 hover:border-white/10 transition-all text-xs"
            >
              <Search size={12} />
              <span>Search...</span>
              <kbd className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 ml-2">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 top-12 w-80 glass-card p-0 z-50 animate-scale-in">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500 text-center">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5">
                          <p className="text-sm font-medium text-white">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar */}
            <Link to="/profile" className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:shadow-lg transition-shadow`}>
              {user.name?.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
