/**
 * Dashboard — vue d'ensemble avec statistiques rapides
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { enseignantAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Users, TrendingUp, TrendingDown, DollarSign,
  Clock, UserPlus, BarChart3, ChevronRight, RefreshCw
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'cyan', delay = 0 }) {
  const colorMap = {
    cyan:    'text-cyan   bg-cyan/10   border-cyan/20',
    indigo:  'text-indigo bg-indigo/10 border-indigo/20',
    emerald: 'text-emerald bg-emerald/10 border-emerald/20',
    rose:    'text-rose   bg-rose/10   border-rose/20',
    amber:   'text-amber  bg-amber/10  border-amber/20',
  }

  return (
    <div
      className="stat-card"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
          <Icon size={19} />
        </div>
      </div>
      <div>
        <p className="text-[#8892a4] text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-display font-bold text-[#e8edf5] mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-[#4d5a6e] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function RecentRow({ ens, index }) {
  const salaire = (ens.nbheures * ens.tauxhoraire).toFixed(2)
  return (
    <tr
      className="border-b border-border/50 hover:bg-surface/50 transition-colors duration-150 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo/10 border border-indigo/20 flex items-center justify-center text-indigo text-xs font-bold">
            {ens.nom[0].toUpperCase()}
          </div>
          <span className="text-[#e8edf5] font-medium">{ens.nom}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#8892a4] font-mono">{ens.nbheures}h</td>
      <td className="px-4 py-3 text-sm text-[#8892a4] font-mono">{Number(ens.tauxhoraire).toLocaleString('fr')} Ar</td>
      <td className="px-4 py-3 text-sm font-semibold text-cyan font-mono">{Number(salaire).toLocaleString('fr')} Ar</td>
    </tr>
  )
}

export default function Dashboard() {
  const { user }              = useAuth()
  const [bilan, setBilan]     = useState(null)
  const [list,  setList]      = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [bilanRes, listRes] = await Promise.all([
        enseignantAPI.bilan(),
        enseignantAPI.getAll(),
      ])
      setBilan(bilanRes.data.data)
      setList(listRes.data.data.slice(0, 5))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const fmt = (n) => Number(n ?? 0).toLocaleString('fr')

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 pt-2 lg:pt-0">
        <div>
          <h1 className="page-title">
            Bonjour, <span className="text-gradient-cyan">{user?.username}</span> 👋
          </h1>
          <p className="text-[#8892a4] text-sm mt-1">
            {new Date().toLocaleDateString('fr-MG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary gap-2 text-xs">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-28 animate-pulse bg-card/60" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}       label="Enseignants"    value={bilan?.total ?? 0}                       sub="Total enregistrés"              color="indigo"  delay={0}   />
          <StatCard icon={DollarSign}  label="Masse salariale" value={`${fmt(bilan?.salaire_total)} Ar`}     sub="Cumul des salaires"             color="cyan"    delay={80}  />
          <StatCard icon={TrendingUp}  label="Salaire max"    value={`${fmt(bilan?.salaire_max)} Ar`}        sub="Meilleure rémunération"         color="emerald" delay={160} />
          <StatCard icon={TrendingDown} label="Salaire min"   value={`${fmt(bilan?.salaire_min)} Ar`}        sub="Rémunération minimale"          color="rose"    delay={240} />
        </div>
      )}

      {/* Quick actions + recent */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Quick actions */}
        <div className="card space-y-3">
          <h2 className="font-display font-semibold text-[#e8edf5] text-sm uppercase tracking-wider">
            Actions rapides
          </h2>
          <Link to="/enseignants/ajouter" className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-border/30 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan">
              <UserPlus size={15} />
            </div>
            <span className="text-sm text-[#e8edf5] font-medium flex-1">Ajouter un enseignant</span>
            <ChevronRight size={14} className="text-[#4d5a6e] group-hover:text-[#8892a4]" />
          </Link>
          <Link to="/enseignants" className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-border/30 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-indigo/10 border border-indigo/20 flex items-center justify-center text-indigo">
              <Users size={15} />
            </div>
            <span className="text-sm text-[#e8edf5] font-medium flex-1">Gérer les enseignants</span>
            <ChevronRight size={14} className="text-[#4d5a6e] group-hover:text-[#8892a4]" />
          </Link>
          <Link to="/bilan" className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-border/30 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald">
              <BarChart3 size={15} />
            </div>
            <span className="text-sm text-[#e8edf5] font-medium flex-1">Voir le bilan complet</span>
            <ChevronRight size={14} className="text-[#4d5a6e] group-hover:text-[#8892a4]" />
          </Link>
        </div>

        {/* Recent list */}
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[#e8edf5] text-sm uppercase tracking-wider">
              Enseignants récents
            </h2>
            <Link to="/enseignants" className="text-xs text-cyan hover:text-cyan-400 flex items-center gap-1">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-surface animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full table-dark">
                <thead>
                  <tr>
                    <th>Nom</th><th>Heures</th><th>Taux</th><th>Salaire</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((e, i) => <RecentRow key={e.numEns} ens={e} index={i} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
