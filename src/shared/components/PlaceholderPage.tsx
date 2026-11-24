import { Link, useMatches } from 'react-router-dom'
import { ROLE_META } from '../layout/menuConfig'

interface RouteHandle {
  title?: string
}

/** TEMPORARY: delete this file once every route points to a real page. */
export default function PlaceholderPage() {
  const matches = useMatches()
  const handle = matches[matches.length - 1]?.handle as RouteHandle | undefined
  const title = handle?.title ?? 'Page'

  return (
    <section className="card mx-auto my-[8vh] w-[min(560px,calc(100%_-_32px))] text-center">
      <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
        Under construction
      </span>
      <h1 className="mt-3 mb-2 text-[length:clamp(22px,5vw,28px)] font-bold">{title}</h1>
      <p className="text-muted">
        This page is not built yet. Use the links below to jump between the three areas.
      </p>

      <p className="mt-6 mb-2 text-xs font-bold tracking-wider text-muted uppercase">
        Temporary role switcher
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        {Object.entries(ROLE_META).map(([role, meta]) => (
          <Link key={role} to={meta.home} className="btn btn-primary">
            {meta.label}
          </Link>
        ))}
      </div>
    </section>
  )
}