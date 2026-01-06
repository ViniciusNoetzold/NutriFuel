import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Search,
  Calendar,
  ShoppingCart,
  User,
  TrendingUp,
  Dumbbell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const location = useLocation()
  const path = location.pathname

  const items = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: Search, label: 'Receitas', href: '/recipes' },
    { icon: Calendar, label: 'Plano Alimentar', href: '/plan' },
    { icon: ShoppingCart, label: 'Lista de Compras', href: '/shop' },
    { icon: TrendingUp, label: 'Progresso', href: '/progress' },
    { icon: User, label: 'Perfil', href: '/profile' },
  ]

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-card md:flex fixed left-0 top-0">
      <div className="flex h-16 items-center px-6 border-b">
        <Dumbbell className="mr-2 h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-foreground">FitManager</span>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-3">
          {items.map((item) => {
            const isActive = path === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            U
          </div>
          <div className="text-sm">
            <p className="font-medium">Usuário</p>
            <p className="text-xs text-muted-foreground">Plano Básico</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
