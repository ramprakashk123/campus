import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import API from '../../utils/api';

const Marks = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [examType, setExamType] = useState('Internal 1');
  const [marksData, setMarksData] = useState({});
  const [totalMarks, setTotalMarks] = useState(100);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { API.get('/courses/mine').then(r => { setCourses(r.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c._id === selectedCourse);
      setStudents(course?.students || []);
      const init = {};
      (course?.students || []).forEach(s => { init[s._id] = ''; });
      setMarksData(init);
    }
  }, [selectedCourse, courses]);

  const handleSubmit = async () => {
    try {
      const promises = Object.entries(marksData).filter(([, v]) => v !== '').map(([studentId, marks]) =>
        API.post('/marks', { courseId: selectedCourse, studentId, examType, marksObtained: Number(marks), totalMarks })
      );
      await Promise.all(promises);
      toast.success('Marks uploaded!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Award className="text-indigo-400"/>Upload Marks</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Course</label>
          <select className="input-dark" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">Select</option>{courses.map(c=><option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Exam Type</label>
          <select className="input-dark" value={examType} onChange={e => setExamType(e.target.value)}>
            <option>Internal 1</option><option>Internal 2</option><option>Model</option><option>Final</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Total Marks</label>
          <input type="number" className="input-dark" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))}/>
        </div>
      </div>

      {selectedCourse && students.length > 0 && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase">Student</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase">Marks (/{totalMarks})</th>
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} className="border-b border-white/3">
                  <td className="p-4"><p className="text-sm font-medium text-white">{s.name}</p><p className="text-xs text-slate-500">{s.registerNumber || s.email}</p></td>
                  <td className="p-4"><input type="number" min="0" max={totalMarks} className="input-dark w-24" value={marksData[s._id] || ''} onChange={e => setMarksData(prev => ({...prev, [s._id]: e.target.value}))}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-white/5"><button onClick={handleSubmit} className="btn-primary w-full">Upload Marks</button></div>
        </div>
      )}
    </div>
  );
};

export default Marks;
