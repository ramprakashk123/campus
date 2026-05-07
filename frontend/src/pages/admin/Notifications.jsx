import { useState, useEffect } from 'react';
import { Send, Bell, Trash2 } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import API from '../../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchNotifications = async () => {
    try { const res = await API.get('/notifications'); setNotifications(res.data); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchNotifications(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await API.post('/notifications', { title: fd.get('title'), message: fd.get('message'), targetRole: fd.get('targetRole') });
      toast.success('Notification sent!'); e.target.reset(); fetchNotifications();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    try { await API.delete(`/notifications/${id}`); toast.success('Deleted'); fetchNotifications(); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Notifications</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Send size={18} className="text-indigo-400"/>Send Notification</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label><input name="title" required className="input-dark" placeholder="Announcement title"/></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Message *</label><textarea name="message" required rows={3} className="input-dark resize-none" placeholder="Type your message..."/></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Target</label><select name="targetRole" className="input-dark"><option value="All">Everyone</option><option value="Student">Students Only</option><option value="Faculty">Faculty Only</option></select></div>
            <button type="submit" className="btn-primary w-full"><Send size={16}/>Send</button>
          </form>
        </div>
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Bell size={18} className="text-indigo-400"/>Recent Notifications</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {notifications.map(n => (
              <div key={n._id} className="p-4 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400">{n.targetRole}</span>
                    </div>
                    <p className="text-sm text-slate-400">{n.message}</p>
                    <p className="text-xs text-slate-600 mt-2">{new Date(n.createdAt).toLocaleString()} — {n.createdBy?.name}</p>
                  </div>
                  <button onClick={() => handleDelete(n._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No notifications yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
