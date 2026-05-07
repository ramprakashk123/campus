import { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Users, BookOpen } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import API from '../../utils/api';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEnroll, setShowEnroll] = useState(null);
  const toast = useToast();

  const fetchData = async () => {
    try {
      const [c, f, s] = await Promise.all([
        API.get('/courses'), API.get('/users/faculty'), API.get('/users/students'),
      ]);
      setCourses(c.data); setFaculty(f.data); setStudents(s.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await API.post('/courses', { name: fd.get('name'), code: fd.get('code'), department: fd.get('department'), faculty: fd.get('faculty') });
      toast.success('Course created!'); setShowCreate(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try { await API.delete(`/courses/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  const handleEnroll = async (courseId, studentId) => {
    try { await API.put(`/courses/${courseId}/enroll`, { studentId }); toast.success('Enrolled!'); fetchData(); setShowEnroll(null); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleUnenroll = async (courseId, studentId) => {
    try { await API.put(`/courses/${courseId}/unenroll`, { studentId }); toast.success('Removed'); fetchData(); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Manage Courses</h1><p className="text-slate-400 mt-1">{courses.length} courses</p></div>
        <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm"><Plus size={16}/> New Course</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {courses.map((course) => (
          <div key={course._id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{course.code}</span>
                  <span className="text-xs text-slate-500">{course.department}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{course.name}</h3>
                <p className="text-sm text-slate-400 mt-1">Faculty: <span className="text-slate-300">{course.faculty?.name || 'Unassigned'}</span></p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setShowEnroll(course)} className="p-2 rounded-lg hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400"><UserPlus size={16}/></button>
                <button onClick={() => handleDelete(course._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500"><Users size={14}/><span>{course.students?.length || 0} enrolled</span></div>
            {course.students?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {course.students.slice(0,5).map((s) => (
                  <span key={s._id} className="inline-flex items-center gap-1 text-xs bg-white/5 text-slate-300 px-2 py-1 rounded-lg">{s.name}<button onClick={() => handleUnenroll(course._id, s._id)} className="text-red-400 ml-1">&times;</button></span>
                ))}
                {course.students.length > 5 && <span className="text-xs text-slate-500">+{course.students.length-5} more</span>}
              </div>
            )}
          </div>
        ))}
      </div>
      {courses.length === 0 && <div className="text-center py-16"><BookOpen size={40} className="mx-auto text-slate-600 mb-4"/><p className="text-slate-500">No courses yet.</p></div>}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Course">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label><input name="name" required className="input-dark" placeholder="Intro to Programming"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Code *</label><input name="code" required className="input-dark" placeholder="CS101"/></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Dept *</label><select name="department" required className="input-dark"><option value="">Select</option><option>CSE</option><option>ECE</option><option>EEE</option><option>MECH</option><option>IT</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Faculty *</label><select name="faculty" required className="input-dark"><option value="">Select</option>{faculty.map(f=><option key={f._id} value={f._id}>{f.name}</option>)}</select></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Create</button></div>
        </form>
      </Modal>

      <Modal isOpen={!!showEnroll} onClose={() => setShowEnroll(null)} title={`Enroll — ${showEnroll?.name||''}`}>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {students.filter(s => !showEnroll?.students?.find(es => es._id === s._id)).map(st => (
            <div key={st._id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5">
              <div><p className="text-sm font-medium text-white">{st.name}</p><p className="text-xs text-slate-500">{st.registerNumber||st.email}</p></div>
              <button onClick={() => handleEnroll(showEnroll._id, st._id)} className="btn-primary btn-sm">Enroll</button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ManageCourses;
