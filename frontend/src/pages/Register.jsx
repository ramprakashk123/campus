import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, GraduationCap, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import API from '../utils/api';

const Register = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      registerNumber: formData.get('registerNumber'),
      department: formData.get('department'),
      year: formData.get('year') ? Number(formData.get('year')) : undefined,
      phone: formData.get('phone'),
    };

    if (data.password !== formData.get('confirmPassword')) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await API.post('/auth/register', data);
      login(res.data);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-900">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center mb-8">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 text-center">Join CampusPro</h1>
          <p className="text-base text-emerald-100/80 text-center max-w-sm leading-relaxed">
            Create your student account and start tracking your academic journey today.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-800">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">CampusPro</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Fill in your details to register as a Student</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
                <input name="name" required className="input-dark" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Register No.</label>
                <input name="registerNumber" className="input-dark" placeholder="21CS001" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
              <input name="email" type="email" required className="input-dark" placeholder="you@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
                <select name="department" className="input-dark">
                  <option value="">Select</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="IT">IT</option>
                  <option value="AIDS">AI & DS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Year</label>
                <select name="year" className="input-dark">
                  <option value="">Select</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
              <input name="phone" className="input-dark" placeholder="+91 1234567890" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-dark pr-12"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm *</label>
                <input name="confirmPassword" type="password" required className="input-dark" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
