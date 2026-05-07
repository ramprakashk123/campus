import { useState, useEffect } from 'react';
import { BookOpen, Users, ClipboardList, FileText, AlertTriangle } from 'lucide-react';
import StatsCard from '../../components/ui/StatsCard';
import MiniCalendar from '../../components/ui/MiniCalendar';
import API from '../../utils/api';

const FacultyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/dashboard/stats'),
      API.get('/courses/mine'),
      API.get('/events/upcoming').catch(() => ({ data: [] })),
    ])
      .then(([s, c, e]) => { setStats(s.data); setCourses(c.data); setEvents(e.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  const cards = [
    { name: 'My Courses', value: stats?.myCourses || 0, icon: BookOpen },
    { name: 'Total Students', value: stats?.totalStudents || 0, icon: Users },
    { name: 'Pending Submissions', value: stats?.pendingSubmissions || 0, icon: ClipboardList },
    { name: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: FileText },
  ];

  const atRisk = stats?.atRiskStudents || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-white">Faculty Dashboard</h1><p className="text-slate-400 mt-1">Your teaching overview</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => <StatsCard key={c.name} {...c} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">My Courses</h2>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div key={c._id} className="p-4 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{c.code}</span>
                  </div>
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{c.students?.length || 0} students</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 text-center py-8">No courses assigned</p>}
        </div>

        {/* Calendar */}
        <MiniCalendar events={events} />
      </div>

      {/* At-Risk Students */}
      {atRisk.length > 0 && (
        <div className="glass-card p-6 border border-amber-500/20">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            At-Risk Students (Attendance &lt; 75%)
          </h2>
          <div className="space-y-3">
            {atRisk.map((s) => (
              <div key={s._id} className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">{s.name?.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.registerNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.attendance < 50 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${s.attendance}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${s.attendance < 50 ? 'text-red-400' : 'text-amber-400'}`}>{s.attendance}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
