/**
 * Page Login / Register — authentification complète
 */

import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { 
  GraduationCap, Eye, EyeOff, LogIn, UserPlus, 
  AlertCircle, Sparkles, Mail, Lock, User, ArrowLeft,
  Key, Send, CheckCircle2, Shield, AtSign
} from 'lucide-react'

export default function Login() {
  const { login, isAuth } = useAuth()
  const navigate = useNavigate()
  const { show, ToastContainer } = useToast()

  // ─── États ───
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'
  const [step, setStep] = useState(1) // Pour forgot password (1: email, 2: code, 3: new password)
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    resetCode: '',
    newPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  if (isAuth) return <Navigate to="/dashboard" replace />

  // ─── Handlers ───
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    setStep(1)
    setForm({ username: '', email: '', password: '', confirmPassword: '', resetCode: '', newPassword: '' })
  }

  // ─── Login ───
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      await login({ username: form.username.trim(), password: form.password })
      show('Connexion réussie !', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Register ───
  const handleRegister = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError('Tous les champs sont obligatoires.')
      return
    }
    if (form.username.trim().length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Veuillez entrer une adresse email valide.')
      return
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await authAPI.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password
      })
      show('Compte créé avec succès ! Vous pouvez maintenant vous connecter.', 'success')
      switchMode('login')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Forgot Password - Step 1: Send code ───
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) {
      setError('Veuillez entrer votre adresse email.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Veuillez entrer une adresse email valide.')
      return
    }

    setLoading(true)
    try {
      await authAPI.forgotPassword({ email: form.email.trim() })
      setResetEmail(form.email.trim())
      show('Code de réinitialisation envoyé par email.', 'success')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Forgot Password - Step 2: Verify code ───
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (!form.resetCode.trim()) {
      setError('Veuillez entrer le code de réinitialisation.')
      return
    }

    setLoading(true)
    try {
      await authAPI.verifyResetCode({ 
        email: resetEmail, 
        code: form.resetCode.trim() 
      })
      show('Code vérifié avec succès.', 'success')
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Forgot Password - Step 3: New password ───
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!form.newPassword || !form.confirmPassword) {
      setError('Tous les champs sont obligatoires.')
      return
    }
    if (form.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await authAPI.resetPassword({
        email: resetEmail,
        code: form.resetCode.trim(),
        password: form.newPassword
      })
      show('Mot de passe réinitialisé avec succès !', 'success')
      switchMode('login')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ───
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030508] p-6 relative overflow-hidden">
      <ToastContainer />

      {/* Animated gradient orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-cyan-500/20 via-indigo-500/10 to-transparent blur-[150px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-indigo-500/15 via-cyan-500/5 to-transparent blur-[130px] animate-pulse-slow animation-delay-2000 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-radial from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cyan-400/30 animate-float pointer-events-none"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${Math.random() * 4 + 4}s`,
          }}
        />
      ))}

      {/* Main container */}
      <div className="relative w-full max-w-[520px]">
        
        {/* Logo section - outside card */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-4">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-500 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            <div 
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center border border-cyan-500/30 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(99,102,241,0.1) 100%)',
              }}
            >
              <GraduationCap size={36} className="text-cyan-400 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            GestionEns
          </h1>
          <p className="text-[#6b7a90] text-base mt-2 flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-500/70" />
            Système de gestion des enseignants
          </p>
        </div>

        {/* Card */}
        <div 
          className="relative backdrop-blur-2xl rounded-3xl p-10 border border-white/[0.08] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,20,30,0.9) 0%, rgba(10,15,25,0.95) 100%)',
            boxShadow: `
              0 0 0 1px rgba(0,240,255,0.1),
              0 25px 60px -15px rgba(0,0,0,0.5),
              0 0 120px rgba(0,240,255,0.05),
              inset 0 1px 0 rgba(255,255,255,0.05)
            `,
          }}
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-cyan-500/20 rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-indigo-500/20 rounded-br-3xl" />

          {/* Mode selector */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/[0.03] text-[#6b7a90] border border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <LogIn size={16} />
                Connexion
              </span>
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                  : 'bg-white/[0.03] text-[#6b7a90] border border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus size={16} />
                Créer un compte
              </span>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div 
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-400 text-sm mb-6 border border-rose-500/20 animate-shake"
              style={{
                background: 'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(244,63,94,0.05) 100%)',
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* ─── LOGIN FORM ─── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-wider">
                  Nom d'utilisateur
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4d5a6e]">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Entrez votre identifiant"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-base placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-wider">
                  Mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4d5a6e]">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Entrez votre mot de passe"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full h-14 pl-12 pr-14 rounded-2xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-base placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4d5a6e] hover:text-cyan-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-sm text-cyan-400/80 hover:text-cyan-400 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full h-14 rounded-2xl font-semibold text-base text-[#030508] overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group mt-4"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff 0%, #00c8d4 50%, #00a8b8 100%)',
                  boxShadow: '0 0 40px rgba(0,240,255,0.3), 0 0 80px rgba(0,240,255,0.1)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-[#030508] border-t-transparent animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      Se connecter
                    </>
                  )}
                </span>
              </button>
            </form>
          )}

          {/* ─── REGISTER FORM ─── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-wider">
                  Nom d'utilisateur
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4d5a6e]">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Choisissez un identifiant"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-base placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-indigo-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-wider">
                  Adresse email
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4d5a6e]">
                    <AtSign size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-base placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-indigo-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-wider">
                  Mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4d5a6e]">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 caractères"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full h-14 pl-12 pr-14 rounded-2xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-base placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-indigo-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4d5a6e] hover:text-indigo-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-wider">
                  Confirmer le mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4d5a6e]">
                    <CheckCircle2 size={18} />
                  </div>
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Répétez le mot de passe"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full h-14 pl-12 pr-14 rounded-2xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-base placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-indigo-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4d5a6e] hover:text-indigo-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full h-14 rounded-2xl font-semibold text-base text-white overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group mt-4"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.1)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      Créer mon compte
                    </>
                  )}
                </span>
              </button>

              <p className="text-center text-sm text-[#4d5a6e]">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  Se connecter
                </button>
              </p>
            </form>
          )}

          {/* ─── FORGOT PASSWORD FORM ─── */}
          {mode === 'forgot' && (
            <div className="space-y-6">
              {/* Back button */}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="flex items-center gap-2 text-sm text-[#6b7a90] hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                Retour à la connexion
              </button>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                      s <= step ? 'bg-cyan-500' : 'bg-white/[0.06]'
                    }`}
                  />
                ))}
              </div>

              {/* Step 1: Email */}
              {step === 1 && (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                      <Mail size={28} className="text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Mot de passe oublié ?</h3>
                    <p className="text-sm text-[#6b7a90] leading-relaxed">
                      Entrez votre adresse email pour recevoir un code de réinitialisation.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-wider">
                      Adresse email
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4d5a6e]">
                        <AtSign size={18} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        disabled={loading}
                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-base placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-14 rounded-2xl font-semibold text-base text-[#030508] overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group"
                    style={{
                      background: 'linear-gradient(135deg, #00f0ff 0%, #00c8d4 50%, #00a8b8 100%)',
                      boxShadow: '0 0 40px rgba(0,240,255,0.3)',
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-[#030508] border-t-transparent animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Envoyer le code
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}

              {/* Step 2: Verify code */}
              {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                      <Key size={28} className="text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Vérification</h3>
                    <p className="text-sm text-[#6b7a90] leading-relaxed">
                      Un code a été envoyé à <span className="text-cyan-400 font-medium">{resetEmail}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-wider">
                      Code de réinitialisation
                    </label>
                    <input
                      type="text"
                      name="resetCode"
                      value={form.resetCode}
                      onChange={handleChange}
                      placeholder="Entrez le code reçu"
                      disabled={loading}
                      className="w-full h-14 px-4 rounded-2xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-14 rounded-2xl font-semibold text-base text-[#030508] overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group"
                    style={{
                      background: 'linear-gradient(135deg, #00f0ff 0%, #00c8d4 50%, #00a8b8 100%)',
                      boxShadow: '0 0 40px rgba(0,240,255,0.3)',
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-[#030508] border-t-transparent animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        <>
                          <Shield size={20} />
                          Vérifier le code
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}

              {/* Step 3: New password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                      <Lock size={28} className="text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nouveau mot de passe</h3>
                    <p className="text-sm text-[#6b7a90] leading-relaxed">
                      Choisissez un nouveau mot de passe sécurisé.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-wider">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="Minimum 6 caractères"
                      disabled={loading}
                      className="w-full h-14 px-4 rounded-2xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-base placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#6b7a90] uppercase tracking-wider">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Répétez le mot de passe"
                      disabled={loading}
                      className="w-full h-14 px-4 rounded-2xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-base placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-14 rounded-2xl font-semibold text-base text-[#030508] overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group"
                    style={{
                      background: 'linear-gradient(135deg, #00f0ff 0%, #00c8d4 50%, #00a8b8 100%)',
                      boxShadow: '0 0 40px rgba(0,240,255,0.3)',
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-[#030508] border-t-transparent animate-spin" />
                          Réinitialisation...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Réinitialiser le mot de passe
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#3d4a5c] mt-8 tracking-wide">
          © {new Date().getFullYear()} GestionEns · Tous droits réservés
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-15px) translateX(8px); }
          50% { transform: translateY(-8px) translateX(-8px); }
          75% { transform: translateY(-20px) translateX(5px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  )
}
