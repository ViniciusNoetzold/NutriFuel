import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { cn } from '@/lib/utils'
import { Bell, ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isRecipeDetail =
    location.pathname.startsWith('/recipes/') &&
    location.pathname !== '/recipes'

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
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
          </Button>
        </header>
        <div className="container max-w-3xl mx-auto p-4 md:p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
