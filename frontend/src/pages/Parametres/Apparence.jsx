/**
 * Apparence — paramètres de thème
 * Design premium aligné sur le design system (index.css)
 */

import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon, Palette, Check, Sparkles } from 'lucide-react'

export default function Apparence() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div style={{ padding: '28px 32px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="space-y-6 stagger-children">

        {/* ═══ Header ═══ */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
               style={{
                 background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.1))',
                 border: '1px solid rgba(124,58,237,0.25)',
                 boxShadow: '0 4px 12px rgba(124,58,237,0.15)'
               }}>
            <Palette size={19} style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <h1 className="page-title !text-2xl">Apparence</h1>
            <p className="text-[11px] flex items-center gap-1.5 mt-1 text-muted">
              <Sparkles size={11} style={{ color: '#7c3aed' }} />
              Personnalisez l'affichage de l'application
            </p>
          </div>
        </div>

        {/* ═══ Sélection du thème ═══ */}
        <div className="card !p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-primary mb-1">
              Thème de l'application
            </h2>
            <p className="text-xs text-muted">
              Choisissez entre le mode sombre et le mode clair. Le changement est appliqué instantanément.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* ═══ Mode sombre ═══ */}
            <button
              onClick={() => !isDark && toggleTheme()}
              className="p-6 rounded-2xl border-2 transition-all duration-300 text-left group"
              style={{
                background: isDark ? 'rgba(6,182,212,0.04)' : 'var(--surface-bg)',
                borderColor: isDark ? 'rgba(6,182,212,0.4)' : 'var(--border-color)',
                cursor: isDark ? 'default' : 'pointer',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                     style={{
                       background: isDark ? 'rgba(6,182,212,0.12)' : 'var(--hover-bg)',
                       border: `1px solid ${isDark ? 'rgba(6,182,212,0.25)' : 'var(--border-color)'}`,
                     }}>
                  <Moon size={22} style={{ color: isDark ? '#0891b2' : 'var(--text-muted)' }} />
                </div>
                {isDark && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                       style={{ background: '#0891b2' }}>
                    <Check size={14} style={{ color: '#fff' }} />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Mode sombre
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Fond sombre avec texte clair, idéal pour les environnements peu lumineux et la concentration.
              </p>

              {/* Indicateur visuel */}
              <div className="mt-5 p-4 rounded-xl" style={{ background: '#0a0e17', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#e8edf5' }} />
                  <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="w-3/4 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="w-1/2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
              </div>
            </button>

            {/* ═══ Mode clair ═══ */}
            <button
              onClick={() => isDark && toggleTheme()}
              className="p-6 rounded-2xl border-2 transition-all duration-300 text-left group"
              style={{
                background: !isDark ? 'rgba(37,99,235,0.04)' : 'var(--surface-bg)',
                borderColor: !isDark ? 'rgba(37,99,235,0.4)' : 'var(--border-color)',
                cursor: !isDark ? 'default' : 'pointer',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                     style={{
                       background: !isDark ? 'rgba(37,99,235,0.12)' : 'var(--hover-bg)',
                       border: `1px solid ${!isDark ? 'rgba(37,99,235,0.25)' : 'var(--border-color)'}`,
                     }}>
                  <Sun size={22} style={{ color: !isDark ? '#2563eb' : 'var(--text-muted)' }} />
                </div>
                {!isDark && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                       style={{ background: '#2563eb' }}>
                    <Check size={14} style={{ color: '#fff' }} />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Mode clair
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Fond clair avec texte sombre, idéal pour la journée et les environnements très lumineux.
              </p>

              {/* Indicateur visuel */}
              <div className="mt-5 p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#0f172a' }} />
                  <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }} />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }} />
                  <div className="w-3/4 h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }} />
                  <div className="w-1/2 h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }} />
                </div>
              </div>
            </button>
          </div>

          {/* ═══ Info ═══ */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
               style={{
                 background: 'rgba(124,58,237,0.05)',
                 border: '1px solid rgba(124,58,237,0.15)'
               }}>
            <Sparkles size={15} style={{ color: '#7c3aed', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: '#7c3aed' }}>
                Thème actuel : {isDark ? 'Mode sombre' : 'Mode clair'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Votre préférence est enregistrée automatiquement et sera conservée lors de vos prochaines visites.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
