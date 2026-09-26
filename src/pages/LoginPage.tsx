import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, register, error } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('kishores2529cse@gmail.com');
  const [password, setPassword] = useState('123456789');
  const [name, setName] = useState('KISHORE S');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) { setLocalError('Name is required'); setLoading(false); return; }
        await register(email, password, name);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)' }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">PlacementPrep AI</span>
        </div>
        <div>
          <h1 className="text-5xl font-black leading-tight mb-6">
            Your AI-Powered<br />Placement<br />Command Center
          </h1>
          <p className="text-emerald-200 text-lg leading-relaxed max-w-md">
            Track your readiness, master learning tracks, and get personalized AI recommendations to land your dream job.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { label: 'Students', value: '10K+' },
              { label: 'Avg Readiness Gain', value: '+32%' },
              { label: 'Placements', value: '2.4K' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-emerald-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-emerald-300 text-sm">© 2026 PlacementPrep AI. Built for engineering students.</div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2 lg:hidden">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">PlacementPrep AI</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {mode === 'login'
                ? 'Sign in to your placement dashboard'
                : 'Start your placement journey today'}
            </p>

            {/* Demo hint */}
            {mode === 'login' && (
              <div
                onClick={() => {
                  setEmail('kishores2529cse@gmail.com');
                  setPassword('123456789');
                }}
                className="mb-6 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-emerald-800 cursor-pointer hover:bg-emerald-100/90 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Demo Access (KISHORE S)
                  </div>
                  <div className="text-xs font-mono text-emerald-900">
                    <span className="font-semibold text-emerald-700">Email:</span> kishores2529cse@gmail.com
                  </div>
                  <div className="text-xs font-mono text-emerald-900">
                    <span className="font-semibold text-emerald-700">Pass:</span> 123456789
                  </div>
                </div>
                <span className="text-xs bg-emerald-600 group-hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-medium shadow-sm transition-all whitespace-nowrap">
                  Auto Fill
                </span>
              </div>
            )}

            {/* Error */}
            {(localError || error) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {localError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="KISHORE S"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="kishores2529cse@gmail.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-200"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => setMode('register')} className="text-emerald-600 font-semibold hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-emerald-600 font-semibold hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
