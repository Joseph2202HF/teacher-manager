/**
 * Page Bilan — statistiques + camembert + histogramme
 */

import { useEffect, useState } from 'react'
import { enseignantAPI } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, Users,
  BarChart3, Award, Minus, PieChart as PieIcon,
} from 'lucide-react'

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

export default function Bilan() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await enseignantAPI.bilan()
      setData(res.data.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const fmt = (n) => Number(n ?? 0).toLocaleString('fr')

  // Préparer les données pour le graphique de bilan (min, max, total)
  const bilanData = data ? [
    { name: 'Salaire Minimum', value: data.salaire_min, fill: '#f43f5e' },
    { name: 'Salaire Maximum', value: data.salaire_max, fill: '#10b981' },
    { name: 'Masse Salariale Totale', value: data.salaire_total, fill: '#6366f1' },
  ] : []

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald">
          <BarChart3 size={19} />
        </div>
        <div>
          <h1 className="page-title">Bilan salarial</h1>
          <p className="text-[#8892a4] text-xs mt-0.5">Récapitulatif des rémunérations</p>
        </div>
      </div>

      {/* ── 4 cartes en grid 2x2 ── */}
      <div className="grid sm:grid-cols-2 gap-5">

        {/* Total enseignants */}
        {loading ? (
          <div className="card h-28 animate-pulse" />
        ) : (
          <div className="card animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo/10 border border-indigo/20 flex items-center justify-center text-indigo shrink-0">
                <Users size={22} />
              </div>
              <div>
                <p className="text-[#8892a4] text-xs font-medium uppercase tracking-wider">Total enseignants</p>
                <p className="font-display text-3xl font-bold text-[#e8edf5] mt-0.5">{data?.total ?? 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Masse salariale */}
        {loading ? (
          <div className="card h-28 animate-pulse" />
        ) : (
          <div className="card animate-slide-up" style={{ animationDelay:'80ms', animationFillMode:'both' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan shrink-0">
                <DollarSign size={22} />
              </div>
              <div>
                <p className="text-[#8892a4] text-xs font-medium uppercase tracking-wider">Masse salariale totale</p>
                <p className="font-display text-2xl font-bold text-cyan mt-1 font-mono">
                  {fmt(data?.salaire_total)}
                  <span className="text-sm font-sans font-normal text-[#8892a4] ml-1">Ar</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Salaire maximal */}
        {loading ? (
          <div className="card h-28 animate-pulse" />
        ) : (
          <div className="card animate-slide-up" style={{ animationDelay:'160ms', animationFillMode:'both' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald shrink-0">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-[#8892a4] text-xs font-medium uppercase tracking-wider">Salaire maximal</p>
                <p className="font-display text-2xl font-bold text-emerald mt-1 font-mono">
                  {fmt(data?.salaire_max)}
                  <span className="text-sm font-sans font-normal text-[#8892a4] ml-1">Ar</span>
                </p>
                {data?.detail?.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Award size={11} className="text-emerald/60" />
                    <span className="text-xs text-[#4d5a6e]">{data.detail[0]?.nom}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Salaire minimal */}
        {loading ? (
          <div className="card h-28 animate-pulse" />
        ) : (
          <div className="card animate-slide-up" style={{ animationDelay:'240ms', animationFillMode:'both' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose/10 border border-rose/20 flex items-center justify-center text-rose shrink-0">
                <TrendingDown size={22} />
              </div>
              <div>
                <p className="text-[#8892a4] text-xs font-medium uppercase tracking-wider">Salaire minimal</p>
                <p className="font-display text-2xl font-bold text-rose mt-1 font-mono">
                  {fmt(data?.salaire_min)}
                  <span className="text-sm font-sans font-normal text-[#8892a4] ml-1">Ar</span>
                </p>
                {data?.detail?.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Minus size={11} className="text-rose/60" />
                    <span className="text-xs text-[#4d5a6e]">{data.detail[data.detail.length - 1]?.nom}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Graphiques ── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <PieIcon size={16} className="text-[#8892a4]" />
          <p className="text-xs font-semibold text-[#8892a4] uppercase tracking-wider">Visualisations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Histogramme du bilan */}
          <div className="card space-y-4">
            <div>
              <h2 className="font-display font-semibold text-[#e8edf5]">Bilan des salaires</h2>
              <p className="text-xs text-[#4d5a6e] mt-0.5">Salaire minimum, maximum et masse salariale totale</p>
            </div>
            {loading ? (
              <div className="h-64 bg-surface rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bilanData} margin={{ top: 4, right: 10, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252d3d" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#8892a4', fontSize: 11 }}
                    angle={0}
                    textAnchor="middle"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#8892a4', fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                  <Bar dataKey="value" name="Montant" radius={[6,6,0,0]} maxBarSize={80}>
                    {bilanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Camembert du bilan */}
          <div className="card space-y-4">
            <div>
              <h2 className="font-display font-semibold text-[#e8edf5]">Répartition du bilan</h2>
              <p className="text-xs text-[#4d5a6e] mt-0.5">Proportion du salaire min, max et total</p>
            </div>
            {loading ? (
              <div className="h-64 bg-surface rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={bilanData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    labelLine={{ stroke: '#3a4459' }}
                  >
                    {bilanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${Number(v).toLocaleString('fr')} Ar`, 'Montant']}
                    contentStyle={{ background:'#1c2333', border:'1px solid #252d3d', borderRadius:'12px', fontSize:'12px' }}
                    labelStyle={{ color:'#e8edf5' }}
                    itemStyle={{ color:'#8892a4' }}
                  />
                  <Legend 
                    formatter={(v) => <span className="text-xs text-[#8892a4]">{v}</span>}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
