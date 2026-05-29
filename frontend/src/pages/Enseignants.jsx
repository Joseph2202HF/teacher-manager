/**
 * Page Liste des enseignants — CRUD complet
 * Design ultra-moderne compact pour PC avec filtre intelligent
 */

import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { enseignantAPI } from '../services/api'
import { useToast } from '../components/Toast'
import {
  UserPlus, Edit2, Trash2, Search, RefreshCw,
  ChevronUp, ChevronDown, Users, AlertTriangle, Database,
  Filter, X, SlidersHorizontal
} from 'lucide-react'

function DeleteModal({ name, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border p-7"
        style={{ 
          background: 'var(--card-bg)', 
          borderColor: 'var(--border-color)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)' 
        }}>
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center mb-5 mx-auto">
          <AlertTriangle size={20} className="text-rose-400" />
        </div>
        <h3 className="font-semibold text-base text-center mb-2" style={{ color: 'var(--text-primary)' }}>
          Supprimer l&apos;enseignant
        </h3>
        <p className="text-xs text-center mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Voulez-vous vraiment supprimer{' '}
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{name}</span> ?
          Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-9 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style={{ 
              color: 'var(--text-secondary)',
              background: 'var(--hover-bg)',
              border: '1px solid var(--border-color)'
            }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-9 rounded-lg text-xs font-medium text-white bg-rose-500/90 hover:bg-rose-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading
              ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <Trash2 size={13} />}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

// Filtre intelligent
function SmartFilter({ filters, setFilters, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setFilters(localFilters)
    onClose?.()
  }

  const resetFilters = () => {
    const reset = {
      search: '',
      heuresMin: '',
      heuresMax: '',
      tauxMin: '',
      tauxMax: '',
      salaireMin: '',
      salaireMax: '',
    }
    setLocalFilters(reset)
    setFilters(reset)
    onClose?.()
  }

  return (
    <div className="absolute top-full left-0 mt-2 w-[500px] rounded-2xl border p-6 z-50"
      style={{ 
        background: 'var(--card-bg)', 
        borderColor: 'var(--border-color)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)' 
      }}>
      
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-cyan-500" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Filtres avancés</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ 
            background: 'var(--hover-bg)', 
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Nombre d'heures
          </label>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={localFilters.heuresMin} onChange={(e) => handleChange('heuresMin', e.target.value)} className="flex-1 h-9 px-3 rounded-lg text-sm focus:outline-none transition-colors input-dark" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>à</span>
            <input type="number" placeholder="Max" value={localFilters.heuresMax} onChange={(e) => handleChange('heuresMax', e.target.value)} className="flex-1 h-9 px-3 rounded-lg text-sm focus:outline-none transition-colors input-dark" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Taux horaire (Ar)
          </label>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={localFilters.tauxMin} onChange={(e) => handleChange('tauxMin', e.target.value)} className="flex-1 h-9 px-3 rounded-lg text-sm focus:outline-none transition-colors input-dark" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>à</span>
            <input type="number" placeholder="Max" value={localFilters.tauxMax} onChange={(e) => handleChange('tauxMax', e.target.value)} className="flex-1 h-9 px-3 rounded-lg text-sm focus:outline-none transition-colors input-dark" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Salaire (Ar)
          </label>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={localFilters.salaireMin} onChange={(e) => handleChange('salaireMin', e.target.value)} className="flex-1 h-9 px-3 rounded-lg text-sm focus:outline-none transition-colors input-dark" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>à</span>
            <input type="number" placeholder="Max" value={localFilters.salaireMax} onChange={(e) => handleChange('salaireMax', e.target.value)} className="flex-1 h-9 px-3 rounded-lg text-sm focus:outline-none transition-colors input-dark" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6">
        <button
          onClick={resetFilters}
          className="flex-1 h-9 rounded-lg text-xs font-medium transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
        >
          Réinitialiser
        </button>
        <button
          onClick={applyFilters}
          className="flex-1 h-9 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}
        >
          Appliquer
        </button>
      </div>
    </div>
  )
}

export default function Enseignants() {
  const [list, setList]         = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [sort, setSort]         = useState({ key: 'nom', dir: 'asc' })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    heuresMin: '', heuresMax: '', tauxMin: '', tauxMax: '', salaireMin: '', salaireMax: '',
  })

  const { show, ToastContainer } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await enseignantAPI.getAll()
      setList(data.data)
    } catch {
      show('Erreur lors du chargement.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== '' && v !== undefined).length
  }, [filters])

  useEffect(() => {
    let result = [...list]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((e) => e.nom.toLowerCase().includes(q))
    }
    if (filters.heuresMin !== '') result = result.filter((e) => Number(e.nbheures) >= Number(filters.heuresMin))
    if (filters.heuresMax !== '') result = result.filter((e) => Number(e.nbheures) <= Number(filters.heuresMax))
    if (filters.tauxMin !== '') result = result.filter((e) => Number(e.tauxhoraire) >= Number(filters.tauxMin))
    if (filters.tauxMax !== '') result = result.filter((e) => Number(e.tauxhoraire) <= Number(filters.tauxMax))
    if (filters.salaireMin !== '') result = result.filter((e) => Number(e.salaire) >= Number(filters.salaireMin))
    if (filters.salaireMax !== '') result = result.filter((e) => Number(e.salaire) <= Number(filters.salaireMax))
    result.sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key]
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase() }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    setFiltered(result)
  }, [list, search, sort, filters])

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await enseignantAPI.delete(toDelete.numEns)
      setList((l) => l.filter((e) => e.numEns !== toDelete.numEns))
      show(`${toDelete.nom} supprimé avec succès.`)
    } catch {
      show('Erreur lors de la suppression.', 'error')
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const SortIcon = ({ col }) => {
    if (sort.key !== col) return <ChevronUp size={12} className="opacity-30" style={{ color: 'var(--text-muted)' }} />
    return sort.dir === 'asc'
      ? <ChevronUp size={12} style={{ color: '#2563eb' }} />
      : <ChevronDown size={12} style={{ color: '#2563eb' }} />
  }

  const totalHeures  = filtered.reduce((acc, e) => acc + Number(e.nbheures), 0)
  const totalSalaire = filtered.reduce((acc, e) => acc + Number(e.salaire), 0)

  return (
    <div className="min-h-screen w-full px-6 py-7">
      <ToastContainer />
      {toDelete && (
        <DeleteModal
          name={toDelete.nom}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}

      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Users size={17} className="text-indigo-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Enseignants</h1>
              <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                <Database size={10} style={{ color: '#2563eb' }} />
                {filtered.length} enregistrement{filtered.length !== 1 ? 's' : ''}
                {activeFilterCount > 0 && (
                  <span style={{ color: '#2563eb' }}>• {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={load}
              disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
              style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              title="Rafraîchir"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link
              to="/enseignants/ajouter"
              className="h-9 px-4 rounded-xl text-xs font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}
            >
              <UserPlus size={14} />
              Ajouter un enseignant
            </Link>
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total enseignants', value: filtered.length, suffix: '', color: 'indigo' },
            { label: 'Total heures',       value: totalHeures,     suffix: 'h',  color: 'violet' },
            { label: 'Masse salariale',    value: totalSalaire.toLocaleString('fr'), suffix: ' Ar', color: 'cyan' },
          ].map(({ label, value, suffix, color }) => (
            <div
              key={label}
              className="rounded-xl border px-5 py-4"
              style={{ background: 'var(--surface-bg)', borderColor: 'var(--border-color)' }}
            >
              <p className="text-[11px] uppercase tracking-widest mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-2xl font-bold font-mono tracking-tight" style={{
                color: color === 'cyan' ? '#0891b2' : color === 'violet' ? '#7c3aed' : '#4f46e5'
              }}>
                {value}<span className="text-sm font-normal opacity-60 ml-0.5" style={{ color: 'var(--text-muted)' }}>{suffix}</span>
              </p>
            </div>
          ))}
        </div>

        {/* ── Search & Filters ── */}
        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl text-sm focus:outline-none transition-colors input-dark"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-4 rounded-xl text-xs font-medium flex items-center gap-2 transition-all"
              style={activeFilterCount === 0 ? { 
                background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)'
              } : {
                background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', color: '#2563eb'
              }}
            >
              <Filter size={13} />
              Filtres
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: '#2563eb' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            {showFilters && <SmartFilter filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />}
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters.heuresMin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                  style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)', color: '#4f46e5' }}>
                  Heures ≥ {filters.heuresMin}h
                  <button onClick={() => setFilters(prev => ({ ...prev, heuresMin: '' }))}>
                    <X size={12} className="hover:opacity-70 transition-opacity" />
                  </button>
                </span>
              )}
              {filters.heuresMax && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                  style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)', color: '#4f46e5' }}>
                  Heures ≤ {filters.heuresMax}h
                  <button onClick={() => setFilters(prev => ({ ...prev, heuresMax: '' }))}>
                    <X size={12} className="hover:opacity-70 transition-opacity" />
                  </button>
                </span>
              )}
              {filters.tauxMin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#7c3aed' }}>
                  Taux ≥ {Number(filters.tauxMin).toLocaleString()} Ar
                  <button onClick={() => setFilters(prev => ({ ...prev, tauxMin: '' }))}>
                    <X size={12} className="hover:opacity-70 transition-opacity" />
                  </button>
                </span>
              )}
              {filters.tauxMax && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#7c3aed' }}>
                  Taux ≤ {Number(filters.tauxMax).toLocaleString()} Ar
                  <button onClick={() => setFilters(prev => ({ ...prev, tauxMax: '' }))}>
                    <X size={12} className="hover:opacity-70 transition-opacity" />
                  </button>
                </span>
              )}
              {filters.salaireMin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                  style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.2)', color: '#0891b2' }}>
                  Salaire ≥ {Number(filters.salaireMin).toLocaleString()} Ar
                  <button onClick={() => setFilters(prev => ({ ...prev, salaireMin: '' }))}>
                    <X size={12} className="hover:opacity-70 transition-opacity" />
                  </button>
                </span>
              )}
              {filters.salaireMax && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                  style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.2)', color: '#0891b2' }}>
                  Salaire ≤ {Number(filters.salaireMax).toLocaleString()} Ar
                  <button onClick={() => setFilters(prev => ({ ...prev, salaireMax: '' }))}>
                    <X size={12} className="hover:opacity-70 transition-opacity" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className="w-full rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderColor: 'var(--border-color)', background: 'var(--surface-bg)' }} className="border-b">
                  {[
                    { key: 'numEns', label: 'ID', w: '7%' },
                    { key: 'nom', label: 'Nom complet', w: '25%' },
                    { key: 'nbheures', label: 'Heures', w: '12%' },
                    { key: 'tauxhoraire', label: 'Taux horaire', w: '14%' },
                    { key: 'salaire', label: 'Salaire', w: '16%' },
                  ].map(({ key, label, w }) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      style={{ width: w, color: 'var(--text-secondary)' }}
                      className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] cursor-pointer select-none transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        {label} <SortIcon col={key} />
                      </span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} style={{ borderColor: 'var(--border-color)' }} className="border-b">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 rounded-md animate-pulse" style={{ width: j === 1 ? '160px' : j === 5 ? '180px' : '70px', background: 'var(--surface-bg)' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border flex items-center justify-center" style={{ background: 'var(--hover-bg)', borderColor: 'var(--border-color)' }}>
                          <Search size={20} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {search || activeFilterCount > 0 ? 'Aucun résultat pour ces critères' : 'Aucun enseignant enregistré'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {search || activeFilterCount > 0 ? 'Essayez de modifier vos filtres' : 'Commencez par ajouter un enseignant'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr
                      key={e.numEns}
                      style={{ borderColor: 'var(--border-color)' }}
                      className="border-b transition-colors"
                      onMouseEnter={(ev) => ev.currentTarget.style.background = 'var(--table-hover)'}
                      onMouseLeave={(ev) => ev.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-md border text-xs font-mono font-semibold"
                          style={{ background: 'var(--hover-bg)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                          #{e.numEns}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0"
                            style={{ background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.2)', color: '#4f46e5' }}>
                            {e.nom[0]}
                          </div>
                          <span className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>{e.nom}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold"
                          style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.15)', color: '#4f46e5' }}>
                          {e.nbheures}<span className="opacity-60 text-[10px]">h</span>
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {Number(e.tauxhoraire).toLocaleString('fr')}
                          <span style={{ color: 'var(--text-muted)' }} className="ml-1">Ar</span>
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold font-mono"
                          style={{ 
                            background: 'rgba(8,145,178,0.1)', 
                            border: '1px solid rgba(8,145,178,0.2)', 
                            color: '#0891b2'
                          }}>
                          {Number(e.salaire).toLocaleString('fr')}
                          <span className="text-[10px] font-normal opacity-60">Ar</span>
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/enseignants/${e.numEns}/modifier`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)', color: '#4f46e5' }}
                          >
                            <Edit2 size={12} />
                            Modifier
                          </Link>
                          <button
                            onClick={() => setToDelete(e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', color: '#e11d48' }}
                          >
                            <Trash2 size={12} />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--border-color)', background: 'var(--surface-bg)' }}>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {filtered.length} enseignant{filtered.length !== 1 ? 's' : ''}
                {activeFilterCount > 0 && (
                  <span style={{ color: '#2563eb' }} className="ml-1">filtré{filtered.length > 1 ? 's' : ''}</span>
                )}
              </span>
              <div className="flex items-center gap-8 text-[11px]">
                <span style={{ color: 'var(--text-secondary)' }}>
                  Heures: <span className="font-mono font-bold" style={{ color: '#4f46e5' }}>{totalHeures}h</span>
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Salaires: <span className="font-mono font-bold" style={{ color: '#0891b2' }}>{totalSalaire.toLocaleString('fr')} Ar</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
