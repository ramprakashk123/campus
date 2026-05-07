import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import API from '../../utils/api';

const MyAttendance = () => {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) API.get(`/attendance/student/${user._id}`).then(r => setAttendance(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div>;

  // Group by course
  const byCourse = {};
  attendance.forEach(a => {
    const key = a.course?._id || 'unknown';
    if (!byCourse[key]) byCourse[key] = { name: a.course?.name || 'Unknown', code: a.course?.code || '', records: [] };
    byCourse[key].records.push(a);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Calendar className="text-indigo-400"/>My Attendance</h1>
      {Object.keys(byCourse).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(byCourse).map(([id, data]) => {
            const present = data.records.filter(r => r.status === 'Present').length;
            const total = data.records.length;
            const pct = total > 0 ? Math.round((present / total) * 100) : 0;
            return (
              <div key={id} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div><span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded mr-2">{data.code}</span><span className="text-base font-semibold text-white">{data.name}</span></div>
                  <span className={`text-lg font-bold ${pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all duration-500 ${pct >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : pct >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`} style={{ width: `${pct}%` }}/>
                </div>
                <p className="text-xs text-slate-500">{present} present out of {total} classes</p>
              </div>
            );
          })}
        </div>
      ) : <div className="text-center py-16"><Calendar size={40} className="mx-auto text-slate-600 mb-4"/><p className="text-slate-500">No attendance records yet</p></div>}
    </div>
  );
};

export default MyAttendance;
