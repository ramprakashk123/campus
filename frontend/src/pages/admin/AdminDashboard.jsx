import { useState, useEffect } from 'react';
import { Users, BookOpen, UserCheck, ClipboardList, TrendingUp, FileText, Download } from 'lucide-react';
import StatsCard from '../../components/ui/StatsCard';
import BarChart from '../../components/ui/BarChart';
import DonutChart from '../../components/ui/DonutChart';
import MiniCalendar from '../../components/ui/MiniCalendar';
import API from '../../utils/api';
import { exportToCSV } from '../../utils/exportUtils';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/dashboard/stats'), API.get('/events/upcoming').catch(() => ({ data: [] }))])
      .then(([s, e]) => { setStats(s.data); setEvents(e.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { name: 'Total Students', value: stats?.totalStudents || 0, icon: Users },
    { name: 'Total Faculty', value: stats?.totalFaculty || 0, icon: UserCheck },
    { name: 'Total Courses', value: stats?.totalCourses || 0, icon: BookOpen },
    { name: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: FileText, subtitle: 'Awaiting approval' },
  ];

  const deptChartData = (stats?.deptStats || []).map((d) => ({ label: d._id || 'N/A', value: d.count }));
  const gradeChartData = (stats?.gradeDistribution || []).map((g) => ({ label: g._id, value: g.count }));

  const totalStudentsForDonut = stats?.totalStudents || 1;
  const facultyRatio = stats?.totalFaculty ? Math.round((stats.totalFaculty / (stats.totalStudents + stats.totalFaculty)) * 100) : 0;

  const handleExportUsers = () => {
    if (!stats?.recentUsers) return;
    const data = stats.recentUsers.map((u) => ({ Name: u.name, Email: u.email, Role: u.role, Department: u.department || '—', Joined: new Date(u.createdAt).toLocaleDateString() }));
    exportToCSV(data, 'recent_users');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your campus management system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((item, i) => (
          <StatsCard key={item.name} {...item} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Students by Department</h2>
          <BarChart data={deptChartData} height={180} />
        </div>

        {/* Grade Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Grade Distribution</h2>
          <BarChart data={gradeChartData} height={180} />
        </div>

        {/* Calendar Widget */}
        <MiniCalendar events={events} />
      </div>

      {/* Recent Users */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            Recently Joined
          </h2>
          <button onClick={handleExportUsers} className="btn-secondary btn-sm"><Download size={12} /> Export</button>
        </div>
        {stats?.recentUsers?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                    user.role === 'Admin' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                    user.role === 'Faculty' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                    'bg-gradient-to-br from-blue-500 to-cyan-600'
                  }`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  user.role === 'Admin' ? 'bg-indigo-500/15 text-indigo-400' :
                  user.role === 'Faculty' ? 'bg-emerald-500/15 text-emerald-400' :
                  'bg-blue-500/15 text-blue-400'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No recent users</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
