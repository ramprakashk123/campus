import { useState, useEffect } from 'react';
import MiniCalendar from '../../components/ui/MiniCalendar';
import API from '../../utils/api';

const typeColors = { Exam: 'bg-red-500/15 text-red-400 border-red-500/20', Holiday: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', Event: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20', Deadline: 'bg-amber-500/15 text-amber-400 border-amber-500/20', Meeting: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20', Seminar: 'bg-purple-500/15 text-purple-400 border-purple-500/20' };
const typeIcons = { Exam: '📝', Holiday: '🎉', Event: '🎪', Deadline: '⏰', Meeting: '🤝', Seminar: '🎓' };

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.get('/events').then((r) => setEvents(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-white">Events & Calendar</h1><p className="text-slate-400 mt-1">Stay updated with campus events</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Upcoming Events</h3>
          {upcoming.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No upcoming events</p> : (
            upcoming.map((ev) => (
              <div key={ev._id} className={`glass-card p-5 border ${typeColors[ev.type]?.split(' ')[2] || 'border-white/5'}`}>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{typeIcons[ev.type] || '📅'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{ev.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[ev.type]?.split(' ').slice(0, 2).join(' ')}`}>{ev.type}</span>
                    </div>
                    {ev.description && <p className="text-xs text-slate-400">{ev.description}</p>}
                    <p className="text-xs text-slate-600 mt-1">{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          {past.length > 0 && <>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-6">Past Events</h3>
            {past.slice(0, 5).map((ev) => (
              <div key={ev._id} className="glass-card p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <span>{typeIcons[ev.type] || '📅'}</span>
                  <div><p className="text-sm text-slate-400">{ev.title}</p><p className="text-xs text-slate-600">{new Date(ev.date).toLocaleDateString()}</p></div>
                </div>
              </div>
            ))}
          </>}
        </div>
        <div><MiniCalendar events={events} /></div>
      </div>
    </div>
  );
};

export default StudentEvents;
