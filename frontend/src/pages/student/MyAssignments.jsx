import { useState, useEffect } from 'react';
import { FileText, Send } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import API from '../../utils/api';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    Promise.all([API.get('/assignments/mine'), API.get('/assignments/my-submissions')])
      .then(([a, s]) => { setAssignments(a.data); setSubmissions(s.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (assignmentId) => {
    try {
      await API.post(`/assignments/${assignmentId}/submit`, { fileUrl: 'submitted' });
      toast.success('Submitted!');
      const [a, s] = await Promise.all([API.get('/assignments/mine'), API.get('/assignments/my-submissions')]);
      setAssignments(a.data); setSubmissions(s.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const isSubmitted = (id) => submissions.find(s => s.assignment?._id === id);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="text-indigo-400"/>My Assignments</h1>
      <div className="space-y-4">
        {assignments.map(a => {
          const sub = isSubmitted(a._id);
          const pastDue = new Date(a.dueDate) < new Date();
          return (
            <div key={a._id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{a.course?.code}</span>
                    {sub ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sub.status==='Graded'?'bg-emerald-500/15 text-emerald-400':sub.status==='Late'?'bg-amber-500/15 text-amber-400':'bg-blue-500/15 text-blue-400'}`}>{sub.status}</span>
                    ) : pastDue ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">Past Due</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Pending</span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white">{a.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{a.description}</p>
                  <p className="text-xs text-slate-500 mt-2">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                  {sub?.status === 'Graded' && <p className="text-sm text-emerald-400 mt-1">Marks: {sub.marks} {sub.feedback && `— ${sub.feedback}`}</p>}
                </div>
                {!sub && (
                  <button onClick={() => handleSubmit(a._id)} className="btn-primary btn-sm"><Send size={14}/>Submit</button>
                )}
              </div>
            </div>
          );
        })}
        {assignments.length === 0 && <p className="text-sm text-slate-500 text-center py-16">No assignments yet</p>}
      </div>
    </div>
  );
};

export default MyAssignments;
