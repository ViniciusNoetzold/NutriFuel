import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Search,
  Calendar,
  ShoppingCart,
  User,
  Zap,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const location = useLocation()
  const path = location.pathname

  const items = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: Search, label: 'Receitas', href: '/recipes' },
    { icon: Calendar, label: 'Plano', href: '/plan' },
    { icon: ShoppingCart, label: 'Compras', href: '/shop' },
    { icon: TrendingUp, label: 'Registro de evolução', href: '/evolution' },
    { icon: User, label: 'Perfil', href: '/profile' },
  ]

  return (
    <aside className="hidden h-[calc(100vh-2rem)] w-60 flex-col aero-glass md:flex fixed left-4 top-4 z-50">
      <div className="flex h-16 items-center px-6 border-b border-white/20 dark:border-white/5">
        <div className="bg-gradient-to-br from-primary to-cyan-300 p-1.5 rounded-xl shadow-inner mr-3 ring-1 ring-white/30">
          <Zap className="h-5 w-5 text-white fill-white" />
        </div>
        <div>
          <span className="block text-lg font-extrabold text-foreground drop-shadow-sm tracking-tight leading-none">
            NutriFuel
          </span>
          <span className="block text-[8px] font-bold text-primary uppercase tracking-wider">
            Seu corpo, seu combustível.
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-2 px-3">
          {items.map((item) => {
            const isActive = path === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 group',
                  isActive
                    ? 'bg-white/40 dark:bg-white/10 shadow-inner text-primary translate-x-1'
                    : 'text-muted-foreground hover:bg-white/20 dark:hover:bg-white/5 hover:text-foreground hover:translate-x-1',
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 drop-shadow-sm transition-transform group-hover:scale-110',
                    isActive && 'text-primary fill-current/20',
                  )}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-white/20 dark:border-white/5 bg-white/5 dark:bg-black/20">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-cyan-300 flex items-center justify-center text-white font-bold shadow-md border-2 border-white/50">
            U
          </div>
          <div className="text-sm">
            <p className="font-bold">Usuário</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
