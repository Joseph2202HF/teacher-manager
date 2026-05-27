/**
 * Sidebar — navigation principale
 */

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, UserPlus, BarChart3,
  LogOut, GraduationCap, ChevronRight, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard',            icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/enseignants',          icon: Users,           label: 'Enseignants'      },
  { to: '/enseignants/ajouter',  icon: UserPlus,        label: 'Ajouter'          },
  { to: '/bilan',                icon: BarChart3,       label: 'Bilan & Stats'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* ── Mobile toggle ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 rounded-xl bg-card border border-border lg:hidden"
      >
        <Menu size={20} className="text-[#e8edf5]" />
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
          bg-dark border-r border-border
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Close button (mobile) */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8892a4] hover:text-[#e8edf5] lg:hidden"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="px-5 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center">
              <GraduationCap size={18} className="text-cyan" />
            </div>
            <div>
              <p className="font-display font-bold text-[#e8edf5] text-base leading-tight">GestionEns</p>
              <p className="text-[10px] text-[#4d5a6e] font-mono uppercase tracking-widest">v1.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-4 mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#4d5a6e]">
            Navigation
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-link group ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={17} className="shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo/20 border border-indigo/30 flex items-center justify-center text-indigo text-xs font-bold uppercase">
              {user?.username?.[0] ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#e8edf5] truncate">{user?.username}</p>
              <p className="text-[11px] text-[#4d5a6e] capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-link w-full text-rose hover:text-rose hover:bg-rose/10">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
