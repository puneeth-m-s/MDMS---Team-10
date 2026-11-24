import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

type ModalSize = 'sm' | 'md' | 'lg'

// Full class names in a lookup so Tailwind can see them.
const SIZE_WIDTH: Record<ModalSize, string> = {
  sm: 'w-[min(420px,calc(100vw_-_24px))]',
  md: 'w-[min(560px,calc(100vw_-_24px))]',
  lg: 'w-[min(760px,calc(100vw_-_24px))]',
}

/* ---------- Modal ---------- */
export interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** Buttons at the bottom (Save / Cancel). */
  footer?: ReactNode
  size?: ModalSize
}

export default function Modal({ open, title, onClose, children, footer, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // m-auto: Tailwind's reset removes the dialog's default centring margin.
      className={`m-auto max-h-none max-w-none overflow-visible bg-transparent p-0 text-fg backdrop:bg-slate-950/55 ${SIZE_WIDTH[size]}`}
      onCancel={(e) => {
        // Escape key: let React state decide, not the browser.
        e.preventDefault()
        onClose()
      }}
      onClose={() => {
        if (open) onClose()
      }}
      onClick={(e) => {
        // A click on the dim backdrop targets the <dialog> element itself.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {open && (
        <div className="flex max-h-[calc(100vh-24px)] flex-col rounded-card border border-line bg-surface shadow-pop">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 id={titleId} className="text-lg font-bold">{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto p-5">{children}</div>

          {footer && (
            <div className="flex flex-wrap justify-end gap-2.5 border-t border-line px-5 py-3.5 max-sm:*:flex-[1_1_120px]">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}

/* ---------- ConfirmDialog ---------- */
export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** "danger" gives a red confirm button (deactivate, delete...). */
  tone?: 'primary' | 'danger'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <button type="button" className="btn" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-muted">{message}</div>
    </Modal>
  )
}