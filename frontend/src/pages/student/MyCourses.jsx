import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import API from '../../utils/api';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.get('/courses/mine').then(r => setCourses(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">My Courses</h1>
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c, i) => (
            <div key={c._id} className="glass-card p-6 animate-fade-in" style={{ animationDelay: `${i*80}ms` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600"><BookOpen size={18} className="text-white"/></div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{c.code}</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{c.name}</h3>
              <p className="text-sm text-slate-400">Faculty: {c.faculty?.name || 'TBA'}</p>
              <p className="text-xs text-slate-500 mt-1">Department: {c.department}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16"><BookOpen size={40} className="mx-auto text-slate-600 mb-4"/><p className="text-slate-500">You are not enrolled in any courses yet.</p></div>
      )}
    </div>
  );
};

export default MyCourses;
