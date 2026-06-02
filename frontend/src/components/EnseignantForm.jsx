/**
 * EnseignantForm — formulaire partagé Ajouter / Modifier
 * Design cohérent avec le design system existant
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { enseignantAPI } from '../services/api'
import { useToast } from '../components/Toast'
import {
  Save, ArrowLeft, User, Clock, Coins,
  Calculator, CheckCircle2, AlertCircle, Sparkles,
  RotateCcw, GraduationCap, BadgeCheck, XCircle
} from 'lucide-react'

/* ── Composant champ de saisie avec validation temps réel ── */
function SmartField({ label, icon: Icon, error, hint, isValid, isDirty, children }) {
  const showSuccess = isDirty && isValid && !error
  const showError = isDirty && error

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {Icon && (
            <div className="p-1.5 rounded-lg transition-all duration-200" style={{
              background: showError ? 'rgba(239, 68, 68, 0.08)' : showSuccess ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-bg)',
              border: `1px solid ${showError ? 'rgba(239, 68, 68, 0.2)' : showSuccess ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)'}`
            }}>
              <Icon size={14} style={{ color: showError ? '#e11d48' : showSuccess ? '#059669' : 'var(--text-muted)' }} />
            </div>
          )}
          {label}
        </label>
        <div className="flex items-center gap-2">
          {showSuccess && (
            <span className="badge badge-emerald gap-1.5">
              <BadgeCheck size={11} />
              Valide
            </span>
          )}
          {showError && (
            <span className="badge badge-rose gap-1.5">
              <XCircle size={11} />
              Invalide
            </span>
          )}
        </div>
      </div>
      {children}
      {hint && !isDirty && (
        <p className="flex items-center gap-1.5 text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
          <Sparkles size={11} className="text-cyan-500/50" />
          {hint}
        </p>
      )}
      {showError && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl" style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <AlertCircle size={13} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: '#e11d48' }}>Champ invalide</p>
            <p className="text-xs" style={{ color: '#e11d48', opacity: 0.85 }}>{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EnseignantForm({ mode = 'create' }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const { show, ToastContainer } = useToast()

  const [form, setForm] = useState({ nom: '', nbheures: '', tauxhoraire: '' })
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(mode === 'edit')
  const [formValid, setFormValid] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(null) // 'create' | 'edit' | null

  /* ── Validation field par field ── */
  const validateField = (name, value) => {
    const trimmedValue = typeof value === 'string' ? value.trim() : ''

    if (name === 'nom') {
      if (!trimmedValue) return 'Le nom complet est obligatoire.'
      if (trimmedValue.length < 3) return 'Le nom doit comporter au minimum 3 caractères.'
      if (trimmedValue.length > 100) return 'Le nom ne peut excéder 100 caractères.'
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedValue)) return 'Le nom contient des caractères non autorisés.'
      return null
    }

    if (name === 'nbheures') {
      if (value === '' || value === undefined || value === null) return "Le nombre d'heures est obligatoire."
      if (/[a-zA-Z]/.test(String(value))) return 'Veuillez saisir uniquement des chiffres, pas de lettres.'
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return 'Veuillez saisir une valeur numérique valide.'
      if (numValue <= 0) return "Le nombre d'heures doit être supérieur à zéro."
      if (numValue > 9999) return "Le nombre d'heures ne peut dépasser 9 999 heures."
      return null
    }

    if (name === 'tauxhoraire') {
      if (value === '' || value === undefined || value === null) return 'Le taux horaire est obligatoire.'
      if (/[a-zA-Z]/.test(String(value))) return 'Veuillez saisir uniquement des chiffres, pas de lettres.'
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return 'Veuillez saisir un montant valide.'
      if (numValue <= 0) return 'Le taux horaire doit être supérieur à zéro.'
      if (numValue > 9999999) return 'Le taux horaire ne peut dépasser 9 999 999 Ar.'
      return null
    }

    return null
  }

  /* ── Validation en temps réel ── */
  useEffect(() => {
    const newErrors = {}
    let allValid = true

    const nomError = validateField('nom', form.nom)
    if (nomError) { newErrors.nom = nomError; allValid = false }

    const heuresError = validateField('nbheures', form.nbheures)
    if (heuresError) { newErrors.nbheures = heuresError; allValid = false }

    const tauxError = validateField('tauxhoraire', form.tauxhoraire)
    if (tauxError) { newErrors.tauxhoraire = tauxError; allValid = false }

    setErrors(newErrors)
    setFormValid(allValid && Object.keys(newErrors).length === 0)
  }, [form, dirty])

  /* ── Champs valides pour la barre de progression ── */
  const validFields = {
    nom: !validateField('nom', form.nom),
    nbheures: !validateField('nbheures', form.nbheures),
    tauxhoraire: !validateField('tauxhoraire', form.tauxhoraire),
  }
  const nbValid = Object.values(validFields).filter(Boolean).length
  const totalFields = 3
  const progressionPercent = Math.round((nbValid / totalFields) * 100)

  /* ── Salaire calculé — uniquement si les deux champs sont valides et > 0 ── */
  const salaireInfo = (() => {
    if (validFields.nbheures && validFields.tauxhoraire) {
      const heures = parseFloat(form.nbheures)
      const taux = parseFloat(form.tauxhoraire)
      if (!isNaN(heures) && !isNaN(taux) && heures > 0 && taux > 0) {
        const salaire = heures * taux
        return {
          raw: salaire,
          formate: salaire.toLocaleString('fr-MG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
          heures,
          taux
        }
      }
    }
    return null
  })()

  /* ── Charger en mode édition ── */
  useEffect(() => {
    if (mode !== 'edit') return
    ;(async () => {
      try {
        const { data } = await enseignantAPI.getById(id)
        const e = data.data
        setForm({ nom: e.nom, nbheures: String(e.nbheures), tauxhoraire: String(e.tauxhoraire) })
        setDirty({ nom: true, nbheures: true, tauxhoraire: true })
      } catch {
        show('Enseignant introuvable.', 'error')
        navigate('/enseignants')
      } finally {
        setFetching(false)
      }
    })()
  }, [id, mode])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'nbheures') {
      // Autorise chiffres et un seul point décimal, minimum 1 dans la validation
      if (value !== '' && !/^\d*\.?\d{0,1}$/.test(value)) return
    }
    if (name === 'tauxhoraire') {
      // Autorise uniquement les chiffres entiers
      if (value !== '' && !/^\d+$/.test(value)) return
    }

    setForm((f) => ({ ...f, [name]: value }))
    if (!dirty[name]) setDirty((d) => ({ ...d, [name]: true }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setDirty((d) => ({ ...d, [name]: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setDirty({ nom: true, nbheures: true, tauxhoraire: true })

    const finalErrors = {
      nom: validateField('nom', form.nom),
      nbheures: validateField('nbheures', form.nbheures),
      tauxhoraire: validateField('tauxhoraire', form.tauxhoraire)
    }

    const activeErrors = Object.fromEntries(Object.entries(finalErrors).filter(([_, v]) => v !== null))

    if (Object.keys(activeErrors).length > 0) {
      setErrors(activeErrors)
      show('Veuillez corriger les erreurs avant de continuer.', 'error')
      return
    }

    setLoading(true)
    const payload = {
      nom: form.nom.trim(),
      nbheures: parseFloat(form.nbheures),
      tauxhoraire: parseFloat(form.tauxhoraire)
    }

    try {
      if (mode === 'create') {
        await enseignantAPI.create(payload)
        setSubmitSuccess('create')
        setTimeout(() => navigate('/enseignants'), 2000)
      } else {
        await enseignantAPI.update(id, payload)
        setSubmitSuccess('edit')
        setTimeout(() => navigate('/enseignants'), 2000)
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        const formattedErrors = {}
        Object.entries(apiErrors).forEach(([key, messages]) => {
          formattedErrors[key] = Array.isArray(messages) ? messages[0] : messages
        })
        setErrors(formattedErrors)
        show('Erreurs de validation détectées', 'error')
      } else {
        show(err.response?.data?.message || 'Une erreur est survenue', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  /* ── Style input adaptatif ── */
  const getInputStyle = (fieldName) => {
    const isDirty = dirty[fieldName]
    const error = errors[fieldName]
    const base = 'w-full h-11 px-4 rounded-xl text-sm transition-all duration-200 focus:outline-none'

    if (!isDirty) return `${base} input-dark`
    if (error) return `${base} bg-rose-500/5 border-2 border-rose-500/50 text-[var(--text-primary)] focus:ring-2 focus:ring-rose-500/20 placeholder:text-rose-300/30`
    return `${base} bg-emerald-500/5 border-2 border-emerald-500/40 text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500/20`
  }

  const isEdit = mode === 'edit'
  const nbFilled = [form.nom, form.nbheures, form.tauxhoraire].filter(v => String(v).trim()).length

  /* ── Label indicateur de progression ── */
  const progressionLabel = `${nbValid} champ${nbValid !== 1 ? 's' : ''} valide${nbValid !== 1 ? 's' : ''} sur ${totalFields}`

  return (
    <div style={{ padding: '28px 32px', maxWidth: '800px', margin: '0 auto' }}>
      <ToastContainer />

      <div className="space-y-6">

        {/* ═══ Header ═══ */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/enseignants')}
            className="btn-ghost"
            style={{ width: '40px', height: '40px', padding: 0 }}
            title="Retour à la liste"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center">
                <GraduationCap size={17} className="text-cyan" />
              </div>
              <div>
                <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
                  {isEdit ? "Modifier l'enseignant" : 'Nouvel enseignant'}
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {isEdit
                    ? "Mettez à jour les informations de l'enseignant."
                    : 'Complétez le formulaire pour ajouter un nouvel enseignant.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Loading skeleton ═══ */}
        {fetching ? (
          <div className="card space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton" style={{ height: '16px', width: '120px' }} />
                <div className="skeleton" style={{ height: '44px', width: '100%' }} />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ═══ Carte formulaire ═══ */}
            <div className="card space-y-7">

              {/* ═══ Progression basée sur les champs valides ═══ */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Progression
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {progressionLabel}
                    </span>
                    <span
                      className="text-sm font-mono font-bold"
                      style={{ color: progressionPercent === 100 ? '#059669' : '#06b6d4' }}
                    >
                      {progressionPercent}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-bg)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${progressionPercent}%`,
                      background:
                        progressionPercent === 100
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : progressionPercent >= 50
                            ? 'linear-gradient(90deg, #06b6d4, #22d3ee)'
                            : progressionPercent >= 1
                              ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                              : 'transparent',
                    }}
                  />
                </div>
              </div>

              {/* Nom */}
              <SmartField
                label="Nom complet de l'enseignant"
                icon={User}
                error={errors.nom}
                isValid={validFields.nom}
                isDirty={dirty.nom}
                hint="Saisissez le prénom et le nom (ex : Rakoto Jean)"
              >
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Exemple : Rakoto Jean"
                  autoComplete="off"
                  className={getInputStyle('nom')}
                />
              </SmartField>

              {/* Heures + Taux */}
              <div className="grid grid-cols-2 gap-6">
                <SmartField
                  label="Nombre d'heures"
                  icon={Clock}
                  error={errors.nbheures}
                  isValid={validFields.nbheures}
                  isDirty={dirty.nbheures}
                  hint="Nombre total d'heures travaillées"
                >
                  <div className="relative">
                    <input
                      type="number"
                      name="nbheures"
                      value={form.nbheures}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="120"
                      min="0.001"
                      step="0.5"
                      inputMode="decimal"
                      className={getInputStyle('nbheures') + ' pr-16'}
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{ background: 'var(--surface-bg)', color: 'var(--text-muted)' }}
                    >
                      heures
                    </div>
                  </div>
                </SmartField>

                <SmartField
                  label="Taux horaire"
                  icon={Coins}
                  error={errors.tauxhoraire}
                  isValid={validFields.tauxhoraire}
                  isDirty={dirty.tauxhoraire}
                  hint="Rémunération par heure en Ariary"
                >
                  <div className="relative">
                    <input
                      type="number"
                      name="tauxhoraire"
                      value={form.tauxhoraire}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="2500"
                      min="0.001"
                      step="100"
                      inputMode="numeric"
                      className={getInputStyle('tauxhoraire') + ' pr-14'}
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{ background: 'var(--surface-bg)', color: 'var(--text-muted)' }}
                    >
                      Ar
                    </div>
                  </div>
                </SmartField>
              </div>

              {/* Calculateur de salaire */}
              {salaireInfo ? (
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: 'rgba(6, 182, 212, 0.05)',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-xl shrink-0"
                      style={{
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.2)'
                      }}
                    >
                      <Calculator size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Salaire mensuel estimé
                      </p>
                      <p className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                        {salaireInfo.formate}
                        <span className="text-lg font-normal ml-2 text-cyan-400">Ar</span>
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className="px-2 py-1 rounded-lg font-mono text-cyan-400"
                          style={{ background: 'var(--surface-bg)' }}
                        >
                          {salaireInfo.heures} h
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>×</span>
                        <span
                          className="px-2 py-1 rounded-lg font-mono text-cyan-400"
                          style={{ background: 'var(--surface-bg)' }}
                        >
                          {salaireInfo.taux.toLocaleString('fr')} Ar
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: 'var(--surface-bg)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Calculator size={18} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Le salaire estimé s'affichera automatiquement une fois les heures et le taux horaire renseignés et valides.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ═══ Actions ═══ */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !formValid}
                className={`btn-primary flex-1 transition-opacity duration-200 ${(!formValid || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!formValid ? 'Veuillez corriger les erreurs avant de soumettre' : undefined}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEdit ? 'Mettre à jour' : "Ajouter l'enseignant"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/enseignants')}
                className="btn-secondary"
              >
                Annuler
              </button>

              {mode === 'create' && nbFilled > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({ nom: '', nbheures: '', tauxhoraire: '' })
                    setErrors({})
                    setDirty({})
                  }}
                  className="btn-ghost"
                  style={{ width: '44px', padding: 0 }}
                  title="Réinitialiser le formulaire"
                >
                  <RotateCcw size={18} />
                </button>
              )}
            </div>

            {/* ═══ Messages de statut ═══ */}
            {submitSuccess ? (
              <div
                className="flex items-start gap-3 px-5 py-4 rounded-xl"
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.35)'
                }}
              >
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: '#059669' }}>
                    {submitSuccess === 'create' ? 'Enseignant ajouté avec succès !' : 'Enseignant mis à jour avec succès !'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#059669', opacity: 0.8 }}>
                    Redirection vers la liste en cours…
                  </p>
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                        animation: 'progressBar 2s linear forwards'
                      }}
                    />
                  </div>
                  <style>{`@keyframes progressBar { from { width: 0% } to { width: 100% } }`}</style>
                </div>
              </div>
            ) : formValid ? (
              <div
                className="flex items-start gap-3 px-5 py-3.5 rounded-xl"
                style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#059669' }}>Formulaire valide</p>
                  <p className="text-xs mt-0.5" style={{ color: '#059669', opacity: 0.8 }}>
                    Tous les champs sont correctement renseignés. Vous pouvez procéder à l'enregistrement.
                  </p>
                </div>
              </div>
            ) : Object.keys(errors).length > 0 && (
              <div
                className="flex items-start gap-3 px-5 py-3.5 rounded-xl"
                style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#e11d48' }}>
                    {Object.keys(errors).length} champ{Object.keys(errors).length > 1 ? 's' : ''} à corriger
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#e11d48', opacity: 0.8 }}>
                    Veuillez vérifier les champs indiqués avant de continuer.
                  </p>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
