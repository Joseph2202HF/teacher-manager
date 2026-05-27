/**
 * Page Liste des enseignants — CRUD complet
 * Design ultra-moderne compact pour PC
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { enseignantAPI } from '../services/api'
import { useToast } from '../components/Toast'
import {
  UserPlus, Edit2, Trash2, Search, RefreshCw,
  ChevronUp, ChevronDown, Users, AlertTriangle, Database
} from 'lucide-react'

function DeleteModal({ name, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] p-7"
        style={{ background: 'rgba(12,16,26,0.98)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center mb-5 mx-auto">
          <AlertTriangle size={20} className="text-rose-400" />
        </div>
        <h3 className="font-semibold text-base text-center text-white mb-2">
          Supprimer l&apos;enseignant
        </h3>
        <p className="text-[#5a6478] text-xs text-center mb-6 leading-relaxed">
          Voulez-vous vraiment supprimer{' '}
          <span className="text-[#8892a4] font-medium">{name}</span> ?
          Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-9 rounded-lg text-xs font-medium text-[#6b7a90] bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] hover:text-white transition-colors disabled:opacity-50"
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

export default function Enseignants() {
  const [list, setList]         = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [sort, setSort]         = useState({ key: 'nom', dir: 'asc' })

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

  useEffect(() => {
    let result = [...list]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((e) => e.nom.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key]
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase() }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    setFiltered(result)
  }, [list, search, sort])

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
    if (sort.key !== col) return <ChevronUp size={12} className="opacity-20" />
    return sort.dir === 'asc'
      ? <ChevronUp size={12} className="text-cyan-400" />
      : <ChevronDown size={12} className="text-cyan-400" />
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
              <Users size={17} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">Enseignants</h1>
              <p className="text-[10px] text-[#4d5a6e] flex items-center gap-1 mt-0.5">
                <Database size={10} className="text-cyan-500/60" />
                {filtered.length} enregistrement{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={load}
              disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/[0.07] text-[#5a6478] hover:text-cyan-400 hover:border-cyan-500/30 transition-colors disabled:opacity-40"
              title="Rafraîchir"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link
              to="/enseignants/ajouter"
              className="h-9 px-4 rounded-xl text-xs font-semibold text-[#030508] flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#00e8f5,#00b8c8)' }}
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
              className="rounded-xl border border-white/[0.06] px-5 py-4"
              style={{ background: 'rgba(12,16,26,0.7)' }}
            >
              <p className="text-[11px] text-[#4d5a6e] uppercase tracking-widest mb-1.5">{label}</p>
              <p className={`text-2xl font-bold font-mono tracking-tight ${
                color === 'cyan' ? 'text-cyan-300' :
                color === 'violet' ? 'text-violet-300' : 'text-indigo-300'
              }`}>
                {value}<span className="text-sm font-normal opacity-60 ml-0.5">{suffix}</span>
              </p>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4a5c]" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-[#080c15] border border-white/[0.07] text-sm text-white placeholder-[#2e3a4a] focus:outline-none focus:border-cyan-500/40 focus:bg-[#0a0f1a] transition-colors"
          />
        </div>

        {/* ── Table ── */}
        <div
          className="w-full rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: 'rgba(10,14,22,0.85)' }}
        >
          {/* top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {[
                    { key: 'numEns',      label: 'ID',           w: '7%'  },
                    { key: 'nom',         label: 'Nom complet',  w: '25%' },
                    { key: 'nbheures',    label: 'Heures',       w: '12%' },
                    { key: 'tauxhoraire', label: 'Taux horaire', w: '14%' },
                    { key: 'salaire',     label: 'Salaire',      w: '16%' },
                  ].map(({ key, label, w }) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      style={{ width: w }}
                      className="px-5 py-3.5 text-left text-[10px] font-bold text-[#3d4a5c] uppercase tracking-[0.12em] cursor-pointer select-none hover:text-cyan-400 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        {label} <SortIcon col={key} />
                      </span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold text-[#3d4a5c] uppercase tracking-[0.12em]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div
                            className="h-4 rounded-md animate-pulse"
                            style={{
                              width: j === 1 ? '160px' : j === 5 ? '180px' : '70px',
                              background: 'rgba(255,255,255,0.04)',
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                          <Search size={20} className="text-[#2e3a4a]" />
                        </div>
                        <p className="text-[#4d5a6e] text-sm">
                          {search ? 'Aucun résultat pour cette recherche' : 'Aucun enseignant enregistré'}
                        </p>
                        <p className="text-[#2e3a4a] text-xs">
                          {search ? 'Essayez avec un autre terme' : 'Commencez par ajouter un enseignant'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr
                      key={e.numEns}
                      className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors group"
                    >
                      {/* ID */}
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[#3d4a5c] text-xs font-mono">
                          #{e.numEns}
                        </span>
                      </td>

                      {/* Nom */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-300 uppercase shrink-0 border border-indigo-500/15"
                            style={{ background: 'rgba(99,102,241,0.12)' }}
                          >
                            {e.nom[0]}
                          </div>
                          <span className="font-medium text-white text-[13px]">{e.nom}</span>
                        </div>
                      </td>

                      {/* Heures */}
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/15 text-indigo-300 text-xs font-mono">
                          {e.nbheures}<span className="opacity-50 text-[10px]">h</span>
                        </span>
                      </td>

                      {/* Taux horaire */}
                      <td className="px-5 py-3">
                        <span className="text-[#6b7a90] font-mono text-xs">
                          {Number(e.tauxhoraire).toLocaleString('fr')}
                          <span className="text-[#3d4a5c] ml-1">Ar</span>
                        </span>
                      </td>

                      {/* Salaire */}
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-cyan-300 text-[13px] font-bold font-mono"
                          style={{ background: 'rgba(0,240,255,0.07)', border: '1px solid rgba(0,240,255,0.15)' }}
                        >
                          {Number(e.salaire).toLocaleString('fr')}
                          <span className="text-cyan-500/50 text-[10px] font-normal">Ar</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/enseignants/${e.numEns}/modifier`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
                          >
                            <Edit2 size={12} />
                            Modifier
                          </Link>
                          <button
                            onClick={() => setToDelete(e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors"
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

          {/* ── Footer stats ── */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-white/[0.04] bg-white/[0.01] flex items-center justify-between">
              <span className="text-[11px] text-[#3d4a5c]">
                <span className="text-[#5a6478]">{filtered.length}</span> enseignant{filtered.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-8 text-[11px]">
                <span className="text-[#3d4a5c]">
                  Heures: <span className="text-indigo-400 font-mono font-semibold">{totalHeures}h</span>
                </span>
                <span className="text-[#3d4a5c]">
                  Salaires: <span className="text-cyan-400 font-mono font-semibold">{totalSalaire.toLocaleString('fr')} Ar</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
