import { useState, useEffect } from 'react';
import { Check, X as XIcon, Clock } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import API from '../../utils/api';

const Attendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    API.get('/courses/mine').then(res => { setCourses(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c._id === selectedCourse);
      setStudents(course?.students || []);
      const init = {};
      (course?.students || []).forEach(s => { init[s._id] = 'Present'; });
      setRecords(init);
    }
  }, [selectedCourse, courses]);

  const handleSubmit = async () => {
    const recs = Object.entries(records).map(([student, status]) => ({ student, status }));
    try {
      await API.post('/attendance', { courseId: selectedCourse, date, records: recs });
      toast.success('Attendance marked!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Mark Attendance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Select Course</label>
          <select className="input-dark" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">Choose a course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
          <input type="date" className="input-dark" value={date} onChange={e => setDate(e.target.value)}/>
        </div>
      </div>

      {selectedCourse && students.length > 0 && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase">Student</th>
              <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} className="border-b border-white/3">
                  <td className="p-4"><p className="text-sm font-medium text-white">{s.name}</p><p className="text-xs text-slate-500">{s.registerNumber || s.email}</p></td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {['Present','Absent','Late'].map(status => (
                        <button key={status} onClick={() => setRecords(prev => ({...prev, [s._id]: status}))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            records[s._id] === status
                              ? status === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : status === 'Absent' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-white/5 text-slate-500 border border-transparent hover:bg-white/10'
                          }`}>
                          {status === 'Present' && <Check size={12} className="inline mr-1"/>}
                          {status === 'Absent' && <XIcon size={12} className="inline mr-1"/>}
                          {status === 'Late' && <Clock size={12} className="inline mr-1"/>}
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-white/5">
            <button onClick={handleSubmit} className="btn-primary w-full">Submit Attendance</button>
          </div>
        </div>
      )}
      {selectedCourse && students.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No students enrolled in this course</p>}
    </div>
  );
};

export default Attendance;
