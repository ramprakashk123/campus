import { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import API from '../../utils/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
const COLORS = ['bg-indigo-500/20 border-indigo-500/30 text-indigo-300','bg-emerald-500/20 border-emerald-500/30 text-emerald-300','bg-amber-500/20 border-amber-500/30 text-amber-300','bg-rose-500/20 border-rose-500/30 text-rose-300','bg-cyan-500/20 border-cyan-500/30 text-cyan-300','bg-purple-500/20 border-purple-500/30 text-purple-300'];

const StudentTimetable = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.get('/timetable/mine').then((r) => setEntries(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const courseColorMap = {};
  const uniqueCourses = [...new Set(entries.map((e) => e.course?._id))];
  uniqueCourses.forEach((id, i) => { courseColorMap[id] = COLORS[i % COLORS.length]; });

  const uniqueTimes = [...new Set([...TIMES, ...entries.map(e => e.startTime)])].sort();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-white">My Timetable</h1><p className="text-slate-400 mt-1">Your weekly class schedule</p></div>

      {/* Today's classes */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Today's Classes — {today}</h3>
        <div className="space-y-2">
          {entries.filter((e) => e.day === today).length === 0 ? (
            <p className="text-sm text-slate-500">No classes today 🎉</p>
          ) : (
            entries.filter((e) => e.day === today).map((slot) => (
              <div key={slot._id} className={`p-3 rounded-xl border ${courseColorMap[slot.course?._id] || COLORS[0]} flex items-center justify-between`}>
                <div>
                  <p className="text-sm font-semibold">{slot.course?.name}</p>
                  <p className="text-xs opacity-70">{slot.course?.code} • {slot.faculty?.name}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="flex items-center gap-1"><Clock size={10} /> {slot.startTime} — {slot.endTime}</p>
                  <p className="flex items-center gap-1 opacity-70"><MapPin size={10} /> {slot.room}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="glass-card p-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-white mb-4">Weekly Schedule</h3>
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 gap-2">
            <div className="text-xs font-semibold text-slate-500 p-2">Time</div>
            {DAYS.map((d) => <div key={d} className={`text-xs font-semibold text-center p-2 ${d === today ? 'text-indigo-400' : 'text-slate-400'}`}>{d.slice(0, 3)}</div>)}
          </div>
          {uniqueTimes.map((time) => (
            <div key={time} className="grid grid-cols-7 gap-2 min-h-[50px]">
              <div className="text-[10px] text-slate-600 p-2 flex items-center">{time}</div>
              {DAYS.map((day) => {
                const slot = entries.find((e) => e.day === day && e.startTime === time);
                return (
                  <div key={`${day}-${time}`} className="p-0.5">
                    {slot && (
                      <div className={`p-1.5 rounded-lg border text-[10px] ${courseColorMap[slot.course?._id] || COLORS[0]}`}>
                        <p className="font-semibold truncate">{slot.course?.code}</p>
                        <p className="opacity-70 truncate">{slot.room}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
