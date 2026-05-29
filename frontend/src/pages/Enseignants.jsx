/**
 * Page Liste des enseignants — CRUD complet
 * Design premium aligné sur le design system (index.css)
 */

import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { enseignantAPI } from '../services/api'
import { useToast } from '../components/Toast'
import {
  UserPlus, Edit2, Trash2, Search, RefreshCw,
  ChevronUp, ChevronDown, Users, AlertTriangle, Database,
  Filter, X, SlidersHorizontal, Clock, Wallet, TrendingUp
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════
   MODAL SUPPRESSION
   ═══════════════════════════════════════════════════════════ */
function DeleteModal({ name, onConfirm, onCancel, loading }) {
  return (
    <>
      <div className="modal-overlay" onClick={onCancel} />
      <div className="modal left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 mx-auto"
             style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.25)' }}>
          <AlertTriangle size={22} style={{ color: '#e11d48' }} />
        </div>
        <h3 className="font-semibold text-base text-center mb-2 text-primary">
          Supprimer l&apos;enseignant
        </h3>
        <p className="text-xs text-center mb-6 leading-relaxed text-secondary">
          Voulez-vous vraiment supprimer{' '}
          <span className="font-semibold text-primary">{name}</span> ?
          Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
                  className="btn-secondary flex-1 !py-2 !px-4 !text-xs disabled:opacity-50">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
                  className="btn-danger flex-1 !py-2 !px-4 !text-xs disabled:opacity-50">
            {loading
              ? <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              : <Trash2 size={13} />}
            Supprimer
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   FILTRE INTELLIGENT — Fond opaque, textes visibles
   ═══════════════════════════════════════════════════════════ */
function SmartFilter({ filters, setFilters, onClose }) {
  const [local, setLocal] = useState(filters)
  const change = (k, v) => setLocal(p => ({ ...p, [k]: v }))
  const apply  = () => { setFilters(local); onClose?.() }
  const reset  = () => {
    const r = { search:'', heuresMin:'', heuresMax:'', tauxMin:'', tauxMax:'', salaireMin:'', salaireMax:'' }
    setLocal(r); setFilters(r); onClose?.()
  }

  const Range = ({ label, minKey, maxKey, unit, accent }) => (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
             style={{ color: 'var(--text-secondary)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        {label}{unit && <span className="normal-case font-normal opacity-60 ml-0.5">({unit})</span>}
      </label>
      <div className="flex items-center gap-2">
        <input type="number" placeholder="Min" value={local[minKey]}
               onChange={(e) => change(minKey, e.target.value)}
               className="input-dark !py-2 !px-3 !text-sm" />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
        <input type="number" placeholder="Max" value={local[maxKey]}
               onChange={(e) => change(maxKey, e.target.value)}
               className="input-dark !py-2 !px-3 !text-sm" />
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 z-40"
           style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
           onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] z-50 rounded-2xl p-6"
           style={{
             background: 'var(--bg-secondary)',
             border: '1px solid var(--border-color)',
             boxShadow: '0 24px 64px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
           }}>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                 style={{
                   background: 'rgba(79,70,229,0.12)',
                   border: '1px solid rgba(79,70,229,0.2)'
                 }}>
              <SlidersHorizontal size={16} style={{ color: '#4f46e5' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Filtres avancés
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Affinez votre recherche
              </p>
            </div>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)'
                  }}>
            <X size={14} />
          </button>
        </div>

        <div className="space-y-5">
          <Range label="Nombre d'heures" minKey="heuresMin" maxKey="heuresMax" unit="h"  accent="#4f46e5" />
          <Range label="Taux horaire"    minKey="tauxMin"   maxKey="tauxMax"   unit="Ar" accent="#7c3aed" />
          <Range label="Salaire"         minKey="salaireMin" maxKey="salaireMax" unit="Ar" accent="#0891b2" />
        </div>

        <div className="flex items-center gap-2 mt-6 pt-5 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={reset} className="btn-secondary flex-1 !py-2.5 !text-xs">
            Réinitialiser
          </button>
          <button onClick={apply} className="btn-primary flex-1 !py-2.5 !text-xs">
            Appliquer les filtres
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
   ═══════════════════════════════════════════════════════════ */
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
  const { show } = useToast()

  const load = async () => {
    setLoading(true)
    try { const { data } = await enseignantAPI.getAll(); setList(data.data) }
    catch { show('Erreur lors du chargement.', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '' && v !== undefined).length,
    [filters]
  )

  useEffect(() => {
    let r = [...list]
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter((e) => e.nom.toLowerCase().includes(q))
    }
    const num = (v) => Number(v)
    if (filters.heuresMin  !== '') r = r.filter(e => num(e.nbheures)    >= num(filters.heuresMin))
    if (filters.heuresMax  !== '') r = r.filter(e => num(e.nbheures)    <= num(filters.heuresMax))
    if (filters.tauxMin    !== '') r = r.filter(e => num(e.tauxhoraire) >= num(filters.tauxMin))
    if (filters.tauxMax    !== '') r = r.filter(e => num(e.tauxhoraire) <= num(filters.tauxMax))
    if (filters.salaireMin !== '') r = r.filter(e => num(e.salaire)     >= num(filters.salaireMin))
    if (filters.salaireMax !== '') r = r.filter(e => num(e.salaire)     <= num(filters.salaireMax))

    r.sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key]
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase() }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    setFiltered(r)
  }, [list, search, sort, filters])

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await enseignantAPI.delete(toDelete.numEns)
      setList((l) => l.filter((e) => e.numEns !== toDelete.numEns))
      show(`${toDelete.nom} supprimé avec succès.`, 'success')
    } catch { show('Erreur lors de la suppression.', 'error') }
    finally { setDeleting(false); setToDelete(null) }
  }

  const SortIcon = ({ col }) => {
    if (sort.key !== col) return <ChevronUp size={12} className="text-muted opacity-30" />
    return sort.dir === 'asc'
      ? <ChevronUp   size={12} style={{ color: '#2563eb' }} />
      : <ChevronDown size={12} style={{ color: '#2563eb' }} />
  }

  const totalHeures  = filtered.reduce((acc, e) => acc + Number(e.nbheures), 0)
  const totalSalaire = filtered.reduce((acc, e) => acc + Number(e.salaire), 0)

  const stats = [
    { label: 'Total enseignants', value: filtered.length, suffix: '', icon: Users,    tint: '99,102,241', color: '#4f46e5' },
    { label: 'Total heures',      value: totalHeures,     suffix: 'h', icon: Clock,    tint: '124,58,237', color: '#7c3aed' },
    { label: 'Masse salariale',   value: totalSalaire.toLocaleString('fr'), suffix: 'Ar', icon: Wallet, tint: '8,145,178', color: '#0891b2' },
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>

      {/* ═══ MODALES (rendues ici pour centrage immédiat) ═══ */}
      {toDelete && (
        <DeleteModal name={toDelete.nom} onConfirm={handleDelete}
                     onCancel={() => setToDelete(null)} loading={deleting} />
      )}
      {showFilters && (
        <SmartFilter filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />
      )}

      {/* ═══ CONTENU PRINCIPAL ═══ */}
      <div className="space-y-6 stagger-children">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                 style={{
                   background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(37,99,235,0.1))',
                   border: '1px solid rgba(99,102,241,0.25)',
                   boxShadow: '0 4px 12px rgba(79,70,229,0.15)'
                 }}>
              <Users size={19} style={{ color: '#4f46e5' }} />
            </div>
            <div>
              <h1 className="page-title !text-2xl">Enseignants</h1>
              <p className="text-[11px] flex items-center gap-1.5 mt-1 text-muted">
                <Database size={11} style={{ color: '#2563eb' }} />
                {filtered.length} enregistrement{filtered.length !== 1 ? 's' : ''}
                {activeFilterCount > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                    <span className="font-medium" style={{ color: '#2563eb' }}>
                      {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={load} disabled={loading}
                    className="btn-secondary !p-0 w-10 h-10 !rounded-xl disabled:opacity-40" title="Rafraîchir">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link to="/enseignants/ajouter" className="btn-primary !py-2.5 !px-4 !text-xs">
              <UserPlus size={14} />
              Ajouter un enseignant
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, suffix, icon: Icon, tint, color }, i) => (
            <div key={label} className="card !p-5 relative overflow-hidden group"
                 style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-40 transition-opacity duration-300 group-hover:opacity-80 pointer-events-none"
                   style={{ background: `radial-gradient(circle, rgba(${tint},0.12), transparent 70%)` }} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest mb-2 font-semibold text-muted">{label}</p>
                  <p className="text-2xl font-bold font-mono tracking-tight" style={{ color }}>
                    {value}
                    <span className="text-sm font-normal opacity-60 ml-0.5 text-muted">{suffix}</span>
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: `rgba(${tint},0.12)`, border: `1px solid rgba(${tint},0.2)` }}>
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input type="text" placeholder="Rechercher par nom..."
                   value={search} onChange={(e) => setSearch(e.target.value)}
                   className="input-dark !pl-9 !py-2.5 !text-sm" />
            {search && (
              <button onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-muted hover:text-primary hover:bg-[var(--hover-bg)] transition-colors">
                <X size={12} />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(true)}
                  className={activeFilterCount === 0
                    ? 'btn-secondary !py-2.5 !px-4 !text-xs'
                    : 'btn-primary !py-2.5 !px-4 !text-xs'}>
            <Filter size={13} />
            Filtres
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-white/25 text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {[
                ['heuresMin',  `Heures ≥ ${filters.heuresMin}h`,                       'indigo'],
                ['heuresMax',  `Heures ≤ ${filters.heuresMax}h`,                       'indigo'],
                ['tauxMin',    `Taux ≥ ${Number(filters.tauxMin).toLocaleString()} Ar`, 'indigo'],
                ['tauxMax',    `Taux ≤ ${Number(filters.tauxMax).toLocaleString()} Ar`, 'indigo'],
                ['salaireMin', `Salaire ≥ ${Number(filters.salaireMin).toLocaleString()} Ar`, 'cyan'],
                ['salaireMax', `Salaire ≤ ${Number(filters.salaireMax).toLocaleString()} Ar`, 'cyan'],
              ].filter(([k]) => filters[k]).map(([k, label, variant]) => (
                <span key={k} className={`badge-${variant} gap-1.5 !pr-1.5`}>
                  {label}
                  <button onClick={() => setFilters(p => ({ ...p, [k]: '' }))}
                          className="w-4 h-4 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="card !p-0 overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  {[
                    { key: 'numEns', label: 'ID', w: '7%' },
                    { key: 'nom', label: 'Nom complet', w: '28%' },
                    { key: 'nbheures', label: 'Heures', w: '12%' },
                    { key: 'tauxhoraire', label: 'Taux horaire', w: '14%' },
                    { key: 'salaire', label: 'Salaire', w: '17%' },
                  ].map(({ key, label, w }) => (
                    <th key={key} style={{ width: w }} onClick={() => toggleSort(key)}
                        className="!cursor-pointer select-none hover:!text-[color:var(--text-primary)] transition-colors">
                      <span className="flex items-center gap-1.5">
                        {label} <SortIcon col={key} />
                      </span>
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j}>
                          <div className="skeleton h-4" style={{ width: j === 1 ? '160px' : j === 5 ? '180px' : '70px' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="!py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                             style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                          <Search size={22} className="text-muted" />
                        </div>
                        <p className="text-sm font-medium text-secondary">
                          {search || activeFilterCount > 0 ? 'Aucun résultat' : 'Aucun enseignant enregistré'}
                        </p>
                        <p className="text-xs text-muted">
                          {search || activeFilterCount > 0 ? 'Modifiez vos filtres' : 'Ajoutez votre premier enseignant'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.numEns}>
                      <td>
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold inline-block"
                              style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                          #{e.numEns}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold uppercase shrink-0"
                               style={{
                                 background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(124,58,237,0.1))',
                                 border: '1px solid rgba(99,102,241,0.2)', color: '#4f46e5'
                               }}>
                            {e.nom[0]}
                          </div>
                          <span className="font-semibold text-[13px] text-primary">{e.nom}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-indigo gap-0.5 font-mono">
                          {e.nbheures}<span className="opacity-60 text-[10px]">h</span>
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs font-medium text-secondary">
                          {Number(e.tauxhoraire).toLocaleString('fr')}
                          <span className="ml-1 text-muted">Ar</span>
                        </span>
                      </td>
                      <td>
                        <span className="badge-cyan gap-1.5 font-mono !text-[13px] !font-bold">
                          {Number(e.salaire).toLocaleString('fr')}
                          <span className="text-[10px] font-normal opacity-60">Ar</span>
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link to={`/enseignants/${e.numEns}/modifier`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:-translate-y-0.5"
                                style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)', color: '#4f46e5' }}>
                            <Edit2 size={12} />Modifier
                          </Link>
                          <button onClick={() => setToDelete(e)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:-translate-y-0.5"
                                  style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', color: '#e11d48' }}>
                            <Trash2 size={12} />Supprimer
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
              <span className="text-[11px] font-medium text-secondary">
                {filtered.length} enseignant{filtered.length !== 1 ? 's' : ''}
                {activeFilterCount > 0 && <span className="ml-1" style={{ color: '#2563eb' }}>· filtré</span>}
              </span>
              <div className="flex items-center gap-6 text-[11px]">
                <span className="text-secondary flex items-center gap-1.5">
                  <Clock size={11} style={{ color: '#4f46e5' }} />
                  <span className="font-mono font-bold" style={{ color: '#4f46e5' }}>{totalHeures}h</span>
                </span>
                <span className="text-secondary flex items-center gap-1.5">
                  <TrendingUp size={11} style={{ color: '#0891b2' }} />
                  <span className="font-mono font-bold" style={{ color: '#0891b2' }}>{totalSalaire.toLocaleString('fr')} Ar</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
