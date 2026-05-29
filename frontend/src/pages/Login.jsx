/**
 * Page Login / Register — authentification complète
 * Connexion par email OU nom d'utilisateur + mot de passe (comme GitHub)
 * Design premium avec validation temps réel
 */

import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { 
  GraduationCap, Eye, EyeOff, LogIn, UserPlus, 
  AlertCircle, Sparkles, Mail, Lock, User, ArrowLeft,
  Key, Send, CheckCircle2, Shield, AtSign, Save,
  BadgeCheck, XCircle
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════
   CHAMP AVEC VALIDATION
   ═══════════════════════════════════════════════════════════ */
function ValidatedField({ 
  label, icon: Icon, name, type = 'text', value, onChange, onBlur,
  placeholder, autoComplete, disabled, error, isValid, isDirty,
  rightIcon, onRightIconClick, rightIconLabel
}) {
  const showSuccess = isDirty && isValid && !error
  const showError = isDirty && error

  return (
    <div className="space-y-2">
      <label className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {showSuccess && (
            <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: '#10b981' }}>
              <BadgeCheck size={11} />
              Valide
            </span>
          )}
          {showError && (
            <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: '#ef4444' }}>
              <XCircle size={11} />
              {error.length > 25 ? 'Invalide' : error}
            </span>
          )}
        </div>
      </label>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: showError ? '#ef4444' : showSuccess ? '#10b981' : 'var(--text-muted)' }}>
          <Icon size={17} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full h-12 pl-11 pr-12 rounded-xl text-sm transition-all duration-200 focus:outline-none"
          style={{
            background: showError ? 'rgba(239,68,68,0.04)' : showSuccess ? 'rgba(16,185,129,0.04)' : 'var(--input-bg)',
            border: showError ? '2px solid rgba(239,68,68,0.4)' : showSuccess ? '2px solid rgba(16,185,129,0.4)' : '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            tabIndex={-1}
            title={rightIconLabel}
          >
            {rightIcon}
          </button>
        )}
      </div>

      {showError && (
        <p className="flex items-center gap-1.5 text-[11px] ml-1" style={{ color: '#ef4444' }}>
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PAGE LOGIN
   ═══════════════════════════════════════════════════════════ */
export default function Login() {
  const { login, isAuth } = useAuth()
  const navigate = useNavigate()
  const { show, ToastContainer } = useToast()

  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ 
    login: '',        // ← email OU username (comme GitHub)
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    resetCode: '', 
    newPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  if (isAuth) return <Navigate to="/dashboard" replace />

  // ═══ Validation temps réel ═══
  useEffect(() => {
    const newErrors = {}
    
    if (mode === 'login') {
      if (dirty.login) {
        if (!form.login.trim()) {
          newErrors.login = "Veuillez entrer votre email ou nom d'utilisateur."
        }
      }
      if (dirty.password) {
        if (!form.password) {
          newErrors.password = 'Veuillez entrer votre mot de passe.'
        }
      }
    }

    if (mode === 'register') {
      if (dirty.username) {
        if (!form.username.trim()) newErrors.username = "Choisissez un nom d'utilisateur."
        else if (form.username.trim().length < 3) newErrors.username = 'Minimum 3 caractères.'
      }
      if (dirty.email) {
        if (!form.email.trim()) newErrors.email = 'Votre adresse email est requise.'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Format d'email invalide. Exemple : nom@domaine.com"
      }
      if (dirty.password) {
        if (!form.password) newErrors.password = 'Choisissez un mot de passe.'
        else if (form.password.length < 6) newErrors.password = 'Minimum 6 caractères.'
      }
      if (dirty.confirmPassword) {
        if (!form.confirmPassword) newErrors.confirmPassword = 'Confirmez votre mot de passe.'
        else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Les deux mots de passe sont différents.'
      }
    }

    if (mode === 'forgot' && step === 1) {
      if (dirty.email) {
        if (!form.email.trim()) newErrors.email = 'Veuillez entrer votre adresse email.'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Format d'email invalide."
      }
    }

    if (mode === 'forgot' && step === 2) {
      if (dirty.resetCode && !form.resetCode.trim()) {
        newErrors.resetCode = 'Veuillez entrer le code reçu par email.'
      }
    }

    if (mode === 'forgot' && step === 3) {
      if (dirty.newPassword) {
        if (!form.newPassword) newErrors.newPassword = 'Choisissez un nouveau mot de passe.'
        else if (form.newPassword.length < 6) newErrors.newPassword = 'Minimum 6 caractères.'
      }
      if (dirty.confirmPassword) {
        if (!form.confirmPassword) newErrors.confirmPassword = 'Confirmez votre nouveau mot de passe.'
        else if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = 'Les deux mots de passe sont différents.'
      }
    }

    setErrors(newErrors)
    setServerError('')
  }, [form, dirty, mode, step])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setServerError('')
  }

  const handleBlur = (e) => {
    setDirty((d) => ({ ...d, [e.target.name]: true }))
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setServerError('')
    setErrors({})
    setDirty({})
    setStep(1)
    setForm({ login: '', username: '', email: '', password: '', confirmPassword: '', resetCode: '', newPassword: '' })
  }

  const markAllDirty = () => {
    if (mode === 'login') setDirty({ login: true, password: true })
    if (mode === 'register') setDirty({ username: true, email: true, password: true, confirmPassword: true })
    if (mode === 'forgot' && step === 1) setDirty({ email: true })
    if (mode === 'forgot' && step === 2) setDirty({ resetCode: true })
    if (mode === 'forgot' && step === 3) setDirty({ newPassword: true, confirmPassword: true })
  }

  // ═══ LOGIN — email OU username + mot de passe ═══
  const handleLogin = async (e) => {
    e.preventDefault()
    markAllDirty()
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    setServerError('')
    
    // Détecter si l'utilisateur a entré un email ou un username
    const loginValue = form.login.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginValue)
    
    const credentials = {
      password: form.password,
    }
    
    if (isEmail) {
      credentials.email = loginValue
    } else {
      credentials.username = loginValue
    }

    try {
      await login(credentials)
      show('Connexion réussie !', 'success')
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message || ''
      const msgLower = msg.toLowerCase()

      // ═══ Détection par statut HTTP ═══
      if (status === 401) {
        // 401 = Non autorisé → le compte existe mais le mot de passe est faux
        setServerError('Mot de passe incorrect.')
        setErrors(prev => ({ ...prev, password: 'Ce mot de passe est incorrect.' }))
      }
      else if (status === 404) {
        // 404 = Non trouvé → aucun compte avec cet email/username
        setServerError(isEmail 
          ? "Aucun compte associé à cette adresse email." 
          : "Aucun compte trouvé avec ce nom d'utilisateur."
        )
        setErrors(prev => ({ ...prev, login: isEmail ? 'Adresse email introuvable.' : "Nom d'utilisateur introuvable." }))
      }
      else if (status === 403) {
        setServerError('Votre compte est désactivé. Contactez un administrateur.')
      }
      else if (status === 429) {
        setServerError('Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.')
      }
      
      // ═══ Détection par message ═══
      else if (msgLower.includes('password') || msgLower.includes('mot de passe')) {
        setServerError('Mot de passe incorrect.')
        setErrors(prev => ({ ...prev, password: 'Ce mot de passe est incorrect.' }))
      } 
      else if (msgLower.includes('user') || msgLower.includes('username') || 
               msgLower.includes('identifiant') || msgLower.includes('utilisateur') ||
               msgLower.includes('not found') || msgLower.includes('introuvable') ||
               msgLower.includes("n'existe pas") || msgLower.includes('email')) {
        setServerError(isEmail 
          ? "Aucun compte associé à cette adresse email." 
          : "Aucun compte trouvé avec ce nom d'utilisateur."
        )
        setErrors(prev => ({ ...prev, login: isEmail ? 'Adresse email introuvable.' : "Nom d'utilisateur introuvable." }))
      }
      else {
        setServerError(msg || 'Erreur de connexion. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ═══ REGISTER ═══
  const handleRegister = async (e) => {
    e.preventDefault()
    markAllDirty()
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    setServerError('')
    try {
      await authAPI.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password
      })
      show('Compte créé avec succès ! Vous pouvez maintenant vous connecter.', 'success')
      switchMode('login')
    } catch (err) {
      const msg = err.response?.data?.message || ''
      const msgLower = msg.toLowerCase()
      
      if (msgLower.includes('email')) {
        setServerError('Cette adresse email est déjà utilisée par un autre compte.')
        setErrors(prev => ({ ...prev, email: 'Email déjà utilisé.' }))
      } else if (msgLower.includes('username') || msgLower.includes('utilisateur') || msgLower.includes("nom d'utilisateur")) {
        setServerError("Ce nom d'utilisateur est déjà pris. Choisissez-en un autre.")
        setErrors(prev => ({ ...prev, username: 'Nom d\'utilisateur déjà pris.' }))
      } else {
        setServerError(msg || "Erreur lors de la création du compte. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ═══ FORGOT PASSWORD ═══
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    markAllDirty()
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    setServerError('')
    try {
      await authAPI.forgotPassword({ email: form.email.trim() })
      setResetEmail(form.email.trim())
      show('Un code de réinitialisation a été envoyé à votre adresse email.', 'success')
      setStep(2)
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('introuvable')) {
        setServerError("Aucun compte associé à cette adresse email.")
        setErrors(prev => ({ ...prev, email: 'Adresse email introuvable.' }))
      } else {
        setServerError(msg || "Erreur lors de l'envoi du code. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    markAllDirty()
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    setServerError('')
    try {
      await authAPI.verifyResetCode({ email: resetEmail, code: form.resetCode.trim() })
      show('Code vérifié avec succès.', 'success')
      setStep(3)
    } catch (err) {
      setServerError('Le code est incorrect ou a expiré. Vérifiez et réessayez.')
      setErrors(prev => ({ ...prev, resetCode: 'Code incorrect.' }))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    markAllDirty()
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    setServerError('')
    try {
      await authAPI.resetPassword({
        email: resetEmail,
        code: form.resetCode.trim(),
        password: form.newPassword
      })
      show('Votre mot de passe a été réinitialisé avec succès !', 'success')
      switchMode('login')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Erreur lors de la réinitialisation. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const isFieldValid = (name) => dirty[name] && !errors[name] && form[name]?.trim()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <ToastContainer />

      {/* Fond décoratif subtil */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
           style={{
             backgroundImage: `radial-gradient(circle at 50% 50%, var(--text-primary) 1px, transparent 1px)`,
             backgroundSize: '40px 40px',
           }} />

      <div className="relative w-full max-w-[480px]">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
               style={{
                 background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(8,145,178,0.1))',
                 border: '1px solid rgba(6,182,212,0.25)',
                 boxShadow: '0 4px 20px rgba(8,145,178,0.15)'
               }}>
            <GraduationCap size={28} style={{ color: '#0891b2' }} />
          </div>
          <h1 className="page-title !text-3xl">GestionEns</h1>
          <p className="text-xs mt-2 flex items-center gap-1.5 text-muted">
            <Sparkles size={12} style={{ color: '#0891b2' }} />
            Système de gestion des enseignants
          </p>
        </div>

        {/* Card */}
        <div className="card !p-8">
          {/* Mode selector */}
          <div className="flex gap-2 mb-7 p-1 rounded-xl" style={{ background: 'var(--surface-bg)' }}>
            <button
              onClick={() => switchMode('login')}
              className="flex-1 h-10 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: mode === 'login' ? 'var(--card-bg)' : 'transparent',
                color: mode === 'login' ? '#0891b2' : 'var(--text-muted)',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <LogIn size={14} />
              Connexion
            </button>
            <button
              onClick={() => switchMode('register')}
              className="flex-1 h-10 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: mode === 'register' ? 'var(--card-bg)' : 'transparent',
                color: mode === 'register' ? '#4f46e5' : 'var(--text-muted)',
                boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <UserPlus size={14} />
              Inscription
            </button>
          </div>

          {/* Server error banner */}
          {serverError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5" style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)'
            }}>
              <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{serverError}</p>
            </div>
          )}

          {/* ═══ LOGIN — Email ou Username + Mot de passe ═══ */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <ValidatedField
                label="Email ou nom d'utilisateur"
                icon={AtSign}
                name="login"
                value={form.login}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="votre@email.com ou identifiant"
                autoComplete="username"
                disabled={loading}
                error={errors.login}
                isValid={isFieldValid('login')}
                isDirty={dirty.login}
              />

              <ValidatedField
                label="Mot de passe"
                icon={Lock}
                name="password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Entrez votre mot de passe"
                autoComplete="current-password"
                disabled={loading}
                error={errors.password}
                isValid={isFieldValid('password')}
                isDirty={dirty.password}
                rightIcon={showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                onRightIconClick={() => setShowPwd(v => !v)}
                rightIconLabel={showPwd ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
              />

              <div className="flex justify-end">
                <button type="button" onClick={() => switchMode('forgot')} className="text-xs font-medium" style={{ color: '#0891b2' }}>
                  Mot de passe oublié ?
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full !py-3 !text-sm !rounded-xl">
                {loading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Connexion en cours...</>
                ) : (
                  <><LogIn size={16} />Se connecter</>
                )}
              </button>

              {/* Indication subtile */}
              <p className="text-center text-[11px] text-muted">
                Connectez-vous avec votre <strong>email</strong> ou votre <strong>nom d'utilisateur</strong>
              </p>
            </form>
          )}

          {/* ═══ REGISTER ═══ */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              <ValidatedField
                label="Nom d'utilisateur"
                icon={User}
                name="username"
                value={form.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Choisissez un identifiant public"
                autoComplete="username"
                disabled={loading}
                error={errors.username}
                isValid={isFieldValid('username')}
                isDirty={dirty.username}
              />
              <ValidatedField
                label="Adresse email"
                icon={AtSign}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="votre@email.com"
                autoComplete="email"
                disabled={loading}
                error={errors.email}
                isValid={isFieldValid('email')}
                isDirty={dirty.email}
              />
              <ValidatedField
                label="Mot de passe"
                icon={Lock}
                name="password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Au moins 6 caractères"
                autoComplete="new-password"
                disabled={loading}
                error={errors.password}
                isValid={isFieldValid('password')}
                isDirty={dirty.password}
                rightIcon={showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                onRightIconClick={() => setShowPwd(v => !v)}
              />
              <ValidatedField
                label="Confirmer le mot de passe"
                icon={CheckCircle2}
                name="confirmPassword"
                type={showConfirmPwd ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Répétez votre mot de passe"
                autoComplete="new-password"
                disabled={loading}
                error={errors.confirmPassword}
                isValid={isFieldValid('confirmPassword')}
                isDirty={dirty.confirmPassword}
                rightIcon={showConfirmPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                onRightIconClick={() => setShowConfirmPwd(v => !v)}
              />

              <button type="submit" disabled={loading} className="btn-primary w-full !py-3 !text-sm !rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                {loading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Création du compte...</>
                ) : (
                  <><UserPlus size={16} />Créer mon compte</>
                )}
              </button>

              <p className="text-center text-xs text-muted">
                Déjà un compte ?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-medium" style={{ color: '#0891b2' }}>
                  Se connecter
                </button>
              </p>
            </form>
          )}

          {/* ═══ FORGOT PASSWORD ═══ */}
          {mode === 'forgot' && (
            <div className="space-y-5">
              <button type="button" onClick={() => switchMode('login')} className="flex items-center gap-2 text-xs text-muted hover:text-primary transition-colors">
                <ArrowLeft size={14} />
                Retour à la connexion
              </button>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300"
                       style={{ background: s <= step ? '#0891b2' : 'var(--surface-bg)' }} />
                ))}
              </div>

              {step === 1 && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                         style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                      <Mail size={22} style={{ color: '#0891b2' }} />
                    </div>
                    <h3 className="text-sm font-semibold text-primary mb-1">Mot de passe oublié ?</h3>
                    <p className="text-xs text-muted">Entrez votre adresse email pour recevoir un code de réinitialisation.</p>
                  </div>
                  <ValidatedField
                    label="Adresse email"
                    icon={AtSign}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="votre@email.com"
                    disabled={loading}
                    error={errors.email}
                    isValid={isFieldValid('email')}
                    isDirty={dirty.email}
                  />
                  <button type="submit" disabled={loading} className="btn-primary w-full !py-3 !text-sm !rounded-xl">
                    {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Envoi en cours...</> : <><Send size={16} />Envoyer le code</>}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                         style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                      <Key size={22} style={{ color: '#0891b2' }} />
                    </div>
                    <h3 className="text-sm font-semibold text-primary mb-1">Vérification</h3>
                    <p className="text-xs text-muted">Un code a été envoyé à <span style={{ color: '#0891b2', fontWeight: 500 }}>{resetEmail}</span></p>
                  </div>
                  <ValidatedField
                    label="Code de réinitialisation"
                    icon={Shield}
                    name="resetCode"
                    value={form.resetCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Entrez le code à 6 chiffres"
                    disabled={loading}
                    error={errors.resetCode}
                    isValid={isFieldValid('resetCode')}
                    isDirty={dirty.resetCode}
                  />
                  <button type="submit" disabled={loading} className="btn-primary w-full !py-3 !text-sm !rounded-xl">
                    {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Vérification...</> : <><Shield size={16} />Vérifier le code</>}
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                         style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                      <Lock size={22} style={{ color: '#0891b2' }} />
                    </div>
                    <h3 className="text-sm font-semibold text-primary mb-1">Nouveau mot de passe</h3>
                    <p className="text-xs text-muted">Choisissez un mot de passe sécurisé d'au moins 6 caractères.</p>
                  </div>
                  <ValidatedField
                    label="Nouveau mot de passe"
                    icon={Lock}
                    name="newPassword"
                    type="password"
                    value={form.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Minimum 6 caractères"
                    disabled={loading}
                    error={errors.newPassword}
                    isValid={isFieldValid('newPassword')}
                    isDirty={dirty.newPassword}
                  />
                  <ValidatedField
                    label="Confirmer le mot de passe"
                    icon={CheckCircle2}
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Répétez le mot de passe"
                    disabled={loading}
                    error={errors.confirmPassword}
                    isValid={isFieldValid('confirmPassword')}
                    isDirty={dirty.confirmPassword}
                  />
                  <button type="submit" disabled={loading} className="btn-primary w-full !py-3 !text-sm !rounded-xl">
                    {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Réinitialisation...</> : <><Save size={16} />Réinitialiser le mot de passe</>}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-[10px] mt-6 text-muted">
          © {new Date().getFullYear()} GestionEns · Tous droits réservés
        </p>
      </div>
    </div>
  )
}
