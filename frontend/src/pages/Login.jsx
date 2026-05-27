/**
 * Page Login — authentification ultra moderne
 */

import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Eye, EyeOff, LogIn, AlertCircle, Sparkles } from 'lucide-react'

export default function Login() {
  const { login, isAuth } = useAuth()
  const navigate          = useNavigate()

  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  if (isAuth) return <Navigate to="/dashboard" replace />

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur de connexion. Vérifiez vos identifiants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030508] p-4 relative overflow-hidden">

      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-500/20 via-indigo-500/10 to-transparent blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-indigo-500/15 via-cyan-500/5 to-transparent blur-[100px] animate-pulse-slow animation-delay-2000 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-cyan-400/40 animate-float" />
      <div className="absolute top-40 right-32 w-1.5 h-1.5 rounded-full bg-indigo-400/50 animate-float animation-delay-1000" />
      <div className="absolute bottom-32 left-1/4 w-1 h-1 rounded-full bg-cyan-300/30 animate-float animation-delay-2000" />
      <div className="absolute bottom-20 right-20 w-2.5 h-2.5 rounded-full bg-indigo-400/30 animate-float animation-delay-3000" />

      <div className="relative w-full max-w-[420px]">

        {/* Card with glass effect */}
        <div 
          className="relative backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-white/[0.08] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,20,30,0.9) 0%, rgba(10,15,25,0.95) 100%)',
            boxShadow: `
              0 0 0 1px rgba(0,240,255,0.1),
              0 20px 50px -12px rgba(0,0,0,0.5),
              0 0 100px rgba(0,240,255,0.05),
              inset 0 1px 0 rgba(255,255,255,0.05)
            `,
          }}
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-cyan-500/20 rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-indigo-500/20 rounded-br-3xl" />

          {/* Header */}
          <div className="flex flex-col items-center mb-10 relative">
            {/* Animated icon container */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div 
                className="relative w-18 h-18 rounded-2xl flex items-center justify-center mb-5 border border-cyan-500/30 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(99,102,241,0.1) 100%)',
                }}
              >
                <GraduationCap size={32} className="text-cyan-400 relative z-10" />
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </div>
            
            <h1 className="font-display text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              GestionEns
            </h1>
            <p className="text-[#6b7a90] text-sm mt-2 flex items-center gap-2">
              <Sparkles size={12} className="text-cyan-500/70" />
              Systeme de gestion des enseignants
            </p>
          </div>

          {/* Error */}
          {error && (
            <div 
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-rose-400 text-sm mb-6 border border-rose-500/20 animate-shake"
              style={{
                background: 'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(244,63,94,0.05) 100%)',
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle size={16} />
              </div>
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-widest">
                Identifiant
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="admin"
                  autoComplete="username"
                  disabled={loading}
                  className="w-full h-12 px-4 rounded-xl bg-[#0a0f18]/80 border border-white/[0.06] text-white placeholder-[#3d4a5c] text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1),0_0_20px_rgba(0,240,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-widest">
                Mot de passe
              </label>
              <div className="relative group">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-[#0a0f18]/80 border border-white/[0.06] text-white placeholder-[#3d4a5c] text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1),0_0_20px_rgba(0,240,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#4d5a6e] hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-12 rounded-xl font-semibold text-sm text-[#030508] overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #00c8d4 50%, #00a8b8 100%)',
                boxShadow: '0 0 30px rgba(0,240,255,0.3), 0 0 60px rgba(0,240,255,0.1)',
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#030508] border-t-transparent animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Se connecter
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Hint */}
          <div className="mt-8 pt-6 border-t border-white/[0.04]">
            <p className="text-center text-xs text-[#4d5a6e]">
              Compte demo :{' '}
              <code className="px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400/80 font-mono text-[11px]">admin</code>
              {' / '}
              <code className="px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400/80 font-mono text-[11px]">admin123</code>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#3d4a5c] mt-6 tracking-wide">
          © {new Date().getFullYear()} GestionEns · Tous droits reserves
        </p>
      </div>

      {/* Custom styles for animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .w-18 { width: 4.5rem; }
        .h-18 { height: 4.5rem; }
      `}</style>
    </div>
  )
}
