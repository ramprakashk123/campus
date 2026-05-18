import { useState, useEffect } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import API from '../../utils/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
const COLORS = ['bg-indigo-500/20 border-indigo-500/30 text-indigo-300', 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300', 'bg-amber-500/20 border-amber-500/30 text-amber-300', 'bg-rose-500/20 border-rose-500/30 text-rose-300', 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300', 'bg-purple-500/20 border-purple-500/30 text-purple-300'];

const AdminTimetable = () => {
  const [entries, setEntries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ course: '', faculty: '', day: 'Monday', startTime: '09:00', endTime: '10:00', room: '' });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([API.get('/timetable'), API.get('/courses'), API.get('/users/faculty')])
      .then(([t, c, f]) => { setEntries(t.data); setCourses(c.data); setFaculty(f.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    try {
      const res = await API.post('/timetable', form);
      setEntries([...entries, res.data]);
      setModal(false);
      setForm({ course: '', faculty: '', day: 'Monday', startTime: '09:00', endTime: '10:00', room: '' });
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await API.delete(`/timetable/${id}`);
    setEntries(entries.filter((e) => e._id !== id));
  };

  const handleGenerate = async () => {
    if (!confirm('WARNING: This will delete the current timetable and automatically generate a new one. Continue?')) return;
    setGenerating(true);
    try {
      await API.post('/timetable/generate');
      const res = await API.get('/timetable');
      setEntries(res.data);
    } catch (e) { alert(e.response?.data?.message || 'Error generating timetable'); }
    finally { setGenerating(false); }
  };

  const courseColorMap = {};
  courses.forEach((c, i) => { courseColorMap[c._id] = COLORS[i % COLORS.length]; });

  const uniqueTimes = [...new Set([...TIMES, ...entries.map(e => e.startTime)])].sort();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Timetable Management</h1><p className="text-slate-400 mt-1">Create and manage weekly schedules</p></div>
        <div className="flex gap-2">
          <button onClick={handleGenerate} disabled={generating} className="btn-secondary">
            {generating ? <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /> : <Wand2 size={16} />}
            {generating ? 'Generating...' : 'Auto Generate'}
          </button>
          <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> Add Slot</button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="glass-card p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 gap-2">
            <div className="text-xs font-semibold text-slate-500 p-2">Time</div>
            {DAYS.map((d) => <div key={d} className="text-xs font-semibold text-slate-400 text-center p-2">{d}</div>)}
          </div>
          {uniqueTimes.map((time) => (
            <div key={time} className="grid grid-cols-7 gap-2 min-h-[60px]">
              <div className="text-xs text-slate-600 p-2 flex items-center">{time}</div>
              {DAYS.map((day) => {
                const slot = entries.find((e) => e.day === day && e.startTime === time);
                return (
                  <div key={`${day}-${time}`} className="p-1">
                    {slot && (
                      <div className={`p-2 rounded-lg border text-xs ${courseColorMap[slot.course?._id] || COLORS[0]} group relative`}>
                        <p className="font-semibold truncate">{slot.course?.code}</p>
                        <p className="text-[10px] opacity-70 truncate">{slot.room}</p>
                        <button onClick={() => handleDelete(slot._id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Timetable Slot">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Course</label>
            <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="input-dark">
              <option value="">Select Course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Faculty</label>
            <select value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} className="input-dark">
              <option value="">Select Faculty</option>
              {faculty.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Day</label>
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="input-dark">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Room</label>
              <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="input-dark" placeholder="e.g. A-101" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input-dark" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="input-dark" />
            </div>
          </div>
          <button onClick={handleCreate} className="btn-primary w-full">Create Slot</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTimetable;
