import { useState, useEffect, useCallback } from 'react';
import { Search, X, LayoutDashboard, Users, BookOpen, FileText, Calendar, MessageSquare, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const allCommands = {
    Admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, keywords: 'home overview stats' },
      { name: 'Manage Users', path: '/admin/users', icon: Users, keywords: 'students faculty' },
      { name: 'Manage Courses', path: '/admin/courses', icon: BookOpen, keywords: 'subjects classes' },
      { name: 'Timetable', path: '/admin/timetable', icon: Calendar, keywords: 'schedule' },
      { name: 'Events', path: '/admin/events', icon: Calendar, keywords: 'calendar holidays exams' },
      { name: 'Leave Requests', path: '/admin/leaves', icon: FileText, keywords: 'absence approval' },
      { name: 'Notifications', path: '/admin/notifications', icon: FileText, keywords: 'alerts messages' },
      { name: 'Profile', path: '/profile', icon: User, keywords: 'account settings' },
    ],
    Faculty: [
      { name: 'Dashboard', path: '/faculty', icon: LayoutDashboard, keywords: 'home overview' },
      { name: 'Attendance', path: '/faculty/attendance', icon: Calendar, keywords: 'present absent' },
      { name: 'Assignments', path: '/faculty/assignments', icon: FileText, keywords: 'homework tasks' },
      { name: 'Marks', path: '/faculty/marks', icon: FileText, keywords: 'grades scores' },
      { name: 'Leave Requests', path: '/faculty/leaves', icon: FileText, keywords: 'absence approval' },
      { name: 'Discussions', path: '/faculty/discussions', icon: MessageSquare, keywords: 'forum chat' },
      { name: 'Profile', path: '/profile', icon: User, keywords: 'account settings' },
    ],
    Student: [
      { name: 'Dashboard', path: '/student', icon: LayoutDashboard, keywords: 'home overview' },
      { name: 'My Courses', path: '/student/courses', icon: BookOpen, keywords: 'subjects enrolled' },
      { name: 'Attendance', path: '/student/attendance', icon: Calendar, keywords: 'present absent' },
      { name: 'Assignments', path: '/student/assignments', icon: FileText, keywords: 'homework tasks' },
      { name: 'Marks', path: '/student/marks', icon: FileText, keywords: 'grades scores' },
      { name: 'Timetable', path: '/student/timetable', icon: Calendar, keywords: 'schedule' },
      { name: 'Events', path: '/student/events', icon: Calendar, keywords: 'calendar holidays' },
      { name: 'GPA Calculator', path: '/student/gpa', icon: FileText, keywords: 'grades cgpa sgpa' },
      { name: 'Leave Request', path: '/student/leave', icon: FileText, keywords: 'absence' },
      { name: 'Discussions', path: '/student/discussions', icon: MessageSquare, keywords: 'forum chat' },
      { name: 'Profile', path: '/profile', icon: User, keywords: 'account settings' },
    ],
  };

  const commands = allCommands[user?.role] || [];
  const filtered = commands.filter((c) => {
    const q = query.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.keywords.includes(q);
  });

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setOpen((o) => !o);
      setQuery('');
    }
    if (!open) return;
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].path);
      setOpen(false);
    }
  }, [open, filtered, selectedIndex, navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg glass-card p-0 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <Search size={18} className="text-slate-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
          />
          <kbd className="text-[10px] text-slate-600 bg-white/5 px-2 py-0.5 rounded border border-white/10">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No results found</p>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.path}
                  onClick={() => { navigate(cmd.path); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                    i === selectedIndex ? 'bg-indigo-500/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{cmd.name}</span>
                </button>
              );
            })
          )}
        </div>
        <div className="p-3 border-t border-white/5 flex items-center gap-4 text-[10px] text-slate-600">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
