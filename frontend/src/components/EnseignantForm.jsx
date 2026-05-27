/**
 * EnseignantForm — formulaire partagé Ajouter / Modifier
 * Design moderne, validation temps réel, messages professionnels
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
function SmartField({ label, icon: Icon, error, hint, value, isValid, isDirty, children }) {
  const showSuccess = isDirty && isValid && !error
  const showError = isDirty && error

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          {Icon && (
            <div className={`p-1.5 rounded-lg transition-all duration-200 ${
              showError 
                ? 'bg-rose-500/10' 
                : showSuccess 
                  ? 'bg-emerald-500/10' 
                  : 'bg-slate-700/50'
            }`}>
              <Icon size={14} className={
                showError ? 'text-rose-400' : showSuccess ? 'text-emerald-400' : 'text-slate-400'
              } />
            </div>
          )}
          {label}
        </label>
        <div className="flex items-center gap-2">
          {showSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <BadgeCheck size={11} />
              Valide
            </span>
          )}
          {showError && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full">
              <XCircle size={11} />
              Invalide
            </span>
          )}
        </div>
      </div>
      {children}
      {hint && !isDirty && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500 ml-1">
          <Sparkles size={11} className="text-cyan-500/50" />
          {hint}
        </p>
      )}
      {showError && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
          <AlertCircle size={13} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-rose-300 mb-0.5">Champ invalide</p>
            <p className="text-xs text-rose-400/90">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Styles inputs améliorés ── */
const inputBase = 
  'w-full h-12 px-4 rounded-xl text-sm transition-all duration-200 placeholder:text-slate-600 ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0a0f1a]'
const inputNormal = inputBase + ' bg-slate-800/50 border border-slate-700/50 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20'
const inputError  = inputBase + ' bg-rose-500/5 border-2 border-rose-500/50 text-white focus:ring-rose-500/20 placeholder:text-rose-300/30'
const inputOk     = inputBase + ' bg-emerald-500/5 border-2 border-emerald-500/40 text-white focus:ring-emerald-500/20'

function getInputClass(isDirty, error) {
  if (!isDirty) return inputNormal
  if (error) return inputError
  return inputOk
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

  /* Validation en temps réel de TOUS les champs */
  useEffect(() => {
    const newErrors = {}
    let allValid = true
    
    // Validation du nom
    if (dirty.nom || form.nom) {
      const nomError = validateField('nom', form.nom)
      if (nomError) {
        newErrors.nom = nomError
        allValid = false
      }
    } else {
      allValid = false
    }
    
    // Validation des heures
    if (dirty.nbheures || form.nbheures) {
      const heuresError = validateField('nbheures', form.nbheures)
      if (heuresError) {
        newErrors.nbheures = heuresError
        allValid = false
      }
    } else {
      allValid = false
    }
    
    // Validation du taux horaire
    if (dirty.tauxhoraire || form.tauxhoraire) {
      const tauxError = validateField('tauxhoraire', form.tauxhoraire)
      if (tauxError) {
        newErrors.tauxhoraire = tauxError
        allValid = false
      }
    } else {
      allValid = false
    }
    
    setErrors(newErrors)
    setFormValid(allValid && Object.keys(newErrors).length === 0)
  }, [form, dirty])

  /* Salaire calculé en temps réel avec validation */
  const salaireInfo = (() => {
    if (!form.nbheures || !form.tauxhoraire) return null
    
    const heures = parseFloat(form.nbheures)
    const taux = parseFloat(form.tauxhoraire)
    
    if (isNaN(heures) || isNaN(taux)) return null
    if (heures < 0 || taux < 0) return null
    
    const salaire = heures * taux
    return {
      raw: salaire,
      formate: salaire.toLocaleString('fr-MG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      heures: heures,
      taux: taux
    }
  })()

  /* Charger les données en mode édition */
  useEffect(() => {
    if (mode !== 'edit') return
    ;(async () => {
      try {
        const { data } = await enseignantAPI.getById(id)
        const e = data.data
        setForm({ nom: e.nom, nbheures: String(e.nbheures), tauxhoraire: String(e.tauxhoraire) })
        setDirty({ nom: true, nbheures: true, tauxhoraire: true })
      } catch {
        show('Enseignant introuvable. Redirection vers la liste.', 'error')
        navigate('/enseignants')
      } finally {
        setFetching(false)
      }
    })()
  }, [id, mode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (!dirty[name]) {
      setDirty((d) => ({ ...d, [name]: true }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setDirty((d) => ({ ...d, [name]: true }))
  }

  const validateField = (name, value) => {
    const trimmedValue = typeof value === 'string' ? value.trim() : ''
    
    if (name === 'nom') {
      if (!trimmedValue) {
        return 'Le nom complet est obligatoire.'
      }
      if (trimmedValue.length < 3) {
        return 'Le nom doit comporter au minimum 3 caractères.'
      }
      if (trimmedValue.length > 100) {
        return 'Le nom ne peut excéder 100 caractères.'
      }
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedValue)) {
        return 'Le nom contient des caractères non autorisés.'
      }
      return null
    }
    
    if (name === 'nbheures') {
      if (value === '' || value === undefined || value === null) {
        return 'Le nombre d\'heures est obligatoire.'
      }
      
      const numValue = parseFloat(value)
      
      if (isNaN(numValue)) {
        return 'Veuillez saisir une valeur numérique valide.'
      }
      if (numValue < 0) {
        return 'Le nombre d\'heures ne peut pas être négatif.'
      }
      if (numValue === 0) {
        return 'Le nombre d\'heures doit être supérieur à zéro.'
      }
      if (numValue > 9999) {
        return 'Le nombre d\'heures ne peut dépasser 9 999 heures.'
      }
      if (!/^\d*\.?\d{0,1}$/.test(value)) {
        return 'Veuillez saisir un nombre avec au maximum une décimale.'
      }
      return null
    }
    
    if (name === 'tauxhoraire') {
      if (value === '' || value === undefined || value === null) {
        return 'Le taux horaire est obligatoire.'
      }
      
      const numValue = parseFloat(value)
      
      if (isNaN(numValue)) {
        return 'Veuillez saisir un montant valide.'
      }
      if (numValue < 0) {
        return 'Le taux horaire ne peut pas être négatif.'
      }
      if (numValue === 0) {
        return 'Le taux horaire doit être supérieur à zéro.'
      }
      if (numValue > 9999999) {
        return 'Le taux horaire ne peut dépasser 9 999 999 Ar.'
      }
      if (!/^\d+$/.test(value)) {
        return 'Veuillez saisir un nombre entier sans décimale.'
      }
      return null
    }
    
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Marquer tous les champs comme modifiés
    setDirty({ nom: true, nbheures: true, tauxhoraire: true })
    
    // Validation finale
    const finalErrors = {
      nom: validateField('nom', form.nom),
      nbheures: validateField('nbheures', form.nbheures),
      tauxhoraire: validateField('tauxhoraire', form.tauxhoraire)
    }
    
    // Filtrer les erreurs null
    const activeErrors = Object.fromEntries(
      Object.entries(finalErrors).filter(([_, v]) => v !== null)
    )
    
    if (Object.keys(activeErrors).length > 0) {
      setErrors(activeErrors)
      show('Veuillez corriger les erreurs avant de continuer.', 'error')
      return
    }

    setLoading(true)
    const payload = {
      nom: form.nom.trim(),
      nbheures: parseFloat(form.nbheures),
      tauxhoraire: parseFloat(form.tauxhoraire),
    }

    try {
      if (mode === 'create') {
        await enseignantAPI.create(payload)
        show('Enseignant ajouté avec succès', 'success')
        setForm({ nom: '', nbheures: '', tauxhoraire: '' })
        setDirty({})
        setErrors({})
      } else {
        await enseignantAPI.update(id, payload)
        show('Enseignant mis à jour avec succès', 'success')
      }
      // Redirection immédiate
      navigate('/enseignants')
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
        const msg = err.response?.data?.message || 'Une erreur est survenue'
        show(msg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const isEdit = mode === 'edit'
  const nbFilled = [form.nom, form.nbheures, form.tauxhoraire].filter(v => String(v).trim()).length
  const progressionPercent = Math.round((nbFilled / 3) * 100)

  return (
    <div className="min-h-screen px-6 py-8">
      <ToastContainer />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/enseignants')}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            title="Retour à la liste"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <GraduationCap size={20} className="text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">
                {isEdit ? 'Modification de l\'enseignant' : 'Nouvel enseignant'}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isEdit 
                ? 'Mettez à jour les informations de l\'enseignant.' 
                : 'Complétez le formulaire pour ajouter un nouvel enseignant.'}
            </p>
          </div>
        </div>

        {/* ── Loading state ── */}
        {fetching ? (
          <div className="rounded-2xl border border-slate-700/30 bg-slate-800/20 p-8 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-24 rounded-lg animate-pulse bg-slate-700/50" />
                <div className="h-12 rounded-xl animate-pulse bg-slate-700/30" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* ── Carte formulaire ── */}
            <div className="rounded-2xl border border-slate-700/30 bg-slate-800/20 backdrop-blur-sm p-8 space-y-7">
              {/* ── Progression ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">Progression du formulaire</span>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    {progressionPercent}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${progressionPercent}%`,
                      background: progressionPercent === 100
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : progressionPercent >= 50
                          ? 'linear-gradient(90deg, #06b6d4, #22d3ee)'
                          : 'linear-gradient(90deg, #6366f1, #818cf8)',
                    }}
                  />
                </div>
              </div>

              {/* ── Nom ── */}
              <SmartField
                label="Nom complet de l'enseignant"
                icon={User}
                error={errors.nom}
                value={form.nom}
                isValid={!errors.nom && form.nom.trim().length >= 3}
                isDirty={dirty.nom}
                hint="Veuillez saisir le prénom et le nom (ex : Rakoto Jean)"
              >
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Exemple : Rakoto Jean"
                  autoComplete="off"
                  className={getInputClass(dirty.nom, errors.nom)}
                />
              </SmartField>

              {/* ── Heures + Taux ── */}
              <div className="grid grid-cols-2 gap-6">
                <SmartField
                  label="Nombre d'heures"
                  icon={Clock}
                  error={errors.nbheures}
                  value={form.nbheures}
                  isValid={!errors.nbheures && form.nbheures && parseFloat(form.nbheures) > 0}
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
                      min="0"
                      step="0.5"
                      className={getInputClass(dirty.nbheures, errors.nbheures) + ' pr-14'}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-slate-700/50 text-xs font-medium text-slate-400">
                      heures
                    </div>
                  </div>
                </SmartField>

                <SmartField
                  label="Taux horaire"
                  icon={Coins}
                  error={errors.tauxhoraire}
                  value={form.tauxhoraire}
                  isValid={!errors.tauxhoraire && form.tauxhoraire && parseFloat(form.tauxhoraire) > 0}
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
                      min="0"
                      step="100"
                      className={getInputClass(dirty.tauxhoraire, errors.tauxhoraire) + ' pr-16'}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-slate-700/50 text-xs font-medium text-slate-400">
                      Ar
                    </div>
                  </div>
                </SmartField>
              </div>

              {/* ── Calculateur de salaire ── */}
              {salaireInfo ? (
                <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 shrink-0">
                      <Calculator size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-400 mb-1">Salaire mensuel estimé</p>
                      <p className="text-3xl font-bold text-white tracking-tight mb-2">
                        {salaireInfo.formate}
                        <span className="text-lg font-normal text-cyan-400 ml-2">Ar</span>
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="px-2 py-1 rounded-lg bg-slate-800/50 text-cyan-400 font-mono">
                          {salaireInfo.heures} h
                        </span>
                        <span>×</span>
                        <span className="px-2 py-1 rounded-lg bg-slate-800/50 text-cyan-400 font-mono">
                          {salaireInfo.taux.toLocaleString('fr')} Ar
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
                  <div className="flex items-center gap-3">
                    <Calculator size={18} className="text-slate-500" />
                    <p className="text-sm text-slate-500">
                      Le salaire estimé s'affichera automatiquement une fois les heures et le taux horaire renseignés.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 h-12 px-6 rounded-xl font-semibold text-sm text-white
                  transition-all duration-200 active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                  ${formValid 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25' 
                    : 'bg-gradient-to-r from-slate-600 to-slate-700'
                  }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {isEdit ? 'Mettre à jour' : 'Ajouter l\'enseignant'}
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/enseignants')}
                className="h-12 px-6 rounded-xl font-medium text-sm text-slate-400
                  bg-slate-800/50 border border-slate-700/50
                  hover:text-white hover:border-slate-600 transition-all"
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
                  className="h-12 px-4 rounded-xl text-slate-500 hover:text-rose-400
                    border border-slate-700/30 hover:border-rose-500/30 transition-all"
                  title="Réinitialiser le formulaire"
                >
                  <RotateCcw size={18} />
                </button>
              )}
            </div>

            {/* ── Messages de statut ── */}
            {formValid && (
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 animate-fade-in">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Formulaire valide</p>
                  <p className="text-xs text-emerald-400/80 mt-0.5">
                    Tous les champs sont correctement renseignés. Vous pouvez procéder à l'enregistrement.
                  </p>
                </div>
              </div>
            )}

            {Object.keys(errors).length > 0 && (
              <div className="flex items-start gap-3 px-5 py-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 animate-fade-in">
                <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-rose-300">
                    {Object.keys(errors).length} champ{Object.keys(errors).length > 1 ? 's' : ''} à corriger
                  </p>
                  <p className="text-xs text-rose-400/80 mt-1">
                    Veuillez vérifier les champs indiqués en rouge avant de continuer.
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
