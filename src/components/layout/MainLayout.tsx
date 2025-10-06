import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { Breadcrumbs } from './Breadcrumbs'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MainLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar - Desktop only */}
        <aside className="hidden w-64 border-r bg-muted/10 lg:block">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="container mx-auto px-4 py-6">
              {/* Breadcrumbs */}
              <Breadcrumbs />
              
              {/* Page Content */}
              <div className="mt-4">
                <Outlet />
              </div>
            </div>
            
            {/* Footer */}
            <Footer />
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
