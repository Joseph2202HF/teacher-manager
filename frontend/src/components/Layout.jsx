/**
 * Layout — enveloppe principale avec sidebar
 */

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useTheme } from '../context/ThemeContext'

export default function Layout() {
  const { isDark } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden relative">
        {/* Top gradient glow - adaptatif selon le thème */}
        <div 
          className="pointer-events-none fixed inset-x-0 top-0 h-48 z-0 transition-opacity duration-300"
          style={{
            background: isDark 
              ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%)'
              : 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%)'
          }}
        />
        
        {/* Grille de fond subtile */}
        <div 
          className="pointer-events-none fixed inset-0 opacity-[0.02] z-0"
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Contenu principal */}
        <div className="relative z-10 p-4 lg:p-6 xl:p-8 w-full animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
