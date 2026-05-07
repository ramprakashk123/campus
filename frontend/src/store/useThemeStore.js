import { create } from 'zustand';

const ACCENT_COLORS = {
  indigo: { primary: '#6366f1', name: 'Indigo' },
  emerald: { primary: '#10b981', name: 'Emerald' },
  rose: { primary: '#f43f5e', name: 'Rose' },
  amber: { primary: '#f59e0b', name: 'Amber' },
  cyan: { primary: '#06b6d4', name: 'Cyan' },
  violet: { primary: '#8b5cf6', name: 'Violet' },
};

const useThemeStore = create((set) => ({
  accent: localStorage.getItem('accent') || 'indigo',
  setAccent: (accent) => {
    localStorage.setItem('accent', accent);
    set({ accent });
  },
  getColor: () => {
    const accent = localStorage.getItem('accent') || 'indigo';
    return ACCENT_COLORS[accent]?.primary || '#6366f1';
  },
}));

export { ACCENT_COLORS };
export default useThemeStore;
