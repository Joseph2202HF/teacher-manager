/**
 * Page Bilan — statistiques + camembert + histogramme
 * Design premium aligné sur le design system (index.css)
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
  Target, Wallet
} from 'lucide-react'

/* ─── Tooltip personnalisé ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card !p-3 !rounded-xl shadow-elevation-3" style={{ fontSize: '12px' }}>
      <p className="font-semibold mb-1 text-primary">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, fontFamily: '"JetBrains Mono", monospace' }}>
          {p.name} : {Number(p.value).toLocaleString('fr')} Ar
        </p>
      ))}
    </div>
  )
}

/* ─── Couleurs des graphiques ─── */
const CHART_COLORS = {
  min:   '#e11d48',
  max:   '#059669',
  total: '#4f46e5',
  grid:  'var(--border-color)',
  text:  'var(--text-muted)',
}

/* ─── Label personnalisé pour le camembert ─── */
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent, value }) => {
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 45
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  const formatValue = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`
    return val.toLocaleString('fr')
  }

  // Noms complets et lisibles
  const fullName = name === 'Masse Salariale Totale' ? 'Masse Totale' : name
  const pct = `${(percent * 100).toFixed(0)}%`

  return (
    <g>
      <polyline
        points={`
          ${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${cy + outerRadius * Math.sin(-midAngle * RADIAN)}
          ${cx + (outerRadius + 25) * Math.cos(-midAngle * RADIAN)},${cy + (outerRadius + 25) * Math.sin(-midAngle * RADIAN)}
          ${x},${y}
        `}
        stroke="var(--text-muted)"
        strokeWidth={1}
        strokeOpacity={0.5}
        fill="none"
      />
      <circle cx={x} cy={y} r={3} fill={name === 'Salaire Minimum' ? CHART_COLORS.min : name === 'Salaire Maximum' ? CHART_COLORS.max : CHART_COLORS.total} />
      <text
        x={x + (x > cx ? 10 : -10)}
        y={y - 6}
        textAnchor={x > cx ? 'start' : 'end'}
        fill="var(--text-primary)"
        fontSize="11"
        fontWeight="600"
      >
        {fullName}
      </text>
      <text
        x={x + (x > cx ? 10 : -10)}
        y={y + 10}
        textAnchor={x > cx ? 'start' : 'end'}
        fill="var(--text-muted)"
        fontSize="10"
      >
        {pct} · {formatValue(value)} Ar
      </text>
    </g>
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

  const bilanData = data ? [
    { name: 'Salaire Minimum',       value: data.salaire_min,   fill: CHART_COLORS.min },
    { name: 'Salaire Maximum',       value: data.salaire_max,   fill: CHART_COLORS.max },
    { name: 'Masse Salariale Totale', value: data.salaire_total, fill: CHART_COLORS.total },
  ] : []

  const stats = [
    { label: 'Total enseignants',     value: data?.total ?? 0,           suffix: '',   icon: Users,       tint: '99,102,241', color: '#4f46e5' },
    { label: 'Masse salariale totale', value: fmt(data?.salaire_total),   suffix: 'Ar', icon: Wallet,      tint: '6,182,212',  color: '#0891b2' },
    { label: 'Salaire maximal',       value: fmt(data?.salaire_max),     suffix: 'Ar', icon: TrendingUp,  tint: '16,185,129', color: '#059669', detail: data?.detail?.[0]?.nom },
    { label: 'Salaire minimal',       value: fmt(data?.salaire_min),     suffix: 'Ar', icon: TrendingDown,tint: '225,29,72',  color: '#e11d48', detail: data?.detail?.[data?.detail?.length - 1]?.nom },
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      <div className="space-y-6 stagger-children">

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 4px 12px rgba(16,185,129,0.15)' }}>
            <BarChart3 size={19} style={{ color: '#059669' }} />
          </div>
          <div>
            <h1 className="page-title !text-2xl">Bilan salarial</h1>
            <p className="text-[11px] flex items-center gap-1.5 mt-1 text-muted">
              <Target size={11} className="text-emerald-600" />
              Récapitulatif des rémunérations
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {stats.map(({ label, value, suffix, icon: Icon, tint, color, detail }, i) => (
            loading ? (
              <div key={label} className="card h-[104px] skeleton" />
            ) : (
              <div key={label} className="card !p-5 relative overflow-hidden group" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-40 transition-opacity duration-300 group-hover:opacity-80 pointer-events-none"
                     style={{ background: `radial-gradient(circle, rgba(${tint},0.12), transparent 70%)` }} />
                <div className="relative flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background: `rgba(${tint},0.12)`, border: `1px solid rgba(${tint},0.2)` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-widest mb-1.5 font-semibold text-muted">{label}</p>
                    <p className="text-2xl font-bold font-mono tracking-tight" style={{ color }}>
                      {value}{suffix && <span className="text-sm font-normal opacity-60 ml-1 text-muted">{suffix}</span>}
                    </p>
                    {detail && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {label.includes('maximal') ? <Award size={11} style={{ color, opacity: 0.7 }} /> : <Minus size={11} style={{ color, opacity: 0.7 }} />}
                        <span className="text-xs text-secondary truncate">{detail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Graphiques */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <PieIcon size={13} className="text-indigo-500" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Visualisations</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">

            {/* Histogramme */}
            <div className="card !p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 size={15} className="text-indigo-500" />
                  <h2 className="text-sm font-semibold text-primary">Bilan des salaires</h2>
                </div>
                <p className="text-xs text-muted">Salaire minimum, maximum et masse salariale totale</p>
              </div>
              {loading ? (
                <div className="h-[280px] rounded-xl skeleton" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={bilanData} margin={{ top: 4, right: 10, left: 10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} angle={0} textAnchor="middle" interval={0} tickLine={false} />
                    <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                    <Bar dataKey="value" name="Montant" radius={[6, 6, 0, 0]} maxBarSize={64}>
                      {bilanData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Camembert */}
            <div className="card !p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <PieIcon size={15} className="text-indigo-500" />
                  <h2 className="text-sm font-semibold text-primary">Répartition du bilan</h2>
                </div>
                <p className="text-xs text-muted">Proportion du salaire min, max et total</p>
              </div>
              {loading ? (
                <div className="h-[320px] rounded-xl skeleton" />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={bilanData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={70}
                      innerRadius={30}
                      paddingAngle={4}
                      label={renderPieLabel}
                      labelLine={false}
                    >
                      {bilanData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="var(--card-bg)" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${Number(v).toLocaleString('fr')} Ar`, 'Montant']}
                      contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px', boxShadow: 'var(--shadow-elevation-3)' }}
                      labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      itemStyle={{ color: 'var(--text-secondary)' }}
                    />
                    <Legend
                      formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{v}</span>}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
