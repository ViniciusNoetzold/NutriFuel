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

  const isRecipeDetail =
    location.pathname.startsWith('/recipes/') &&
    location.pathname !== '/recipes'

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 md:pl-64 pb-20 md:pb-0">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            {isRecipeDetail && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="-ml-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg font-bold">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/recipes' && 'Receitas'}
              {location.pathname === '/plan' && 'Plano Alimentar'}
              {location.pathname === '/shop' && 'Lista de Compras'}
              {location.pathname === '/progress' && 'Progresso'}
              {location.pathname === '/profile' && 'Perfil'}
              {isRecipeDetail && 'Detalhes'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h4 className="font-semibold text-sm">Notificações</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 text-xs"
                    onClick={markNotificationsAsRead}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Marcar lidas
                  </Button>
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length > 0 ? (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-4 text-sm hover:bg-muted/50 transition-colors',
                            !notification.read && 'bg-muted/30',
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p
                              className={cn(
                                'font-medium',
                                !notification.read && 'text-primary',
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
              <Avatar className="h-8 w-8 cursor-pointer transition-opacity hover:opacity-80">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>
        <div className="container max-w-3xl mx-auto p-4 md:p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
