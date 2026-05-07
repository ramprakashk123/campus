import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import API from '../../utils/api';

const MyMarks = () => {
  const { user } = useAuthStore();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) API.get(`/marks/student/${user._id}`).then(r => setMarks(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div>;

  // Group by course
  const byCourse = {};
  marks.forEach(m => {
    const key = m.course?._id || 'unknown';
    if (!byCourse[key]) byCourse[key] = { name: m.course?.name || 'Unknown', code: m.course?.code || '', marks: [] };
    byCourse[key].marks.push(m);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 className="text-indigo-400"/>My Marks</h1>
      {Object.keys(byCourse).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(byCourse).map(([id, data]) => (
            <div key={id} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{data.code}</span>
                <span className="text-base font-semibold text-white">{data.name}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.marks.map(m => {
                  const pct = m.totalMarks > 0 ? Math.round((m.marksObtained / m.totalMarks) * 100) : 0;
                  return (
                    <div key={m._id} className="p-4 rounded-xl bg-white/3 text-center">
                      <p className="text-xs text-slate-500 mb-1">{m.examType}</p>
                      <p className={`text-2xl font-bold ${pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{m.marksObtained}</p>
                      <p className="text-xs text-slate-500">/ {m.totalMarks}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : <div className="text-center py-16"><BarChart3 size={40} className="mx-auto text-slate-600 mb-4"/><p className="text-slate-500">No marks available yet</p></div>}
    </div>
  );
};

export default MyMarks;
