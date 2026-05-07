import { useEffect, useState } from 'react';

const BarChart = ({ data = [], height = 200, barColor = '#6366f1' }) => {
  const [animated, setAnimated] = useState(false);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (data.length === 0) return <p className="text-sm text-slate-500 text-center py-8">No data available</p>;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((item, i) => {
          const barHeight = animated ? (item.value / maxValue) * 100 : 0;
          const colors = [
            '#6366f1', '#8b5cf6', '#a78bfa', '#10b981', '#f59e0b', '#ef4444',
            '#06b6d4', '#ec4899', '#14b8a6', '#f97316',
          ];
          const color = colors[i % colors.length];

          return (
            <div key={item.label || i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <span className="text-xs font-semibold text-white">{item.value}</span>
              <div className="w-full flex justify-center" style={{ height: `${height - 40}px` }}>
                <div
                  className="rounded-t-lg min-w-[20px] max-w-[40px] w-full relative overflow-hidden"
                  style={{
                    height: `${barHeight}%`,
                    background: `linear-gradient(180deg, ${color}, ${color}90)`,
                    transition: `height 1s cubic-bezier(0.4, 0, 0.2, 1) ${i * 100}ms`,
                    boxShadow: `0 0 12px ${color}30`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 truncate w-full text-center">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
