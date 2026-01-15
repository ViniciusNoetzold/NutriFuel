import React, { useRef, useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import {
  Bell,
  ArrowLeft,
  Check,
  User,
  Sun,
  Moon,
  Settings,
  History,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { useAppStore } from '@/stores/useAppStore'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { NotificationHistory } from '@/components/NotificationHistory'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    user,
    notifications,
    markNotificationsAsRead,
    toggleWidget,
    reorderWidgets,
  } = useAppStore()
  const { setTheme, theme } = useTheme()
  const mainRef = useRef<HTMLDivElement>(null)
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [historyOpen, setHistoryOpen] = useState(false)

  // Determine if back button should be shown
  const isDetailPage =
    (location.pathname.startsWith('/recipes/') &&
      location.pathname !== '/recipes') ||
    location.pathname === '/evolution' ||
    location.pathname === '/recipes/create' ||
    location.pathname === '/recipes/scan'

  const unreadCount = notifications.filter((n) => !n.read).length

  // Scroll listener for Smart Navbar
  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return
      const currentScrollY = mainRef.current.scrollTop

      if (currentScrollY > lastScrollY && currentScrollY > 20) {
        setShowNavbar(false)
      } else {
        setShowNavbar(true)
      }
      setLastScrollY(currentScrollY)
    }

    const mainElement = mainRef.current
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [lastScrollY])

  const isWidgetVisible = (id: string) =>
    user.visibleWidgets?.includes(id) ?? true

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const currentOrder = [...(user.homeLayoutOrder || [])]
    const index = currentOrder.indexOf(id)
    if (index === -1) return

    if (direction === 'up' && index > 0) {
      ;[currentOrder[index], currentOrder[index - 1]] = [
        currentOrder[index - 1],
        currentOrder[index],
      ]
    } else if (direction === 'down' && index < currentOrder.length - 1) {
      ;[currentOrder[index], currentOrder[index + 1]] = [
        currentOrder[index + 1],
        currentOrder[index],
      ]
    }
    reorderWidgets(currentOrder)
  }

  const pageTitle = () => {
    if (location.pathname === '/') return 'Início'
    if (location.pathname === '/recipes') return 'Receitas'
    if (location.pathname === '/plan') return 'Plano Alimentar'
    if (location.pathname === '/shop') return 'Compras'
    if (location.pathname === '/profile') return 'Perfil'
    if (location.pathname === '/evolution') return 'Registro de evolução'
    if (location.pathname === '/recipes/create') return 'Nova Receita'
    if (location.pathname === '/recipes/scan') return 'Scanner'
    if (
      location.pathname.startsWith('/recipes/') &&
      !['/recipes', '/recipes/create', '/recipes/scan'].includes(
        location.pathname,
      )
    )
      return 'Detalhes'
    return ''
  }

  const WIDGET_LABELS: Record<string, string> = {
    macros: 'Macros & Status',
    hydration: 'Hidratação',
    meals: 'Refeições',
    sleep: 'Sono',
  }

  return (
    <div className="flex min-h-screen transition-colors duration-500 theme-light-bg dark:theme-dark-bg text-foreground overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none bg-texture-overlay mix-blend-overlay" />

      <Sidebar />
      <NotificationHistory open={historyOpen} onOpenChange={setHistoryOpen} />

      <main
        ref={mainRef}
        className="flex-1 md:pl-64 pb-24 md:pb-0 z-10 relative h-screen overflow-y-auto scroll-smooth"
      >
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-4 aero-glass mx-4 mt-4 mb-4 transition-transform duration-300 backdrop-blur-3xl bg-white/30 dark:bg-black/30 border-white/20">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              {isDetailPage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="hover:bg-white/20 rounded-full h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500 text-shadow-sm">
                NutriFuel
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-white/20 rounded-full"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 aero-glass" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/20 pb-2">
                    <span className="font-semibold text-sm">Dashboard</span>
                    <Settings className="h-4 w-4 opacity-50" />
                  </div>
                  <div className="space-y-2">
                    {user.homeLayoutOrder.map((id) => (
                      <div
                        key={id}
                        className="flex items-center justify-between bg-white/20 p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Switch
                            id={id}
                            checked={isWidgetVisible(id)}
                            onCheckedChange={() => toggleWidget(id)}
                            className="scale-75"
                          />
                          <Label htmlFor={id} className="text-xs font-medium">
                            {WIDGET_LABELS[id] || id}
                          </Label>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => moveWidget(id, 'up')}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => moveWidget(id, 'down')}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/20 pt-2">
                    <span className="text-xs font-semibold">Tema</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                      }
                      className="h-8 w-8 rounded-full"
                    >
                      {theme === 'dark' ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-white/20 rounded-full"
                >
                  <Bell className="h-6 w-6 text-foreground drop-shadow-md" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0 aero-glass border-white/40 dark:border-white/10 dark:bg-black/80 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden"
                align="end"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 bg-white/10 dark:bg-white/5">
                  <h4 className="font-semibold text-sm">Notificações</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setHistoryOpen(true)}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 text-xs hover:bg-white/20"
                      onClick={markNotificationsAsRead}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Lidas
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-white/10">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-4 text-sm transition-colors hover:bg-white/20 dark:hover:bg-white/5',
                            !notification.read && 'bg-white/10 dark:bg-white/5',
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p
                              className={cn(
                                'font-medium',
                                !notification.read && 'text-primary font-bold',
                              )}
                            >
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(notification.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {notification.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Nenhuma notificação.
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Link to="/profile">
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-white/50 shadow-md transition-transform hover:scale-105">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>
        <div className="container max-w-4xl mx-auto px-4 pb-20 animate-fade-in relative z-10">
          <Outlet />
        </div>
      </main>
      <BottomNav isVisible={showNavbar} />
    </div>
  )
}
