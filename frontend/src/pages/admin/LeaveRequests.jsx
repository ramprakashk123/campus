import { useState, useEffect } from 'react';
import { Check, X, Clock, Download } from 'lucide-react';
import API from '../../utils/api';
import { exportToCSV } from '../../utils/exportUtils';

const statusColors = { Pending: 'bg-amber-500/15 text-amber-400', Approved: 'bg-emerald-500/15 text-emerald-400', Rejected: 'bg-red-500/15 text-red-400' };

const AdminLeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => { API.get('/leaves').then((r) => setLeaves(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleAction = async (id, status) => {
    try {
      const res = await API.put(`/leaves/${id}`, { status });
      setLeaves(leaves.map((l) => l._id === id ? res.data : l));
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleExport = () => {
    const data = filtered.map((l) => ({
      Student: l.student?.name, Email: l.student?.email, RegNo: l.student?.registerNumber,
      Reason: l.reason, From: new Date(l.fromDate).toLocaleDateString(), To: new Date(l.toDate).toLocaleDateString(),
      Status: l.status, ApprovedBy: l.approvedBy?.name || '—',
    }));
    exportToCSV(data, 'leave_requests');
  };

  const filtered = filter === 'All' ? leaves : leaves.filter((l) => l.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Leave Requests</h1><p className="text-slate-400 mt-1">Manage student leave applications</p></div>
        <button onClick={handleExport} className="btn-secondary btn-sm"><Download size={14} /> Export CSV</button>
      </div>

      <div className="flex gap-2">
        {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filter === f ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? <p className="text-sm text-slate-500 text-center py-12">No leave requests</p> : (
          filtered.map((leave) => (
            <div key={leave._id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">{leave.student?.name?.charAt(0)}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{leave.student?.name}</h3>
                    <p className="text-xs text-slate-500">{leave.student?.registerNumber} • {leave.student?.department}</p>
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
  );
};

export default AdminLeaveRequests;
