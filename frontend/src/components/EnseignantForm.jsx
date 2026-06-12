/**
 * EnseignantForm — formulaire partagé Ajouter / Modifier
 * Thème : fond clair moderne, texte sombre lisible, 0 accepté pour salaire
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

/* ═══ Tokens de couleur — thème clair ═══ */
const C = {
  pageBg:       '#f1f5f9',       // fond de page gris très clair
  cardBg:       '#ffffff',       // cartes blanches
  surfaceBg:    '#f8fafc',       // surface secondaire
  border:       '#e2e8f0',       // bordure légère
  textPrimary:  '#0f172a',       // quasi-noir
  textSecondary:'#1e293b',       // gris très foncé
  textMuted:    '#64748b',       // gris doux pour hints
  cyan:         '#0891b2',       // accent principal
  cyanLight:    'rgba(8,145,178,0.08)',
  cyanBorder:   'rgba(8,145,178,0.25)',
  emerald:      '#059669',
  emeraldLight: 'rgba(5,150,105,0.07)',
  emeraldBorder:'rgba(5,150,105,0.25)',
  rose:         '#e11d48',
  roseLight:    'rgba(225,29,72,0.06)',
  roseBorder:   'rgba(225,29,72,0.25)',
  shadow:       '0 1px 3px rgba(15,23,42,0.08), 0 4px 16px rgba(15,23,42,0.04)',
  shadowCard:   '0 2px 8px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.08)',
}

/* ── Styles globaux injectés une seule fois ── */
const GLOBAL_STYLE = `
  .ef-page { background: ${C.pageBg}; min-height: 100vh; }
  .ef-card {
    background: ${C.cardBg};
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 28px;
    box-shadow: ${C.shadowCard};
  }
  .ef-input {
    width: 100%; height: 44px; padding: 0 16px;
    border-radius: 10px; font-size: 14px;
    color: ${C.textPrimary}; background: ${C.surfaceBg};
    border: 1.5px solid ${C.border};
    transition: border-color .15s, box-shadow .15s;
    outline: none;
  }
  .ef-input::placeholder { color: #94a3b8; }
  .ef-input:focus { border-color: ${C.cyan}; box-shadow: 0 0 0 3px rgba(8,145,178,0.12); }
  .ef-input-valid {
    background: ${C.emeraldLight}; border-color: ${C.emeraldBorder};
  }
  .ef-input-valid:focus { box-shadow: 0 0 0 3px rgba(5,150,105,0.12); }
  .ef-input-error {
    background: ${C.roseLight}; border-color: ${C.roseBorder};
  }
  .ef-input-error:focus { box-shadow: 0 0 0 3px rgba(225,29,72,0.10); }
  .ef-label {
    font-size: 13px; font-weight: 600; color: ${C.textSecondary};
    display: flex; align-items: center; gap: 7px;
  }
  .ef-hint {
    font-size: 12px; color: ${C.textMuted};
    display: flex; align-items: center; gap: 5px; margin-top: 4px;
  }
  .ef-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600;
  }
  .ef-badge-ok  { background: ${C.emeraldLight}; color: ${C.emerald}; border: 1px solid ${C.emeraldBorder}; }
  .ef-badge-err { background: ${C.roseLight};    color: ${C.rose};    border: 1px solid ${C.roseBorder}; }
  .ef-icon-wrap {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: ${C.surfaceBg}; border: 1px solid ${C.border};
    flex-shrink: 0;
  }
  .ef-icon-wrap.ok  { background: ${C.emeraldLight}; border-color: ${C.emeraldBorder}; }
  .ef-icon-wrap.err { background: ${C.roseLight};    border-color: ${C.roseBorder}; }
  .ef-unit {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;
    background: ${C.border}; color: ${C.textMuted}; pointer-events: none;
  }
  .ef-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 0 24px; height: 44px; border-radius: 10px;
    background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
    color: #fff; font-size: 14px; font-weight: 600; border: none; cursor: pointer;
    transition: opacity .2s, box-shadow .2s;
    box-shadow: 0 2px 8px rgba(8,145,178,0.30);
  }
  .ef-btn-primary:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(8,145,178,0.40); }
  .ef-btn-primary:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
  .ef-btn-secondary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 0 20px; height: 44px; border-radius: 10px;
    background: ${C.surfaceBg}; color: ${C.textSecondary};
    font-size: 14px; font-weight: 500;
    border: 1.5px solid ${C.border}; cursor: pointer;
    transition: background .15s, border-color .15s;
  }
  .ef-btn-secondary:hover { background: ${C.border}; }
  .ef-btn-ghost {
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; border-radius: 10px;
    background: transparent; border: 1.5px solid ${C.border};
    color: ${C.textMuted}; cursor: pointer; transition: background .15s;
  }
  .ef-btn-ghost:hover { background: ${C.border}; color: ${C.textSecondary}; }
  .ef-skeleton {
    border-radius: 8px; background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes progressBar { from{width:0%} to{width:100%} }
`

/* ── SmartField ── */
function SmartField({ label, icon: Icon, error, hint, isValid, isDirty, children }) {
  const showSuccess = isDirty && isValid && !error
  const showError   = isDirty && !!error
  const iconState   = showError ? 'err' : showSuccess ? 'ok' : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label className="ef-label">
          {Icon && (
            <span className={`ef-icon-wrap ${iconState}`}>
              <Icon size={14} color={showError ? C.rose : showSuccess ? C.emerald : C.textMuted} />
            </span>
          )}
          {label}
        </label>
        {showSuccess && (
          <span className="ef-badge ef-badge-ok"><BadgeCheck size={11} />Valide</span>
        )}
        {showError && (
          <span className="ef-badge ef-badge-err"><XCircle size={11} />Invalide</span>
        )}
      </div>

      {children}

      {hint && !isDirty && (
        <p className="ef-hint">
          <Sparkles size={11} color="#06b6d4" />
          {hint}
        </p>
      )}

      {showError && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '10px 14px', borderRadius: '10px',
          background: C.roseLight, border: `1px solid ${C.roseBorder}`
        }}>
          <AlertCircle size={13} color={C.rose} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.rose, margin: 0 }}>Champ invalide</p>
            <p style={{ fontSize: 12, color: C.rose, opacity: .85, margin: '2px 0 0' }}>{error}</p>
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

  const [form, setForm]               = useState({ nom: '', nbheures: '', tauxhoraire: '' })
  const [errors, setErrors]           = useState({})
  const [dirty, setDirty]             = useState({})
  const [loading, setLoading]         = useState(false)
  const [fetching, setFetching]       = useState(mode === 'edit')
  const [formValid, setFormValid]     = useState(false)

  /* ── Validation — 0 accepté pour heures et taux ── */
  const validateField = (name, value) => {
    const trimmed = typeof value === 'string' ? value.trim() : ''

    if (name === 'nom') {
      if (!trimmed) return 'Le nom complet est obligatoire.'
      if (trimmed.length < 3) return 'Le nom doit comporter au minimum 3 caractères.'
      if (trimmed.length > 100) return 'Le nom ne peut excéder 100 caractères.'
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed)) return 'Le nom contient des caractères non autorisés.'
      return null
    }

    if (name === 'nbheures') {
      if (value === '' || value === undefined || value === null) return "Le nombre d'heures est obligatoire."
      if (/[a-zA-Z]/.test(String(value))) return 'Veuillez saisir uniquement des chiffres.'
      const n = parseFloat(value)
      if (isNaN(n)) return 'Valeur numérique invalide.'
      if (n < 0) return "Le nombre d'heures ne peut pas être négatif."
      if (n > 9999) return "Le nombre d'heures ne peut dépasser 9 999 heures."
      return null
    }

    if (name === 'tauxhoraire') {
      if (value === '' || value === undefined || value === null) return 'Le taux horaire est obligatoire.'
      if (/[a-zA-Z]/.test(String(value))) return 'Veuillez saisir uniquement des chiffres.'
      const n = parseFloat(value)
      if (isNaN(n)) return 'Montant invalide.'
      if (n < 0) return 'Le taux horaire ne peut pas être négatif.'
      if (n > 9999999) return 'Le taux horaire ne peut dépasser 9 999 999 Ar.'
      return null
    }

    return null
  }

  /* ── Validation temps réel ── */
  useEffect(() => {
    const newErrors = {}
    let allValid = true
    ;['nom', 'nbheures', 'tauxhoraire'].forEach(f => {
      const err = validateField(f, form[f])
      if (err) { newErrors[f] = err; allValid = false }
    })
    setErrors(newErrors)
    setFormValid(allValid)
  }, [form])

  const validFields = {
    nom:        !validateField('nom', form.nom),
    nbheures:   !validateField('nbheures', form.nbheures),
    tauxhoraire:!validateField('tauxhoraire', form.tauxhoraire),
  }
  const nbValid = Object.values(validFields).filter(Boolean).length
  const totalFields = 3
  const pct = Math.round((nbValid / totalFields) * 100)

  /* ── Salaire — 0 affiché si heures=0 ou taux=0 ── */
  const salaireInfo = (() => {
    if (validFields.nbheures && validFields.tauxhoraire &&
        form.nbheures !== '' && form.tauxhoraire !== '') {
      const h = parseFloat(form.nbheures)
      const t = parseFloat(form.tauxhoraire)
      if (!isNaN(h) && !isNaN(t) && h >= 0 && t >= 0) {
        const s = h * t
        return {
          raw: s,
          formate: s.toLocaleString('fr-MG', { minimumFractionDigits: 0 }),
          heures: h,
          taux: t
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
      if (value !== '' && !/^\d*\.?\d{0,1}$/.test(value)) return
    }
    if (name === 'tauxhoraire') {
      if (value !== '' && !/^\d+$/.test(value)) return
    }
    setForm(f => ({ ...f, [name]: value }))
    if (!dirty[name]) setDirty(d => ({ ...d, [name]: true }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setDirty(d => ({ ...d, [name]: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setDirty({ nom: true, nbheures: true, tauxhoraire: true })
    const finalErrors = Object.fromEntries(
      ['nom', 'nbheures', 'tauxhoraire']
        .map(f => [f, validateField(f, form[f])])
        .filter(([, v]) => v !== null)
    )
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors)
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
        navigate('/enseignants', { state: { createdNom: payload.nom } })
      } else {
        await enseignantAPI.update(id, payload)
        navigate('/enseignants', { state: { updatedNom: payload.nom } })
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        const fe = {}
        Object.entries(apiErrors).forEach(([k, v]) => { fe[k] = Array.isArray(v) ? v[0] : v })
        setErrors(fe)
        show('Erreurs de validation détectées', 'error')
      } else {
        show(err.response?.data?.message || 'Une erreur est survenue', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const getInputClass = (field) => {
    if (!dirty[field]) return 'ef-input'
    if (errors[field]) return 'ef-input ef-input-error'
    return 'ef-input ef-input-valid'
  }

  const isEdit = mode === 'edit'
  const nbFilled = [form.nom, form.nbheures, form.tauxhoraire].filter(v => String(v).trim()).length

  const progressColor = pct === 100
    ? 'linear-gradient(90deg,#059669,#34d399)'
    : pct >= 50
      ? 'linear-gradient(90deg,#0891b2,#22d3ee)'
      : 'linear-gradient(90deg,#6366f1,#818cf8)'

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div className="ef-page" style={{ padding: '32px' }}>
        <ToastContainer />
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ═══ Header ═══ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="ef-btn-ghost" onClick={() => navigate('/enseignants')} title="Retour">
              <ArrowLeft size={18} />
            </button>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: C.cyanLight, border: `1px solid ${C.cyanBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <GraduationCap size={18} color={C.cyan} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary, lineHeight: 1.2 }}>
                {isEdit ? "Modifier l'enseignant" : 'Nouvel enseignant'}
              </h1>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textMuted }}>
                {isEdit
                  ? "Mettez à jour les informations de l'enseignant."
                  : 'Complétez le formulaire pour ajouter un nouvel enseignant.'}
              </p>
            </div>
          </div>

          {/* ═══ Loading skeleton ═══ */}
          {fetching ? (
            <div className="ef-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="ef-skeleton" style={{ height: 14, width: 120 }} />
                  <div className="ef-skeleton" style={{ height: 44 }} />
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ═══ Carte formulaire ═══ */}
              <div className="ef-card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Barre de progression */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: C.textMuted }}>
                      Progression
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: C.textMuted }}>
                        {nbValid} champ{nbValid !== 1 ? 's' : ''} valide{nbValid !== 1 ? 's' : ''} sur {totalFields}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: pct === 100 ? C.emerald : C.cyan }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 7, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${pct}%`,
                      background: pct > 0 ? progressColor : 'transparent',
                      transition: 'width .6s ease-out'
                    }} />
                  </div>
                </div>

                {/* Séparateur */}
                <div style={{ height: 1, background: C.border }} />

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
                    className={getInputClass('nom')}
                  />
                </SmartField>

                {/* Heures + Taux */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <SmartField
                    label="Nombre d'heures"
                    icon={Clock}
                    error={errors.nbheures}
                    isValid={validFields.nbheures}
                    isDirty={dirty.nbheures}
                    hint="Nombre total d'heures (0 autorisé)"
                  >
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        name="nbheures"
                        value={form.nbheures}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="0"
                        min="0"
                        step="0.5"
                        inputMode="decimal"
                        className={getInputClass('nbheures')}
                        style={{ paddingRight: 60 }}
                      />
                      <span className="ef-unit">h</span>
                    </div>
                  </SmartField>

                  <SmartField
                    label="Taux horaire"
                    icon={Coins}
                    error={errors.tauxhoraire}
                    isValid={validFields.tauxhoraire}
                    isDirty={dirty.tauxhoraire}
                    hint="Rémunération par heure en Ariary (0 autorisé)"
                  >
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        name="tauxhoraire"
                        value={form.tauxhoraire}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="0"
                        min="0"
                        step="100"
                        inputMode="numeric"
                        className={getInputClass('tauxhoraire')}
                        style={{ paddingRight: 42 }}
                      />
                      <span className="ef-unit">Ar</span>
                    </div>
                  </SmartField>
                </div>

                {/* Calculateur de salaire */}
                {salaireInfo !== null ? (
                  <div style={{
                    borderRadius: 12, padding: '18px 20px',
                    background: C.cyanLight, border: `1px solid ${C.cyanBorder}`,
                    display: 'flex', alignItems: 'flex-start', gap: 16
                  }}>
                    <div style={{
                      padding: 12, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(8,145,178,0.12)', border: `1px solid ${C.cyanBorder}`
                    }}>
                      <Calculator size={20} color={C.cyan} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: C.textSecondary }}>
                        Salaire mensuel estimé
                      </p>
                      <p style={{ margin: '0 0 10px', fontSize: 30, fontWeight: 800, color: C.textPrimary, letterSpacing: '-.5px' }}>
                        {salaireInfo.formate}
                        <span style={{ fontSize: 16, fontWeight: 500, color: C.cyan, marginLeft: 8 }}>Ar</span>
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 6,
                          background: C.cardBg, border: `1px solid ${C.border}`,
                          fontFamily: 'monospace', fontWeight: 600, color: C.textPrimary
                        }}>
                          {salaireInfo.heures} h
                        </span>
                        <span style={{ color: C.textMuted, fontWeight: 600 }}>×</span>
                        <span style={{
                          padding: '3px 10px', borderRadius: 6,
                          background: C.cardBg, border: `1px solid ${C.border}`,
                          fontFamily: 'monospace', fontWeight: 600, color: C.textPrimary
                        }}>
                          {salaireInfo.taux.toLocaleString('fr')} Ar
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    borderRadius: 12, padding: '14px 18px',
                    background: C.surfaceBg, border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <Calculator size={16} color={C.textMuted} style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>
                      Le salaire estimé s'affichera automatiquement une fois les heures et le taux horaire renseignés.
                    </p>
                  </div>
                )}
              </div>

              {/* ═══ Actions ═══ */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="submit"
                  disabled={loading || !formValid}
                  className="ef-btn-primary"
                  style={{ flex: 1 }}
                  title={!formValid ? 'Veuillez corriger les erreurs' : undefined}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,.5)',
                        borderTopColor: '#fff',
                        animation: 'spin .7s linear infinite'
                      }} />
                      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      Traitement en cours…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {isEdit ? 'Mettre à jour' : "Ajouter l'enseignant"}
                    </>
                  )}
                </button>

                <button type="button" onClick={() => navigate('/enseignants')} className="ef-btn-secondary">
                  Annuler
                </button>

                {mode === 'create' && nbFilled > 0 && (
                  <button
                    type="button"
                    onClick={() => { setForm({ nom: '', nbheures: '', tauxhoraire: '' }); setErrors({}); setDirty({}) }}
                    className="ef-btn-ghost"
                    title="Réinitialiser"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>

              {/* ═══ Bandeaux de statut ═══ */}
              {formValid ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 10,
                  background: C.emeraldLight, border: `1px solid ${C.emeraldBorder}`
                }}>
                  <CheckCircle2 size={17} color={C.emerald} style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.emerald }}>Formulaire valide</p>
                    <p style={{ margin: '1px 0 0', fontSize: 12, color: C.emerald, opacity: .8 }}>
                      Tous les champs sont corrects. Vous pouvez enregistrer.
                    </p>
                  </div>
                </div>
              ) : Object.keys(errors).length > 0 && Object.keys(dirty).length > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 10,
                  background: C.roseLight, border: `1px solid ${C.roseBorder}`
                }}>
                  <AlertCircle size={17} color={C.rose} style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.rose }}>
                      {Object.keys(errors).length} champ{Object.keys(errors).length > 1 ? 's' : ''} à corriger
                    </p>
                    <p style={{ margin: '1px 0 0', fontSize: 12, color: C.rose, opacity: .8 }}>
                      Veuillez vérifier les champs indiqués avant de continuer.
                    </p>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  )
}
