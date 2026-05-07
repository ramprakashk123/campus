import AnimatedCounter from './AnimatedCounter';

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-fuchsia-600',
];

const StatsCard = ({ name, value, icon: Icon, index = 0, subtitle }) => {
  const gradient = gradients[index % gradients.length];
  const isNumeric = typeof value === 'number';

  return (
    <div
      className="glass-card p-6 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{name}</p>
          <p className="text-3xl font-bold text-white">
            {isNumeric ? <AnimatedCounter value={value} /> : value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
