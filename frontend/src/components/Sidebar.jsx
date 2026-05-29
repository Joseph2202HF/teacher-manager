/**
 * Sidebar — navigation principale avec support thème clair/sombre
 */

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, UserPlus, BarChart3,
  LogOut, GraduationCap, ChevronRight, Menu, X,
  Palette, AlertTriangle
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard',            icon: LayoutDashboard, label: 'Tableau de bord', end: true },
  { to: '/enseignants',          icon: Users,           label: 'Enseignants',      end: true },
  { to: '/enseignants/ajouter',  icon: UserPlus,        label: 'Ajouter',          end: true },
  { to: '/bilan',                icon: BarChart3,       label: 'Bilan & Stats',    end: true },
]

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border p-7"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)'
        }}>
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center mb-5 mx-auto">
          <AlertTriangle size={20} className="text-rose-400" />
        </div>
        <h3 className="font-semibold text-base text-center mb-2" style={{ color: 'var(--text-primary)' }}>
          Déconnexion
        </h3>
        <p className="text-xs text-center mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Êtes-vous sûr de vouloir vous déconnecter ?<br />
          Vous devrez vous reconnecter pour accéder à l'application.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-lg text-xs font-medium transition-colors"
            style={{
              color: 'var(--text-primary)',
              background: 'var(--surface-bg)',
              border: '1px solid var(--border-color)'
            }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-9 rounded-lg text-xs font-medium text-white bg-rose-500/90 hover:bg-rose-500 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut size={13} />
            Déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Modal de confirmation de déconnexion */}
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}

      {/* ── Mobile toggle ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 rounded-xl lg:hidden"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)'
        }}
      >
        <Menu size={20} style={{ color: 'var(--text-primary)' }} />
      </button>

      {/* ── Overlay mobile ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-64 flex flex-col
          border-r transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)'
        }}
      >
        {/* Close button (mobile) */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg lg:hidden hover:bg-[var(--hover-bg)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center">
              <GraduationCap size={18} className="text-cyan" />
            </div>
            <div>
              <p className="font-display font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                GestionEns
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                v1.0
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Navigation principale */}
          <p className="px-4 mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </p>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-link group ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                color: isActive ? '#06b6d4' : 'var(--text-secondary)',
                background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              })}
            >
              <Icon size={17} className="shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Footer : Paramètres + Déconnexion */}
        <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: 'var(--border-color)' }}>
          {/* Apparence */}
          <NavLink
            to="/parametres/apparence"
            end
            onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              color: isActive ? '#06b6d4' : 'var(--text-secondary)',
              background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
              transition: 'all 0.2s ease'
            })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm group"
          >
            <Palette size={17} className="shrink-0" />
            <span className="flex-1">Apparence</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
          </NavLink>

          {/* Séparateur */}
          <div className="my-2 border-t" style={{ borderColor: 'var(--border-color)' }} />

          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-2" 
            style={{ background: 'var(--surface-bg)' }}>
            <div className="w-8 h-8 rounded-full bg-indigo/20 border border-indigo/30 flex items-center justify-center text-indigo text-xs font-bold uppercase">
              {user?.username?.[0] ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.username}
              </p>
              <p className="text-[11px] capitalize" style={{ color: 'var(--text-muted)' }}>
                {user?.role}
              </p>
            </div>
          </div>

          {/* Déconnexion */}
          <button 
            onClick={() => setShowLogout(true)} 
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-rose hover:bg-rose/10 transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
