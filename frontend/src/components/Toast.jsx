/**
 * Toast — notifications succès/erreur légères
 */

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icon    = type === 'success' ? <CheckCircle size={17} /> : <XCircle size={17} />
  const classes = type === 'success'
    ? 'border-emerald/30 bg-emerald/10 text-emerald'
    : 'border-rose/30   bg-rose/10   text-rose'

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
        shadow-card backdrop-blur-sm transition-all duration-300
        ${classes}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {icon}
      <span>{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-auto opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}

/**
 * Hook utilitaire
 */
import { useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
  }, [])

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id))
  }, [])

  const ToastContainer = () => (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
      ))}
    </div>
  )

  return { show, ToastContainer }
}
