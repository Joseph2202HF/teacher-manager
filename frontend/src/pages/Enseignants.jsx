/**
 * Page Liste des enseignants — CRUD complet
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { enseignantAPI } from '../services/api'
import { useToast } from '../components/Toast'
import {
  UserPlus, Edit2, Trash2, Search, RefreshCw,
  ChevronUp, ChevronDown, Users, AlertTriangle, Database
} from 'lucide-react'

/* Confirmation modal */
function DeleteModal({ name, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030508]/80 backdrop-blur-md">
      <div 
        className="w-full max-w-md p-8 rounded-3xl border border-white/[0.06] animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, rgba(15,20,30,0.95) 0%, rgba(10,15,25,0.98) 100%)',
          boxShadow: '0 0 0 1px rgba(251,113,133,0.1), 0 25px 60px -12px rgba(0,0,0,0.5), 0 0 80px rgba(251,113,133,0.08)',
        }}
      >
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 border border-rose-500/30 flex items-center justify-center mb-6 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-rose-500/20 blur-xl" />
          <AlertTriangle size={28} className="text-rose-400 relative z-10" />
        </div>
        <h3 className="font-display font-bold text-xl text-center text-white mb-3">
          Supprimer l&apos;enseignant
        </h3>
        <p className="text-[#6b7a90] text-sm text-center mb-8 leading-relaxed">
          Voulez-vous vraiment supprimer <span className="text-white font-semibold">{name}</span> ?
          <br />Cette action est irreversible.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onCancel} 
            disabled={loading}
            className="flex-1 h-12 rounded-xl font-semibold text-sm text-[#8892a4] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:text-white transition-all duration-200 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-12 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ boxShadow: '0 0 30px rgba(251,113,133,0.3)' }}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
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
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase()
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    setFiltered(result)
  }, [list, search, sort])

  const toggleSort = (key) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await enseignantAPI.delete(toDelete.numEns)
      setList((l) => l.filter((e) => e.numEns !== toDelete.numEns))
      show(`${toDelete.nom} supprime avec succes.`)
    } catch {
      show('Erreur lors de la suppression.', 'error')
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const SortIcon = ({ col }) => {
    if (sort.key !== col) return <ChevronUp size={14} className="opacity-30" />
    return sort.dir === 'asc'
      ? <ChevronUp size={14} className="text-cyan-400" />
      : <ChevronDown size={14} className="text-cyan-400" />
  }

  return (
    <div className="min-h-screen w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <ToastContainer />
      {toDelete && (
        <DeleteModal
          name={toDelete.nom}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}

      {/* Container ULTRA LARGE - 98% viewport avec petites marges */}
      <div className="w-full max-w-[90vw] mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 blur-xl opacity-40" />
              <div 
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center border border-indigo-500/30"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(0,240,255,0.1) 100%)' }}
              >
                <Users size={28} className="text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-transparent">
                Enseignants
              </h1>
              <p className="text-[#6b7a90] text-base mt-1.5 flex items-center gap-2">
                <Database size={14} className="text-cyan-500/70" />
                {filtered.length} enregistrement{filtered.length !== 1 ? 's' : ''} au total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={load} 
              disabled={loading} 
              className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-[#6b7a90] hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link 
              to="/enseignants/ajouter" 
              className="h-14 px-8 rounded-xl font-semibold text-base text-[#030508] flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #00c8d4 50%, #00a8b8 100%)',
                boxShadow: '0 0 30px rgba(0,240,255,0.3), 0 0 60px rgba(0,240,255,0.1)',
              }}
            >
              <UserPlus size={20} />
              Ajouter un enseignant
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4d5a6e]" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-14 pr-5 rounded-xl bg-[#0a0f18]/80 border border-white/[0.06] text-white text-base placeholder-[#3d4a5c] transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0c1220] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1),0_0_20px_rgba(0,240,255,0.1)] hover:border-white/10"
          />
        </div>

        {/* Table Card - FULL WIDTH */}
        <div 
          className="w-full rounded-3xl border border-white/[0.06] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,20,30,0.8) 0%, rgba(10,15,25,0.9) 100%)',
            boxShadow: '0 0 0 1px rgba(0,240,255,0.05), 0 20px 50px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {/* Top glow line */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th 
                    onClick={() => toggleSort('numEns')}
                    className="w-[8%] px-8 lg:px-12 py-6 text-left text-sm font-bold text-[#6b7a90] uppercase tracking-[0.15em] cursor-pointer select-none hover:text-cyan-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">ID <SortIcon col="numEns" /></span>
                  </th>
                  <th 
                    onClick={() => toggleSort('nom')}
                    className="w-[22%] px-8 lg:px-12 py-6 text-left text-sm font-bold text-[#6b7a90] uppercase tracking-[0.15em] cursor-pointer select-none hover:text-cyan-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">Nom complet <SortIcon col="nom" /></span>
                  </th>
                  <th 
                    onClick={() => toggleSort('nbheures')}
                    className="w-[12%] px-8 lg:px-12 py-6 text-left text-sm font-bold text-[#6b7a90] uppercase tracking-[0.15em] cursor-pointer select-none hover:text-cyan-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">Heures <SortIcon col="nbheures" /></span>
                  </th>
                  <th 
                    onClick={() => toggleSort('tauxhoraire')}
                    className="w-[14%] px-8 lg:px-12 py-6 text-left text-sm font-bold text-[#6b7a90] uppercase tracking-[0.15em] cursor-pointer select-none hover:text-cyan-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">Taux horaire <SortIcon col="tauxhoraire" /></span>
                  </th>
                  <th 
                    onClick={() => toggleSort('salaire')}
                    className="w-[16%] px-8 lg:px-12 py-6 text-left text-sm font-bold text-[#6b7a90] uppercase tracking-[0.15em] cursor-pointer select-none hover:text-cyan-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">Salaire <SortIcon col="salaire" /></span>
                  </th>
                  <th className="w-[28%] px-8 lg:px-12 py-6 text-left text-sm font-bold text-[#6b7a90] uppercase tracking-[0.15em]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-8 lg:px-12 py-7">
                          <div 
                            className="h-6 rounded-lg animate-pulse"
                            style={{ 
                              width: j === 1 ? '220px' : j === 5 ? '300px' : '100px',
                              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%)',
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 1.5s infinite',
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 lg:px-12 py-24 text-center">
                      <div className="flex flex-col items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                          <Search size={32} className="text-[#3d4a5c]" />
                        </div>
                        <div>
                          <p className="text-[#6b7a90] font-medium text-lg">
                            {search ? 'Aucun resultat pour cette recherche' : 'Aucun enseignant enregistre'}
                          </p>
                          <p className="text-[#3d4a5c] text-base mt-2">
                            {search ? 'Essayez avec un autre terme' : 'Commencez par ajouter un enseignant'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((e, i) => (
                    <tr
                      key={e.numEns}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-200 group"
                      style={{ 
                        animation: `fadeSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 50}ms backwards`
                      }}
                    >
                      <td className="px-8 lg:px-12 py-6">
                        <span className="inline-flex items-center px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#4d5a6e] text-sm font-mono">
                          #{e.numEns}
                        </span>
                      </td>
                      <td className="px-8 lg:px-12 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                            <div 
                              className="relative w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-indigo-300 uppercase border border-indigo-500/20"
                              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(0,240,255,0.1) 100%)' }}
                            >
                              {e.nom[0]}
                            </div>
                          </div>
                          <span className="font-semibold text-white text-lg">{e.nom}</span>
                        </div>
                      </td>
                      <td className="px-8 lg:px-12 py-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-base font-mono">
                          {e.nbheures}
                          <span className="text-indigo-400/60 text-sm">h</span>
                        </span>
                      </td>
                      <td className="px-8 lg:px-12 py-6">
                        <span className="text-[#8892a4] font-mono text-base">
                          {Number(e.tauxhoraire).toLocaleString('fr')}
                          <span className="text-[#4d5a6e] ml-1.5">Ar</span>
                        </span>
                      </td>
                      <td className="px-8 lg:px-12 py-6">
                        <span 
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-cyan-300 text-lg font-bold font-mono"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(0,240,255,0.05) 100%)',
                            border: '1px solid rgba(0,240,255,0.2)',
                            boxShadow: '0 0 20px rgba(0,240,255,0.1)',
                          }}
                        >
                          {Number(e.salaire).toLocaleString('fr')}
                          <span className="text-cyan-400/60 text-sm font-normal">Ar</span>
                        </span>
                      </td>
                      <td className="px-8 lg:px-12 py-6">
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/enseignants/${e.numEns}/modifier`}
                            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-base font-medium hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-200"
                          >
                            <Edit2 size={18} />
                            Modifier
                          </Link>
                          <button
                            onClick={() => setToDelete(e)}
                            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-base font-medium hover:bg-rose-500/20 hover:border-rose-500/30 hover:shadow-[0_0_20px_rgba(251,113,133,0.2)] transition-all duration-200"
                          >
                            <Trash2 size={18} />
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

          {/* Bottom stats bar */}
          {!loading && filtered.length > 0 && (
            <div className="px-8 lg:px-12 py-5 border-t border-white/[0.04] bg-white/[0.01] flex items-center justify-between">
              <span className="text-[#4d5a6e] text-base">
                Affichage de <span className="text-[#6b7a90] font-medium">{filtered.length}</span> enseignant{filtered.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-12 text-base">
                <span className="text-[#4d5a6e]">
                  Total heures: <span className="text-indigo-400 font-mono font-semibold text-lg">{filtered.reduce((acc, e) => acc + Number(e.nbheures), 0)}h</span>
                </span>
                <span className="text-[#4d5a6e]">
                  Total salaires: <span className="text-cyan-400 font-mono font-semibold text-lg">{filtered.reduce((acc, e) => acc + Number(e.salaire), 0).toLocaleString('fr')} Ar</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
