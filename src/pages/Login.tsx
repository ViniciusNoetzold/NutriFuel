import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AnimatedLogo } from '@/components/AnimatedLogo'
import { Lock, User, ArrowRight } from 'lucide-react'

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
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Cinematic Gym Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-60"
        style={{
          backgroundImage:
            "url('https://img.usecurling.com/p/1920/1080?q=cinematic%20gym%20lighting&color=black')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-0" />

      {/* Floating Particles/Bubbles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bubble absolute"
          style={{
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${10 + i * 2}s ease-in-out infinite`,
            opacity: 0.1,
          }}
        />
      ))}

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl space-y-8 relative overflow-hidden">
          {/* Top sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="flex flex-col items-center space-y-2">
            <AnimatedLogo />
            <h1 className="text-3xl font-bold text-white mt-4 text-shadow-lg tracking-tight">
              Fitness & Diet
            </h1>
            <p className="text-white/60 text-sm text-center max-w-[200px]">
              Evolução e alta performance.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80 ml-1">
                  Usuário
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-primary/50 focus:bg-white/10 transition-all"
                    placeholder="user"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80 ml-1">
                  Senha
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-primary/50 focus:bg-white/10 transition-all"
                    placeholder="1234"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-full font-bold text-lg bg-gradient-to-r from-primary to-blue-600 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] border border-white/20 relative overflow-hidden group"
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? 'Acessando...' : 'Entrar'}{' '}
                {!isLoading && <ArrowRight className="h-5 w-5" />}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-white/40">Teste: user / 1234</p>
          </div>
        </div>
      </div>
    </div>
  )
}
