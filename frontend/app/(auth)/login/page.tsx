'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Eye, EyeOff, Loader2, XCircle, ShieldCheck, Mail, Lock, ArrowRight, Building2 } from 'lucide-react';

const FEATURES = [
  { title: 'Policy Lifecycle', desc: 'Quote to issuance in minutes' },
  { title: 'Claims Automation', desc: 'FNOL to settlement tracking' },
  { title: 'Risk Intelligence', desc: 'Real-time underwriting scoring' },
  { title: 'Compliance Ready', desc: 'Regulatory audit trails built-in' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Brand / Hero ────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-[#0f1729] via-[#162036] to-[#1a2744]">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Gradient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-blue-500/10 to-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/[0.04] to-transparent rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-tight">IMGC</span>
                <span className="text-white/40 text-xs block -mt-0.5 tracking-widest uppercase">Corporation</span>
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-orange-300 text-xs font-medium tracking-wide">Enterprise Platform</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-4">
                Policy Administration
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300">
                  System
                </span>
              </h1>
              <p className="text-white/50 text-base leading-relaxed max-w-md">
                End-to-end insurance operations management — from underwriting and policy issuance to claims processing and compliance tracking.
              </p>
            </div>

            {/* Feature cards */}
            <div className={`grid grid-cols-2 gap-3 mt-10 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 cursor-default"
                  style={{ transitionDelay: `${600 + i * 80}ms` }}
                >
                  <h3 className="text-white/90 text-sm font-semibold mb-0.5">{f.title}</h3>
                  <p className="text-white/35 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={`transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 text-white/25 text-xs">
              <ShieldCheck size={14} />
              <span>256-bit encrypted &middot; SOC 2 compliant &middot; IRDAI regulated</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#fafbfc] relative p-6">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div className={`relative z-10 w-full max-w-[400px] transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Mobile logo (hidden on lg+) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-3 shadow-lg shadow-orange-500/25">
              <Building2 size={26} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">IMGC PAS</h1>
            <p className="text-gray-400 text-xs mt-0.5">Policy Administration System</p>
          </div>

          {/* Welcome text */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-shake">
              <div className="p-1 bg-red-100 rounded-lg mt-0.5">
                <XCircle size={14} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-red-700 text-sm font-medium">Authentication failed</p>
                <p className="text-red-500 text-xs mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-300 hover:text-red-500 transition-colors p-1">
                <XCircle size={14} />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200 shadow-sm hover:border-gray-300"
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200 shadow-sm hover:border-gray-300"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
            <div className="mt-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-800 text-xs font-semibold mb-1.5">Demo Credentials</p>
              <div className="space-y-1 text-[11px] text-amber-700">
                <p><span className="font-medium">Admin:</span> admin@imgc.com</p>
                <p><span className="font-medium">Underwriter:</span> underwriter@imgc.com</p>
                <p><span className="font-medium">Claims:</span> claims@imgc.com</p>
                <p className="text-amber-600 mt-1.5">Password for all: <span className="font-mono font-semibold">demo123</span></p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative mt-8 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#fafbfc] px-3 text-xs text-gray-400">Platform Information</span>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Modules', value: '14+' },
              { label: 'API Endpoints', value: '150+' },
              { label: 'User Roles', value: '5' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              India Mortgage Guarantee Corporation
            </p>
            <p className="text-[10px] text-gray-300 mt-1">
              Secure access &middot; All sessions encrypted &middot; v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
