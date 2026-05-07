import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const eventTypeColors = {
  Exam: 'bg-red-500',
  Holiday: 'bg-emerald-500',
  Event: 'bg-indigo-500',
  Deadline: 'bg-amber-500',
  Meeting: 'bg-cyan-500',
  Seminar: 'bg-purple-500',
};

const MiniCalendar = ({ events = [] }) => {
  const [current, setCurrent] = useState(new Date());
  const today = new Date();

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const getEventsForDay = (day) => {
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const isToday = (day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{MONTHS[month]} {year}</h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-600">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dayEvents = getEventsForDay(day);
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={day}
              className={`
                relative flex flex-col items-center justify-center h-8 rounded-lg text-xs font-medium cursor-default transition-all
                ${isToday(day)
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }
              `}
              title={dayEvents.map((e) => e.title).join(', ')}
            >
              {day}
              {hasEvents && (
                <div className="absolute bottom-0.5 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <div key={j} className={`w-1 h-1 rounded-full ${eventTypeColors[e.type] || 'bg-indigo-500'}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming events */}
      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs font-semibold text-slate-500 mb-2">Upcoming</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {events
              .filter((e) => new Date(e.date) >= today)
              .slice(0, 4)
              .map((e, i) => (
                <div key={e._id || i} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${eventTypeColors[e.type] || 'bg-indigo-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-300 truncate">{e.title}</p>
                    <p className="text-[10px] text-slate-600">{new Date(e.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniCalendar;
