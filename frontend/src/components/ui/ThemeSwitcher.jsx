import useThemeStore, { ACCENT_COLORS } from '../../store/useThemeStore';

const ThemeSwitcher = () => {
  const { accent, setAccent } = useThemeStore();

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mr-1">Theme</span>
      {Object.entries(ACCENT_COLORS).map(([key, val]) => (
        <button
          key={key}
          onClick={() => setAccent(key)}
          className={`w-5 h-5 rounded-full border-2 transition-all ${
            accent === key ? 'border-white scale-125 shadow-lg' : 'border-transparent hover:scale-110'
          }`}
          style={{ backgroundColor: val.primary }}
          title={val.name}
        />
      ))}
    </div>
  );
};

export default ThemeSwitcher;
