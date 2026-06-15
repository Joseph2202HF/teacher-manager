/**
 * Toast — notifications modernes professionnelles
 * Design premium aligné sur le design system (index.css)
 */

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════
   TOAST ITEM
   ═══════════════════════════════════════════════════════════ */
function ToastItem({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    requestAnimationFrame(() => setVisible(true))
    
    // Auto-fermeture
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(onClose, 300)
    }, 4500)
    
    return () => clearTimeout(timer)
  }, [onClose])

  const config = {
    success: {
      icon: CheckCircle2,
      bg: 'var(--card-bg)',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconBorder: '1px solid rgba(16, 185, 129, 0.2)',
      iconColor: '#10b981',
      title: 'Succès',
      titleColor: '#059669',
      shadow: '0 8px 32px rgba(16, 185, 129, 0.12), 0 2px 8px rgba(0,0,0,0.08)',
    },
    error: {
      icon: XCircle,
      bg: 'var(--card-bg)',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      iconBg: 'rgba(239, 68, 68, 0.1)',
      iconBorder: '1px solid rgba(239, 68, 68, 0.2)',
      iconColor: '#ef4444',
      title: 'Erreur',
      titleColor: '#dc2626',
      shadow: '0 8px 32px rgba(239, 68, 68, 0.12), 0 2px 8px rgba(0,0,0,0.08)',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'var(--card-bg)',
      border: '1px solid rgba(245, 158, 11, 0.25)',
      iconBg: 'rgba(245, 158, 11, 0.1)',
      iconBorder: '1px solid rgba(245, 158, 11, 0.2)',
      iconColor: '#f59e0b',
      title: 'Attention',
      titleColor: '#d97706',
      shadow: '0 8px 32px rgba(245, 158, 11, 0.12), 0 2px 8px rgba(0,0,0,0.08)',
    },
    info: {
      icon: Info,
      bg: 'var(--card-bg)',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      iconBg: 'rgba(59, 130, 246, 0.1)',
      iconBorder: '1px solid rgba(59, 130, 246, 0.2)',
      iconColor: '#3b82f6',
      title: 'Information',
      titleColor: '#2563eb',
      shadow: '0 8px 32px rgba(59, 130, 246, 0.12), 0 2px 8px rgba(0,0,0,0.08)',
    },
  }

  const { icon: Icon, bg, border, iconBg, iconBorder, iconColor, title, titleColor, shadow } = config[type] || config.info

  return (
    <div
      style={{
        background: bg,
        border,
        borderRadius: '14px',
        padding: '14px 18px',
        boxShadow: shadow,
        minWidth: '380px',
        maxWidth: '440px',
        opacity: visible && !exiting ? 1 : 0,
        transform: visible && !exiting ? 'translateX(0)' : 'translateX(30px)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        pointerEvents: 'auto',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icône */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: iconBg, border: iconBorder }}
        >
          <Icon size={17} style={{ color: iconColor }} />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs font-semibold mb-0.5" style={{ color: titleColor }}>
            {title}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={() => {
            setExiting(true)
            setTimeout(onClose, 300)
          }}
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--hover-bg)] mt-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HOOK useToast
   ═══════════════════════════════════════════════════════════ */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
  }, [])

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id))
  }, [])

  const ToastContainer = () => (
    <div
      className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none"
      style={{ maxHeight: '100vh', overflow: 'hidden' }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
      ))}
    </div>
  )

  return { show, ToastContainer }
}
