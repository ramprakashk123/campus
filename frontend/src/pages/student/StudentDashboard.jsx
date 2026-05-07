import { useState, useEffect } from 'react';
import { BookOpen, Calendar, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import StatsCard from '../../components/ui/StatsCard';
import DonutChart from '../../components/ui/DonutChart';
import MiniCalendar from '../../components/ui/MiniCalendar';
import useAuthStore from '../../store/useAuthStore';
import API from '../../utils/api';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/dashboard/stats'),
      API.get('/assignments/mine'),
      API.get('/events/upcoming').catch(() => ({ data: [] })),
    ])
      .then(([s, a, e]) => { setStats(s.data); setAssignments(a.data.slice(0, 5)); setEvents(e.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  const cards = [
    { name: 'Enrolled Courses', value: stats?.enrolledCourses || 0, icon: BookOpen },
    { name: 'Attendance', value: `${stats?.attendancePercentage || 0}%`, icon: Calendar },
    { name: 'Assignments Done', value: `${stats?.completedSubmissions || 0}/${stats?.totalAssignments || 0}`, icon: CheckCircle },
  ];

  const attendanceTrend = stats?.attendanceTrend || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}</h1>
        <p className="text-slate-400 mt-1">Your academic overview</p>
      </div>

      {/* At-Risk Alert */}
      {stats?.isAtRisk && (
        <div className="glass-card p-4 border border-amber-500/30 bg-amber-500/5 flex items-center gap-3 animate-fade-in">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-400">Low Attendance Warning</p>
            <p className="text-xs text-slate-400">Your attendance is below 75%. Please attend classes regularly to avoid penalties.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map((c, i) => <StatsCard key={c.name} {...c} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart + Trend */}
        <div className="glass-card p-6 flex flex-col items-center">
          <h2 className="text-sm font-semibold text-white mb-4 self-start">Attendance Overview</h2>
          <DonutChart
            percentage={stats?.attendancePercentage || 0}
            color={stats?.attendancePercentage >= 75 ? '#10b981' : stats?.attendancePercentage >= 50 ? '#f59e0b' : '#ef4444'}
            label="Overall Attendance"
          />
          {/* Mini attendance trend */}
          {attendanceTrend.length > 0 && (
            <div className="mt-4 w-full">
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><TrendingUp size={10} /> Weekly Trend</p>
              <div className="flex items-end gap-1 h-12">
                {attendanceTrend.map((w, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: `${(w.percentage / 100) * 40}px`,
                        background: w.percentage >= 75 ? '#10b981' : w.percentage >= 50 ? '#f59e0b' : '#ef4444',
                        transition: `height 0.8s ease ${i * 100}ms`,
                      }}
                    />
                    <span className="text-[8px] text-slate-600">W{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Assignments */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Upcoming Assignments</h2>
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div key={a._id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{a.course?.code}</span>
                    </div>
                    <p className="text-xs font-medium text-white truncate">{a.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${new Date(a.dueDate) < new Date() ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    {new Date(a.dueDate) < new Date() ? 'Past Due' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 text-center py-8">No assignments yet</p>}
        </div>

        {/* Calendar */}
        <MiniCalendar events={events} />
      </div>
    </div>
  );
};

export default StudentDashboard;
