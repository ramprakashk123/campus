import { useState, useEffect } from 'react';
import { Calculator, BookOpen } from 'lucide-react';
import ProgressRing from '../../components/ui/ProgressRing';
import API from '../../utils/api';

const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0 };

const getGrade = (pct) => {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C+';
  if (pct >= 40) return 'C';
  if (pct >= 30) return 'D';
  return 'F';
};

const gradeColors = { 'A+': 'text-emerald-400', 'A': 'text-emerald-400', 'B+': 'text-blue-400', 'B': 'text-blue-400', 'C+': 'text-amber-400', 'C': 'text-amber-400', 'D': 'text-orange-400', 'F': 'text-red-400' };

const GpaCalculator = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualCourses, setManualCourses] = useState([{ name: '', grade: 'A', credits: 3 }]);

  useEffect(() => { API.get('/dashboard/stats').then((r) => setStats(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  // Calculate GPA from actual marks
  const courseMarks = stats?.courseMarks || {};
  const courseEntries = Object.entries(courseMarks);

  const actualGrades = courseEntries.map(([code, marks]) => {
    const avg = marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length;
    const grade = getGrade(avg);
    return { code, avg: Math.round(avg), grade, gp: gradePoints[grade] };
  });

  const actualGPA = actualGrades.length > 0
    ? (actualGrades.reduce((sum, g) => sum + g.gp, 0) / actualGrades.length).toFixed(2)
    : 0;

  // Manual calculator
  const addCourse = () => setManualCourses([...manualCourses, { name: '', grade: 'A', credits: 3 }]);
  const updateCourse = (i, field, val) => {
    const c = [...manualCourses];
    c[i][field] = val;
    setManualCourses(c);
  };
  const removeCourse = (i) => setManualCourses(manualCourses.filter((_, idx) => idx !== i));

  const manualGPA = manualCourses.length > 0
    ? (manualCourses.reduce((sum, c) => sum + gradePoints[c.grade] * c.credits, 0) / manualCourses.reduce((sum, c) => sum + c.credits, 0)).toFixed(2)
    : 0;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-white">GPA Calculator</h1><p className="text-slate-400 mt-1">Track your academic performance</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current GPA from marks */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <ProgressRing value={parseFloat(actualGPA)} max={10} size={120} strokeWidth={10} color="#6366f1" />
          <p className="mt-3 text-lg font-bold text-white">{actualGPA}</p>
          <p className="text-xs text-slate-500">Current CGPA</p>
        </div>

        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><BookOpen size={16} className="text-indigo-400" /> Course-wise Performance</h3>
          {actualGrades.length === 0 ? <p className="text-sm text-slate-500">No marks data available</p> : (
            <div className="space-y-3">
              {actualGrades.map((g) => (
                <div key={g.code} className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                  <div>
                    <p className="text-sm font-medium text-white">{g.code}</p>
                    <p className="text-xs text-slate-500">Average: {g.avg}%</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${gradeColors[g.grade]}`}>{g.grade}</p>
                    <p className="text-xs text-slate-600">GP: {g.gp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Manual Calculator */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Calculator size={16} className="text-indigo-400" /> Manual GPA Calculator</h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-indigo-400">{manualGPA}</span>
            <span className="text-xs text-slate-500">GPA</span>
          </div>
        </div>
        <div className="space-y-2">
          {manualCourses.map((c, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input value={c.name} onChange={(e) => updateCourse(i, 'name', e.target.value)} className="input-dark col-span-4 text-xs" placeholder="Course Name" />
              <select value={c.grade} onChange={(e) => updateCourse(i, 'grade', e.target.value)} className="input-dark col-span-3 text-xs">
                {Object.keys(gradePoints).map((g) => <option key={g} value={g}>{g} ({gradePoints[g]})</option>)}
              </select>
              <input type="number" value={c.credits} onChange={(e) => updateCourse(i, 'credits', parseInt(e.target.value) || 0)} className="input-dark col-span-3 text-xs" min={1} max={10} />
              <button onClick={() => removeCourse(i)} className="col-span-2 text-xs text-red-400 hover:text-red-300">Remove</button>
            </div>
          ))}
        </div>
        <button onClick={addCourse} className="btn-secondary btn-sm mt-3 text-xs">+ Add Course</button>
      </div>

      {/* Grade Point Scale */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Grade Point Scale</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {Object.entries(gradePoints).map(([grade, pts]) => (
            <div key={grade} className="text-center p-3 rounded-xl bg-white/3">
              <p className={`text-lg font-bold ${gradeColors[grade]}`}>{grade}</p>
              <p className="text-xs text-slate-500">{pts} pts</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GpaCalculator;
