/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const DURATION_MS = 4000

// Full class names in lookups so Tailwind can see them.
const ICONS: Record<ToastType, string> = { success: '✓', error: '!', info: 'i', warning: '!' }
const BORDER: Record<ToastType, string> = {
  success: 'border-l-primary',
  error: 'border-l-danger',
  info: 'border-l-info',
  warning: 'border-l-warning',
}
const ICON_BG: Record<ToastType, string> = {
  success: 'bg-primary text-on-primary',
  error: 'bg-danger text-white',
  info: 'bg-info text-white',
  warning: 'bg-warning text-slate-900',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId.current++
      setToasts((list) => [...list.slice(-3), { id, type, message }]) // keep at most 4 on screen
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION_MS))
    },
    [dismiss],
  )

  // Clear pending timers if the provider ever unmounts.
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => clearTimeout(t))
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => show('success', m),
      error: (m) => show('error', m),
      info: (m) => show('info', m),
      warning: (m) => show('warning', m),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-4 bottom-4 z-[200] flex w-[min(380px,calc(100vw_-_32px))] flex-col gap-2.5 max-sm:left-4 max-sm:w-auto"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            // "starting:" plays a small slide-in when the toast appears.
            className={`pointer-events-auto flex items-start gap-3 rounded-control border border-l-4 border-line bg-surface px-3.5 py-3 shadow-pop transition duration-200 starting:translate-y-2 starting:opacity-0 ${BORDER[t.type]}`}
          >
            <span
              aria-hidden="true"
              className={`grid size-[22px] shrink-0 place-items-center rounded-full text-[13px] font-extrabold ${ICON_BG[t.type]}`}
            >
              {ICONS[t.type]}
            </span>
            <p className="mt-0.5 flex-1 text-sm">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-xl leading-none text-muted hover:text-fg"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}