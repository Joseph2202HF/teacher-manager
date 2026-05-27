/**
 * EnseignantForm — formulaire partagé Ajouter / Modifier
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { enseignantAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { Save, ArrowLeft, User, Clock, Coins, Calculator } from 'lucide-react'

export default function EnseignantForm({ mode = 'create' }) {
  const navigate       = useNavigate()
  const { id }         = useParams()
  const { show, ToastContainer } = useToast()

  const [form, setForm]       = useState({ nom: '', nbheures: '', tauxhoraire: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(mode === 'edit')

  const salaire = form.nbheures && form.tauxhoraire
    ? (parseFloat(form.nbheures) * parseFloat(form.tauxhoraire)).toFixed(2)
    : null

  // Charger les données en mode édition
  useEffect(() => {
    if (mode !== 'edit') return
    ;(async () => {
      try {
        const { data } = await enseignantAPI.getById(id)
        const e = data.data
        setForm({ nom: e.nom, nbheures: String(e.nbheures), tauxhoraire: String(e.tauxhoraire) })
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
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((err) => ({ ...err, [name]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.nom.trim())                              e.nom        = 'Le nom est obligatoire.'
    if (form.nom.trim().length > 100)                  e.nom        = 'Max 100 caractères.'
    if (!form.nbheures)                                e.nbheures   = 'Le nombre d\'heures est obligatoire.'
    else if (isNaN(form.nbheures) || +form.nbheures < 0) e.nbheures = 'Valeur positive requise.'
    if (!form.tauxhoraire)                             e.tauxhoraire = 'Le taux est obligatoire.'
    else if (isNaN(form.tauxhoraire) || +form.tauxhoraire < 0) e.tauxhoraire = 'Valeur positive requise.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const payload = { nom: form.nom.trim(), nbheures: +form.nbheures, tauxhoraire: +form.tauxhoraire }

    try {
      if (mode === 'create') {
        await enseignantAPI.create(payload)
        show('Enseignant ajouté avec succès !')
        setForm({ nom: '', nbheures: '', tauxhoraire: '' })
      } else {
        await enseignantAPI.update(id, payload)
        show('Enseignant modifié avec succès !')
      }
      setTimeout(() => navigate('/enseignants'), 1200)
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        setErrors(apiErrors)
      } else {
        show(err.response?.data?.message ?? 'Une erreur est survenue.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'create' ? 'Ajouter un enseignant' : 'Modifier l\'enseignant'

  return (
    <div className="space-y-6 max-w-2xl">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2.5">
          <ArrowLeft size={16} />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      {fetching ? (
        <div className="card space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-surface rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="card space-y-5">

            {/* Nom */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#8892a4] uppercase tracking-wider mb-2">
                <User size={12} /> Nom complet
              </label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="ex : Rakoto Jean"
                className={`input-dark ${errors.nom ? 'border-rose focus:border-rose' : ''}`}
              />
              {errors.nom && <p className="mt-1.5 text-xs text-rose">{errors.nom}</p>}
            </div>

            {/* Heures + Taux */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#8892a4] uppercase tracking-wider mb-2">
                  <Clock size={12} /> Nombre d'heures
                </label>
                <input
                  type="number"
                  name="nbheures"
                  value={form.nbheures}
                  onChange={handleChange}
                  placeholder="ex : 120"
                  min="0"
                  step="0.5"
                  className={`input-dark ${errors.nbheures ? 'border-rose focus:border-rose' : ''}`}
                />
                {errors.nbheures && <p className="mt-1.5 text-xs text-rose">{errors.nbheures}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#8892a4] uppercase tracking-wider mb-2">
                  <Coins size={12} /> Taux horaire (Ar)
                </label>
                <input
                  type="number"
                  name="tauxhoraire"
                  value={form.tauxhoraire}
                  onChange={handleChange}
                  placeholder="ex : 2500"
                  min="0"
                  step="100"
                  className={`input-dark ${errors.tauxhoraire ? 'border-rose focus:border-rose' : ''}`}
                />
                {errors.tauxhoraire && <p className="mt-1.5 text-xs text-rose">{errors.tauxhoraire}</p>}
              </div>
            </div>

            {/* Aperçu salaire */}
            {salaire !== null && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan/5 border border-cyan/20 animate-fade-in">
                <Calculator size={17} className="text-cyan shrink-0" />
                <div>
                  <p className="text-xs text-[#8892a4]">Salaire calculé</p>
                  <p className="font-display font-bold text-cyan text-lg">
                    {Number(salaire).toLocaleString('fr')} Ar
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <div className="w-4 h-4 rounded-full border-2 border-night border-t-transparent animate-spin" />
                  : <Save size={16} />}
                {mode === 'create' ? 'Ajouter' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => navigate('/enseignants')} className="btn-secondary">
                Annuler
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
