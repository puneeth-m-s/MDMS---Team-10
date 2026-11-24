import { forwardRef, useId, useState } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

/* ---------- Shared styling ---------- */
const CONTROL =
  'w-full rounded-control border border-line bg-surface px-3 text-fg transition-colors placeholder:text-muted focus:border-primary focus:ring-3 focus:ring-primary/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger'

/* ---------- Shared wrapper: label + control + hint + error ---------- */
interface FieldBase {
  label: string
  error?: string
  hint?: string
}

interface FieldShellProps extends FieldBase {
  id: string
  required?: boolean
  children: ReactNode
}

function FieldShell({ id, label, error, hint, required, children }: FieldShellProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-[13px] text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-[13px] text-danger">{error}</p>}
    </div>
  )
}

function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

/* ---------- Input ---------- */
export type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldBase

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className = '', ...rest },
  ref,
) {
  const generated = useId()
  const inputId = id ?? generated
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint} required={rest.required}>
      <input
        {...rest}
        ref={ref}
        id={inputId}
        className={`h-11 ${CONTROL} ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, hint)}
      />
    </FieldShell>
  )
})

/* ---------- PasswordInput (show / hide) ---------- */
export type PasswordInputProps = Omit<InputProps, 'type'>

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { label, error, hint, id, className = '', ...rest },
  ref,
) {
  const generated = useId()
  const inputId = id ?? generated
  const [visible, setVisible] = useState(false)

  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint} required={rest.required}>
      <div className="relative">
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`h-11 pr-[68px] ${CONTROL} ${className}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute top-1/2 right-1.5 h-8 -translate-y-1/2 rounded-lg px-2.5 text-[13px] font-bold text-primary hover:bg-primary-soft"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </FieldShell>
  )
})

/* ---------- Select ---------- */
export interface SelectOption {
  value: string
  label: string
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> &
  FieldBase & {
    options: readonly SelectOption[]
    /** Adds an empty first option, e.g. "Select a zone". */
    placeholder?: string
  }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, id, options, placeholder, className = '', ...rest },
  ref,
) {
  const generated = useId()
  const selectId = id ?? generated
  return (
    <FieldShell id={selectId} label={label} error={error} hint={hint} required={rest.required}>
      <select
        {...rest}
        ref={ref}
        id={selectId}
        className={`h-11 ${CONTROL} ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(selectId, error, hint)}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FieldShell>
  )
})

/* ---------- Textarea ---------- */
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldBase

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, className = '', ...rest },
  ref,
) {
  const generated = useId()
  const areaId = id ?? generated
  return (
    <FieldShell id={areaId} label={label} error={error} hint={hint} required={rest.required}>
      <textarea
        {...rest}
        ref={ref}
        id={areaId}
        className={`min-h-24 resize-y py-2.5 ${CONTROL} ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(areaId, error, hint)}
      />
    </FieldShell>
  )
})

/* ---------- Toggle (on / off switch) ---------- */
export type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  description?: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { label, description, id, ...rest },
  ref,
) {
  const generated = useId()
  const inputId = id ?? generated
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <label htmlFor={inputId} className="font-semibold">{label}</label>
        {description && (
          <p id={`${inputId}-desc`} className="mt-0.5 text-[13px] text-muted">{description}</p>
        )}
      </div>

      <span className="relative h-6 w-11 shrink-0">
        {/* The real checkbox sits invisibly on top; the "peer" styles below follow its state. */}
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          aria-describedby={description ? `${inputId}-desc` : undefined}
          className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-line transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary after:absolute after:top-[3px] after:left-[3px] after:size-[18px] after:rounded-full after:bg-white after:shadow-card after:transition-transform peer-checked:after:translate-x-5"
        />
      </span>
    </div>
  )
})