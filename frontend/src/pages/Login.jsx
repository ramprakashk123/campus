import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, GraduationCap, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import API from '../utils/api';
import ParticleCanvas from '../components/ui/ParticleCanvas';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data);

      if (res.data.role === 'Admin') navigate('/admin');
      else if (res.data.role === 'Faculty') navigate('/faculty');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-900">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700" />
        
        {/* Particle Canvas */}
        <div className="absolute inset-0 z-[1]">
          <ParticleCanvas />
        </div>

        <div className="absolute inset-0 opacity-20 z-[0]">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 text-center leading-tight">
            Campus<span className="text-indigo-200">Pro</span>
          </h1>
          <p className="text-lg text-indigo-100/80 text-center max-w-md leading-relaxed">
            Modern campus management for the next generation of education. Track, manage, and excel.
          </p>
          <div className="mt-12 flex gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-white">1,200+</p>
              <p className="text-sm text-indigo-200/60 mt-1">Students</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-3xl font-bold text-white">85+</p>
              <p className="text-sm text-indigo-200/60 mt-1">Faculty</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-3xl font-bold text-white">40+</p>
              <p className="text-sm text-indigo-200/60 mt-1">Courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-800">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">CampusPro</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-dark"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-dark pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Student? Create an account{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Quick access hint */}
          <div className="mt-6 p-3 rounded-xl bg-white/3 text-center">
            <p className="text-[10px] text-slate-600">Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500 font-mono">Ctrl+K</kbd> for quick navigation after login</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
