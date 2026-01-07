import React, { useRef, useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { Bell, ArrowLeft, Check, User } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { useAppStore } from '@/stores/useAppStore'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, notifications, markNotificationsAsRead } = useAppStore()
  const mainRef = useRef<HTMLDivElement>(null)
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const isRecipeDetail =
    location.pathname.startsWith('/recipes/') &&
    location.pathname !== '/recipes'

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

  return (
    <div className="flex min-h-screen transition-colors duration-500 theme-light-bg dark:theme-dark-bg text-foreground overflow-hidden relative">
      {/* Universal Background Texture Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none bg-texture-overlay mix-blend-overlay" />

      <Sidebar />
      <main
        ref={mainRef}
        className="flex-1 md:pl-64 pb-24 md:pb-0 z-10 relative h-screen overflow-y-auto scroll-smooth"
      >
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-4 aero-glass mx-4 mt-4 mb-4 transition-transform duration-300">
          <div className="flex items-center gap-2">
            {isRecipeDetail && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-white/20 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold tracking-tight text-shadow">
              {location.pathname === '/' && 'Início'}
              {location.pathname === '/recipes' && 'Receitas'}
              {location.pathname === '/plan' && 'Plano Alimentar'}
              {location.pathname === '/shop' && 'Compras'}
              {location.pathname === '/profile' && 'Perfil'}
              {location.pathname === '/plans' && 'Planos'}
              {isRecipeDetail && 'Detalhes'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 text-xs hover:bg-white/20"
                    onClick={markNotificationsAsRead}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Marcar lidas
                  </Button>
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
