import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AnimatedLogo } from '@/components/AnimatedLogo'
import { Lock, User } from 'lucide-react'

export default function Login() {
  const { login } = useAppStore()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      const success = login(username, password)
      if (success) {
        navigate('/')
      }
      setIsLoading(false)
    }, 1000) // Fake delay for animation
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Background Bubbles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bubble absolute"
          style={{
            width: `${Math.random() * 200 + 50}px`,
            height: `${Math.random() * 200 + 50}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${10 + i * 2}s ease-in-out infinite`,
            opacity: 0.3,
          }}
        />
      ))}

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        <div className="aero-glass p-8 space-y-8 shadow-2xl border-white/60">
          <div className="flex flex-col items-center space-y-2">
            <AnimatedLogo />
            <h1 className="text-2xl font-bold text-foreground mt-4 text-shadow-lg tracking-tight">
              Fitness & Diet Manager
            </h1>
            <p className="text-muted-foreground text-sm text-center max-w-[200px]">
              Seu corpo, seu templo. Gerencie sua evolução.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 aero-input h-12"
                    placeholder="user"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 aero-input h-12"
                    placeholder="1234"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full aero-button h-12 font-bold text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Acessando...' : 'Entrar'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Não tem uma conta?{' '}
              <a href="#" className="text-primary hover:underline font-bold">
                Criar conta
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
