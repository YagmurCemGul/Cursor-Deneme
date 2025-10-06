import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Mail,
  Briefcase,
  User,
  Settings,
  FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const navigation = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { name: 'CV Builder', href: ROUTES.CV_BUILDER, icon: FileText },
      { name: 'Cover Letter', href: ROUTES.COVER_LETTER, icon: Mail },
      { name: 'Job Listings', href: ROUTES.JOBS, icon: Briefcase },
    ],
  },
  {
    title: 'Account',
    items: [
      { name: 'Profile', href: ROUTES.PROFILE, icon: User },
      { name: 'My Documents', href: '/documents', icon: FolderOpen },
      { name: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <ScrollArea className="h-full py-6">
      <div className="space-y-4 px-3">
        {navigation.map((section, idx) => (
          <div key={section.title}>
            {idx > 0 && <Separator className="my-4" />}
            <div className="space-y-1">
              <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-muted-foreground">
                {section.title}
              </h2>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
