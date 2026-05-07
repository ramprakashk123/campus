import { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import API from '../../utils/api';

const statusColors = { Pending: 'bg-amber-500/15 text-amber-400', Approved: 'bg-emerald-500/15 text-emerald-400', Rejected: 'bg-red-500/15 text-red-400' };
const statusIcons = { Pending: Clock, Approved: CheckCircle, Rejected: XCircle };

const StudentLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reason: '', fromDate: '', toDate: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { API.get('/leaves').then((r) => setLeaves(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleSubmit = async () => {
    if (!form.reason || !form.fromDate || !form.toDate) return;
    setSubmitting(true);
    try {
      const res = await API.post('/leaves', form);
      setLeaves([res.data, ...leaves]);
      setShowForm(false);
      setForm({ reason: '', fromDate: '', toDate: '' });
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Leave Requests</h1><p className="text-slate-400 mt-1">Submit and track leave applications</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={16} /> New Request</button>
      </div>

      {showForm && (
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-white mb-4">Submit Leave Request</h3>
          <div className="space-y-4">
            <div><label className="block text-sm text-slate-400 mb-1">Reason</label><textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input-dark h-24 resize-none" placeholder="Explain your reason for leave..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-400 mb-1">From Date</label><input type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} className="input-dark" /></div>
              <div><label className="block text-sm text-slate-400 mb-1">To Date</label><input type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} className="input-dark" /></div>
            </div>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary"><Send size={14} /> {submitting ? 'Submitting...' : 'Submit Request'}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {leaves.length === 0 ? <p className="text-sm text-slate-500 text-center py-12">No leave requests yet</p> : (
          leaves.map((leave) => {
            const StatusIcon = statusIcons[leave.status] || Clock;
            return (
              <div key={leave._id} className="glass-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{leave.reason}</p>
                    <p className="text-xs text-slate-500 mt-1"><Clock size={10} className="inline mr-1" />{new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}</p>
                    {leave.remarks && <p className="text-xs text-slate-400 mt-2 italic">Remarks: {leave.remarks}</p>}
                    {leave.approvedBy && <p className="text-xs text-slate-600 mt-1">Reviewed by: {leave.approvedBy.name}</p>}
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[leave.status]}`}>
                    <StatusIcon size={12} /> {leave.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentLeave;
