import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react'

export default function Apparence() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen w-full px-6 py-7">
      <div className="max-w-[800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <Palette size={19} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Apparence</h1>
            <p className="text-[10px] text-[#4d5a6e] mt-0.5">Personnalisez l'affichage de l'application</p>
          </div>
        </div>

        {/* Sélection du thème */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-[#e8edf5]">Thème de l'application</h2>
          <p className="text-xs text-[#4d5a6e]">Choisissez entre le mode sombre et le mode clair</p>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Mode sombre */}
            <button
              onClick={() => !isDark && toggleTheme()}
              className={`p-6 rounded-2xl border-2 transition-all ${
                isDark 
                  ? 'border-cyan-500 bg-cyan-500/5' 
                  : 'border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-cyan-500/15' : 'bg-white/[0.05]'
                }`}>
                  <Moon size={24} className={isDark ? 'text-cyan-400' : 'text-[#5a6478]'} />
                </div>
                {isDark && <Check size={20} className="text-cyan-400" />}
              </div>
              <h3 className="text-sm font-semibold text-white text-left mb-1">Mode sombre</h3>
              <p className="text-xs text-[#5a6478] text-left">
                Fond sombre avec texte clair, idéal pour les environnements peu lumineux
              </p>
            </button>

            {/* Mode clair */}
            <button
              onClick={() => isDark && toggleTheme()}
              className={`p-6 rounded-2xl border-2 transition-all ${
                !isDark 
                  ? 'border-cyan-500 bg-cyan-500/5' 
                  : 'border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  !isDark ? 'bg-cyan-500/15' : 'bg-white/[0.05]'
                }`}>
                  <Sun size={24} className={!isDark ? 'text-cyan-400' : 'text-[#5a6478]'} />
                </div>
                {!isDark && <Check size={20} className="text-cyan-400" />}
              </div>
              <h3 className="text-sm font-semibold text-white text-left mb-1">Mode clair</h3>
              <p className="text-xs text-[#5a6478] text-left">
                Fond clair avec texte sombre, idéal pour la journée
              </p>
            </button>
          </div>
        </div>

        {/* Prévisualisation */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-[#e8edf5]">Aperçu en temps réel</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/[0.06] px-4 py-3 bg-card">
              <div className="w-full h-2 rounded-full bg-surface mb-3" />
              <div className="w-3/4 h-2 rounded-full bg-surface mb-2" />
              <div className="w-1/2 h-2 rounded-full bg-surface" />
            </div>
            <div className="rounded-xl border border-white/[0.06] px-4 py-3 bg-card flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/25" />
            </div>
            <div className="rounded-xl border border-white/[0.06] px-4 py-3 bg-card flex items-center justify-center">
              <span className="text-xs text-[#5a6478]">Contenu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
