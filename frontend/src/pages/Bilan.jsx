/**
 * Page Bilan — statistiques + graphiques (Recharts)
 */

import { useEffect, useState } from 'react'
import { enseignantAPI } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, Users, Clock,
  BarChart3, RefreshCw
} from 'lucide-react'

/* Couleurs du camembert */
const PIE_COLORS = ['#00e5ff','#6366f1','#10b981','#f59e0b','#f43f5e','#a78bfa','#34d399','#fb7185']

/* Tooltip personnalisé */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-card text-xs">
      <p className="font-semibold text-[#e8edf5] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name} : {Number(p.value).toLocaleString('fr')} Ar
        </p>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const cm = {
    cyan:    'text-cyan   bg-cyan/10   border-cyan/20',
    indigo:  'text-indigo bg-indigo/10 border-indigo/20',
    emerald: 'text-emerald bg-emerald/10 border-emerald/20',
    rose:    'text-rose   bg-rose/10   border-rose/20',
    amber:   'text-amber  bg-amber/10  border-amber/20',
  }
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cm[color]}`}>
        <Icon size={19} />
      </div>
      <div>
        <p className="text-[#8892a4] text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-display font-bold text-[#e8edf5] mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function Bilan() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await enseignantAPI.bilan()
      setData(res.data.data)
    } catch {
      // silently fail; user sees skeleton
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const fmt = (n) => Number(n ?? 0).toLocaleString('fr')

  // Tronquer les noms longs sur l'axe X du bar chart
  const tickFormatter = (value) =>
    value.length > 10 ? value.slice(0, 10) + '…' : value

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald">
            <BarChart3 size={19} />
          </div>
          <h1 className="page-title">Bilan & Statistiques</h1>
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary gap-2 text-xs">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users}       label="Total enseignants" value={data?.total ?? 0}                         color="indigo"  />
          <StatCard icon={DollarSign}  label="Masse salariale"   value={`${fmt(data?.salaire_total)} Ar`}         color="cyan"    />
          <StatCard icon={TrendingUp}  label="Salaire max"       value={`${fmt(data?.salaire_max)} Ar`}           color="emerald" />
          <StatCard icon={TrendingDown} label="Salaire min"      value={`${fmt(data?.salaire_min)} Ar`}           color="rose"    />
          <StatCard icon={Clock}        label="Total heures"     value={`${fmt(data?.total_heures)}h`}            color="amber"   />
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Bar chart */}
        <div className="card space-y-4">
          <div>
            <h2 className="font-display font-semibold text-[#e8edf5]">Histogramme des salaires</h2>
            <p className="text-xs text-[#4d5a6e] mt-0.5">Salaire calculé par enseignant</p>
          </div>
          {loading ? (
            <div className="h-64 bg-surface rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.detail ?? []} margin={{ top: 4, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252d3d" vertical={false} />
                <XAxis
                  dataKey="nom"
                  tick={{ fill: '#8892a4', fontSize: 11 }}
                  tickFormatter={tickFormatter}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fill: '#8892a4', fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar
                  dataKey="salaire"
                  name="Salaire"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card space-y-4">
          <div>
            <h2 className="font-display font-semibold text-[#e8edf5]">Répartition des salaires</h2>
            <p className="text-xs text-[#4d5a6e] mt-0.5">Part de chaque enseignant dans la masse salariale</p>
          </div>
          {loading ? (
            <div className="h-64 bg-surface rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.detail ?? []}
                  dataKey="salaire"
                  nameKey="nom"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  innerRadius={40}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#3a4459' }}
                >
                  {(data?.detail ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString('fr')} Ar`, 'Salaire']}
                  contentStyle={{ background: '#1c2333', border: '1px solid #252d3d', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#e8edf5' }}
                  itemStyle={{ color: '#8892a4' }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-[#8892a4]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detail table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-[#e8edf5]">Détail des rémunérations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-dark">
            <thead>
              <tr>
                <th>Enseignant</th>
                <th>Salaire (Ar)</th>
                <th>Part (%)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {[...Array(3)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-surface rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                (data?.detail ?? []).map((e, i) => {
                  const part = data.salaire_total > 0
                    ? ((e.salaire / data.salaire_total) * 100).toFixed(1)
                    : '0.0'
                  return (
                    <tr
                      key={e.nom}
                      className="border-b border-border/50 hover:bg-surface/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="font-medium text-[#e8edf5]">{e.nom}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-cyan font-mono">
                        {Number(e.salaire).toLocaleString('fr')}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#8892a4]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[80px] h-1.5 bg-surface rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${part}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                            />
                          </div>
                          <span className="font-mono text-xs">{part}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
