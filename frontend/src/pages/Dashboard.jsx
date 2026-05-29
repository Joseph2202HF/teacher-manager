/**
 * Dashboard — vue d'ensemble avec statistiques rapides
 * Design premium aligné sur le design system (index.css)
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { enseignantAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Users, TrendingUp, TrendingDown, DollarSign,
  Clock, UserPlus, BarChart3, ChevronRight, RefreshCw,
  LayoutDashboard, Sparkles
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════
   STAT CARD PREMIUM
   ═══════════════════════════════════════════════════════════ */
function StatCard({ icon: Icon, label, value, sub, tint, color, delay = 0 }) {
  return (
    <div className="card !p-5 relative overflow-hidden group"
         style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
      {/* Glow radial au hover */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-40 transition-opacity duration-300 group-hover:opacity-80 pointer-events-none"
           style={{ background: `radial-gradient(circle, rgba(${tint},0.12), transparent 70%)` }} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest mb-2 font-semibold text-muted">{label}</p>
          <p className="text-2xl font-bold font-mono tracking-tight" style={{ color }}>
            {value}
          </p>
          {sub && (
            <p className="text-[11px] mt-1 text-muted">{sub}</p>
          )}
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
             style={{
               background: `rgba(${tint},0.12)`,
               border: `1px solid rgba(${tint},0.2)`
             }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   LIGNE TABLEAU RÉCENT
   ═══════════════════════════════════════════════════════════ */
function RecentRow({ ens, index }) {
  const salaire = (ens.nbheures * ens.tauxhoraire).toFixed(0)
  return (
    <tr style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}>
      <td>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0"
               style={{
                 background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(124,58,237,0.1))',
                 border: '1px solid rgba(99,102,241,0.2)',
                 color: '#4f46e5'
               }}>
            {ens.nom[0]}
          </div>
          <span className="font-semibold text-[13px] text-primary">{ens.nom}</span>
        </div>
      </td>
      <td>
        <span className="badge-indigo gap-0.5 font-mono">
          {ens.nbheures}<span className="opacity-60 text-[10px]">h</span>
        </span>
      </td>
      <td>
        <span className="font-mono text-xs font-medium text-secondary">
          {Number(ens.tauxhoraire).toLocaleString('fr')}
          <span className="ml-1 text-muted">Ar</span>
        </span>
      </td>
      <td>
        <span className="badge-cyan gap-1.5 font-mono !text-[13px] !font-bold">
          {Number(salaire).toLocaleString('fr')}
          <span className="text-[10px] font-normal opacity-60">Ar</span>
        </span>
      </td>
    </tr>
  )
}

/* ═══════════════════════════════════════════════════════════
   PAGE DASHBOARD
   ═══════════════════════════════════════════════════════════ */
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

  /* Stats cards */
  const stats = [
    {
      label: 'Enseignants',
      value: bilan?.total ?? 0,
      sub: 'Total enregistrés',
      icon: Users,
      tint: '99,102,241',
      color: '#4f46e5',
    },
    {
      label: 'Masse salariale',
      value: `${fmt(bilan?.salaire_total)} Ar`,
      sub: 'Cumul des salaires',
      icon: DollarSign,
      tint: '6,182,212',
      color: '#0891b2',
    },
    {
      label: 'Salaire max',
      value: `${fmt(bilan?.salaire_max)} Ar`,
      sub: 'Meilleure rémunération',
      icon: TrendingUp,
      tint: '16,185,129',
      color: '#059669',
    },
    {
      label: 'Salaire min',
      value: `${fmt(bilan?.salaire_min)} Ar`,
      sub: 'Rémunération minimale',
      icon: TrendingDown,
      tint: '225,29,72',
      color: '#e11d48',
    },
  ]

  /* Actions rapides */
  const quickActions = [
    {
      to: '/enseignants/ajouter',
      icon: UserPlus,
      label: 'Ajouter un enseignant',
      tint: '6,182,212',
      color: '#0891b2',
    },
    {
      to: '/enseignants',
      icon: Users,
      label: 'Gérer les enseignants',
      tint: '99,102,241',
      color: '#4f46e5',
    },
    {
      to: '/bilan',
      icon: BarChart3,
      label: 'Voir le bilan complet',
      tint: '16,185,129',
      color: '#059669',
    },
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      <div className="space-y-6 stagger-children">

        {/* ═══ Header ═══ */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                 style={{
                   background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(8,145,178,0.1))',
                   border: '1px solid rgba(6,182,212,0.25)',
                   boxShadow: '0 4px 12px rgba(8,145,178,0.15)'
                 }}>
              <LayoutDashboard size={19} style={{ color: '#0891b2' }} />
            </div>
            <div>
              <h1 className="page-title !text-2xl">
                Bonjour, <span style={{ color: '#0891b2' }}>{user?.username}</span> 👋
              </h1>
              <p className="text-[11px] flex items-center gap-1.5 mt-1 text-muted">
                <Sparkles size={11} style={{ color: '#0891b2' }} />
                {new Date().toLocaleDateString('fr-MG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={load} disabled={loading}
                  className="btn-secondary !py-2.5 !px-4 !text-xs disabled:opacity-40">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {/* ═══ Stats cards ═══ */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-[104px] skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, sub, icon, tint, color }, i) => (
              <StatCard key={label} icon={icon} label={label} value={value} sub={sub}
                        tint={tint} color={color} delay={i * 80} />
            ))}
          </div>
        )}

        {/* ═══ Quick actions + Recent ═══ */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Quick actions */}
          <div className="card !p-6 space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                   style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <Sparkles size={13} style={{ color: '#0891b2' }} />
              </div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Actions rapides
              </h2>
            </div>
            {quickActions.map(({ to, icon: Icon, label, tint, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--hover-bg)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                     style={{
                       background: `rgba(${tint},0.1)`,
                       border: `1px solid rgba(${tint},0.2)`
                     }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <span className="text-sm font-medium flex-1">{label}</span>
                <ChevronRight size={14} className="opacity-40 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>

          {/* Recent list */}
          <div className="card !p-0 lg:col-span-2 overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: '#4f46e5' }} />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  Enseignants récents
                </h2>
              </div>
              <Link to="/enseignants"
                    className="text-xs font-medium flex items-center gap-1 transition-colors"
                    style={{ color: '#2563eb' }}>
                Voir tout <ChevronRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-10 rounded-lg" />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                     style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <Users size={20} className="text-muted" />
                </div>
                <p className="text-sm font-medium text-secondary">Aucun enseignant</p>
                <p className="text-xs text-muted mt-1">Ajoutez votre premier enseignant</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-dark">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Heures</th>
                      <th>Taux</th>
                      <th>Salaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((e, i) => (
                      <RecentRow key={e.numEns} ens={e} index={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            {!loading && list.length > 0 && (
              <div className="px-5 py-3 border-t flex items-center justify-between"
                   style={{ borderColor: 'var(--border-color)', background: 'var(--surface-bg)' }}>
                <span className="text-[11px] font-medium text-secondary">
                  {bilan?.total ?? 0} enseignant{(bilan?.total ?? 0) > 1 ? 's' : ''} au total
                </span>
                <span className="text-[11px] text-secondary flex items-center gap-1.5">
                  <DollarSign size={11} style={{ color: '#0891b2' }} />
                  <span className="font-mono font-bold" style={{ color: '#0891b2' }}>
                    {fmt(bilan?.salaire_total)} Ar
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
