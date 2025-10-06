import { Link } from 'react-router-dom'
import { Menu, FileText, User, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Header() {
  // TODO: Bu değerler Adım 5'te (Auth) gerçek user store'dan gelecek
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
    initials: 'JD',
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">{APP_NAME}</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to={ROUTES.DASHBOARD}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            to={ROUTES.CV_BUILDER}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            CV Builder
          </Link>
          <Link
            to={ROUTES.COVER_LETTER}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Cover Letter
          </Link>
          <Link
            to={ROUTES.JOBS}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Jobs
          </Link>
        </nav>

        {/* Right: Language + User Menu */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={ROUTES.PROFILE} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={ROUTES.SETTINGS} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
