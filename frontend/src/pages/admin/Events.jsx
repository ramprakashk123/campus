import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar as CalIcon, Tag } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import MiniCalendar from '../../components/ui/MiniCalendar';
import API from '../../utils/api';

const typeColors = { Exam: 'bg-red-500/15 text-red-400', Holiday: 'bg-emerald-500/15 text-emerald-400', Event: 'bg-indigo-500/15 text-indigo-400', Deadline: 'bg-amber-500/15 text-amber-400', Meeting: 'bg-cyan-500/15 text-cyan-400', Seminar: 'bg-purple-500/15 text-purple-400' };

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', type: 'Event', targetRole: 'All' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.get('/events').then((r) => setEvents(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleCreate = async () => {
    try {
      const res = await API.post('/events', form);
      setEvents([res.data, ...events]);
      setModal(false);
      setForm({ title: '', description: '', date: '', type: 'Event', targetRole: 'All' });
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    await API.delete(`/events/${id}`);
    setEvents(events.filter((e) => e._id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Events & Calendar</h1><p className="text-slate-400 mt-1">Manage academic events, holidays, and exams</p></div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> Add Event</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {events.length === 0 ? <p className="text-sm text-slate-500 text-center py-12">No events created yet</p> : (
            events.map((ev) => (
              <div key={ev._id} className="glass-card p-5 flex items-start justify-between group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-slate-500">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-bold text-white">{new Date(ev.date).getDate()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{ev.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[ev.type] || typeColors.Event}`}>{ev.type}</span>
                    </div>
                    {ev.description && <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>}
                    <p className="text-[10px] text-slate-600 mt-1">For: {ev.targetRole}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(ev._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        <div><MiniCalendar events={events} /></div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Event">
        <div className="space-y-4">
          <div><label className="block text-sm text-slate-400 mb-1">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-dark" placeholder="Event title" /></div>
          <div><label className="block text-sm text-slate-400 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-dark h-20 resize-none" placeholder="Optional description" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-slate-400 mb-1">Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-dark" /></div>
            <div><label className="block text-sm text-slate-400 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-dark">
                {Object.keys(typeColors).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-sm text-slate-400 mb-1">Target Audience</label>
            <select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} className="input-dark">
              <option value="All">All</option><option value="Student">Students Only</option><option value="Faculty">Faculty Only</option>
            </select>
          </div>
          <button onClick={handleCreate} className="btn-primary w-full">Create Event</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminEvents;
