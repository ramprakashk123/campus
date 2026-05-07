import { useState, useEffect } from 'react';
import { Plus, FileText, CheckCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import API from '../../utils/api';

const Assignments = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [viewSubs, setViewSubs] = useState(null);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    Promise.all([API.get('/courses/mine'), API.get('/assignments/mine')])
      .then(([c, a]) => { setCourses(c.data); setAssignments(a.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await API.post('/assignments', { courseId: fd.get('courseId'), title: fd.get('title'), description: fd.get('description'), dueDate: fd.get('dueDate') });
      toast.success('Assignment created!'); setShowCreate(false);
      const res = await API.get('/assignments/mine'); setAssignments(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const viewSubmissions = async (id) => {
    try { const res = await API.get(`/assignments/${id}/submissions`); setSubs(res.data); setViewSubs(id); } catch { toast.error('Failed'); }
  };

  const gradeSubmission = async (subId, marks, feedback) => {
    try { await API.put(`/assignments/submissions/${subId}/grade`, { marks: Number(marks), feedback }); toast.success('Graded!'); viewSubmissions(viewSubs); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Assignments</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm"><Plus size={16}/>Create Assignment</button>
      </div>

      <div className="space-y-4">
        {assignments.map(a => (
          <div key={a._id} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{a.course?.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(a.dueDate) < new Date() ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{new Date(a.dueDate) < new Date() ? 'Past Due' : 'Active'}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{a.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{a.description}</p>
                <p className="text-xs text-slate-500 mt-2">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
              </div>
              <button onClick={() => viewSubmissions(a._id)} className="btn-secondary btn-sm"><FileText size={14}/>Submissions</button>
            </div>
          </div>
        ))}
        {assignments.length === 0 && <p className="text-sm text-slate-500 text-center py-16">No assignments yet</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Assignment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Course *</label><select name="courseId" required className="input-dark"><option value="">Select</option>{courses.map(c=><option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label><input name="title" required className="input-dark" placeholder="Assignment title"/></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label><textarea name="description" required rows={3} className="input-dark resize-none" placeholder="Instructions..."/></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date *</label><input name="dueDate" type="date" required className="input-dark"/></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Create</button></div>
        </form>
      </Modal>

      <Modal isOpen={!!viewSubs} onClose={() => setViewSubs(null)} title="Submissions" size="lg">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {subs.map(s => (
            <div key={s._id} className="p-4 rounded-xl bg-white/3">
              <div className="flex items-center justify-between mb-2">
                <div><p className="text-sm font-medium text-white">{s.student?.name}</p><p className="text-xs text-slate-500">{s.student?.registerNumber || s.student?.email}</p></div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.status==='Graded'?'bg-emerald-500/15 text-emerald-400':s.status==='Late'?'bg-amber-500/15 text-amber-400':'bg-blue-500/15 text-blue-400'}`}>{s.status}</span>
              </div>
              {s.status !== 'Graded' ? (
                <div className="flex gap-2 mt-2">
                  <input type="number" placeholder="Marks" id={`marks-${s._id}`} className="input-dark w-24" min="0" max="100"/>
                  <input placeholder="Feedback" id={`fb-${s._id}`} className="input-dark flex-1"/>
                  <button onClick={() => gradeSubmission(s._id, document.getElementById(`marks-${s._id}`).value, document.getElementById(`fb-${s._id}`).value)} className="btn-primary btn-sm">Grade</button>
                </div>
              ) : <p className="text-sm text-emerald-400 mt-1"><CheckCircle size={14} className="inline mr-1"/>Marks: {s.marks} {s.feedback && `— ${s.feedback}`}</p>}
            </div>
          ))}
          {subs.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No submissions yet</p>}
        </div>
      </Modal>
    </div>
  );
};

export default Assignments;
