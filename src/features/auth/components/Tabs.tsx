import { useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
  /** Small number pill next to the label, e.g. number of meters. */
  count?: number
}

export interface TabsProps {
  items: TabItem[]
  /** Controlled mode: pass value + onChange. */
  value?: string
  /** Uncontrolled mode: the tab that starts open (default: first). */
  defaultValue?: string
  onChange?: (id: string) => void
  /** Accessible name of the tab list. */
  label?: string
}

export default function Tabs({ items, value, defaultValue, onChange, label = 'Sections' }: TabsProps) {
  const baseId = useId()
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id ?? '')
  const active = value ?? inner
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const select = (id: string) => {
    setInner(id)
    onChange?.(id)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (items.length === 0) return

    const current = items.findIndex((t) => t.id === active)
    const last = items.length - 1

    // Which tab each key moves to. Keys not listed here are ignored.
    const targets: Partial<Record<string, number>> = {
      ArrowRight: current >= last ? 0 : current + 1,
      ArrowLeft: current <= 0 ? last : current - 1,
      Home: 0,
      End: last,
    }

    const next = targets[e.key]
    if (next === undefined) return

    e.preventDefault()
    select(items[next].id)
    tabRefs.current[next]?.focus()
  }

  const activeItem = items.find((t) => t.id === active)

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto border-b border-line"
      >
        {items.map((tab, i) => {
          const selected = tab.id === active
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
              className={`-mb-px inline-flex h-11 items-center gap-2 border-b-2 px-4 font-semibold whitespace-nowrap transition-colors ${
                selected
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`min-w-[22px] rounded-full border px-[7px] py-px text-center text-xs ${
                    selected
                      ? 'border-transparent bg-primary-soft text-primary'
                      : 'border-line bg-surface-2 text-muted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeItem && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.id}`}
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          tabIndex={0}
          className="pt-5"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  )
}