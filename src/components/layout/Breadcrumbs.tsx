import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // Route name mapping
  const routeNames: Record<string, string> = {
    dashboard: 'Dashboard',
    'cv-builder': 'CV Builder',
    'cover-letter': 'Cover Letter',
    jobs: 'Job Listings',
    profile: 'Profile',
    settings: 'Settings',
    documents: 'My Documents',
  }

  if (pathnames.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        to="/"
        className="flex items-center hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>

      {pathnames.map((pathname, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const name = routeNames[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1)

        return (
          <Fragment key={to}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{name}</span>
            ) : (
              <Link to={to} className="hover:text-foreground">
                {name}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
