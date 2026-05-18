import { useState, useEffect } from 'react';
import { Check, X, Clock, Send, CheckCircle, XCircle, Plus } from 'lucide-react';
import API from '../../utils/api';

const statusColors = { Pending: 'bg-amber-500/15 text-amber-400', Approved: 'bg-emerald-500/15 text-emerald-400', Rejected: 'bg-red-500/15 text-red-400' };
const statusIcons = { Pending: Clock, Approved: CheckCircle, Rejected: XCircle };

const FacultyLeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [activeTab, setActiveTab] = useState('Student Leaves');
  
  // For My Leaves
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reason: '', fromDate: '', toDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  
  // Getting user from local storage to filter own leaves
  const user = JSON.parse(localStorage.getItem('user'));
  const myId = user?._id || user?.id;

  useEffect(() => { API.get('/leaves').then((r) => setLeaves(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleAction = async (id, status) => {
    try {
      const res = await API.put(`/leaves/${id}`, { status });
      setLeaves(leaves.map((l) => l._id === id ? res.data : l));
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleApplyLeave = async () => {
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

  const studentLeaves = leaves.filter(l => l.userRole === 'Student');
  const myLeaves = leaves.filter(l => l.user?._id === myId);

  const filteredStudentLeaves = filter === 'All' ? studentLeaves : studentLeaves.filter((l) => l.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Leave Management</h1>
        <p className="text-slate-400 mt-1">Manage student leaves and apply for your own</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button onClick={() => setActiveTab('Student Leaves')} className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'Student Leaves' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}>Student Leaves</button>
        <button onClick={() => setActiveTab('My Leaves')} className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'My Leaves' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}>My Leaves</button>
      </div>

      {activeTab === 'Student Leaves' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filter === f ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{f}</button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredStudentLeaves.length === 0 ? <p className="text-sm text-slate-500 text-center py-12">No student leave requests</p> : (
              filteredStudentLeaves.map((leave) => (
                <div key={leave._id} className="glass-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">{leave.user?.name?.charAt(0) || 'U'}</div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{leave.user?.name || 'Unknown User'}</h3>
                        <p className="text-xs text-slate-500">{[leave.user?.registerNumber, leave.user?.department].filter(Boolean).join(' • ')}</p>
                        <p className="text-xs text-slate-400 mt-2">{leave.reason}</p>
                        <p className="text-xs text-slate-600 mt-1"><Clock size={10} className="inline mr-1" />{new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[leave.status]}`}>{leave.status}</span>
                      {leave.status === 'Pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleAction(leave._id, 'Approved')} className="p-2 rounded-lg hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 transition-colors"><Check size={16} /></button>
                          <button onClick={() => handleAction(leave._id, 'Rejected')} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"><X size={16} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'My Leaves' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={16} /> New Request</button>
          </div>

          {showForm && (
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-sm font-semibold text-white mb-4">Submit Leave Request</h3>
              <div className="space-y-4">
                <div><label className="block text-sm text-slate-400 mb-1">Reason</label><textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input-dark h-24 resize-none" placeholder="Explain your reason for leave..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1">From Date</label><input type="date" min={today} value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} className="input-dark" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1">To Date</label><input type="date" min={form.fromDate || today} value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} className="input-dark" /></div>
                </div>
                <button onClick={handleApplyLeave} disabled={submitting} className="btn-primary"><Send size={14} /> {submitting ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {myLeaves.length === 0 ? <p className="text-sm text-slate-500 text-center py-12">No leave requests yet</p> : (
              myLeaves.map((leave) => {
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
      )}
    </div>
  );
};

export default FacultyLeaveRequests;
