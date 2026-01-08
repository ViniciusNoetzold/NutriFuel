import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InteractiveDumbbell } from '@/components/InteractiveDumbbell'
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-sky-200 to-blue-200 dark:from-[#0f172a] dark:to-[#1e293b]">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-texture-overlay mix-blend-overlay z-0" />

      {/* Center Light */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 dark:via-cyan-900/10 pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        <div className="aero-glass p-8 rounded-[32px] shadow-2xl space-y-8 relative overflow-hidden border border-white/60 dark:border-white/10">
          {/* Top sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="flex flex-col items-center space-y-4">
            <InteractiveDumbbell />
            <div className="text-center relative">
              <h1 className="text-4xl font-extrabold mt-2 tracking-tight text-metallic">
                NutriFuel
              </h1>
              <p className="text-primary font-bold dark:text-cyan-400 text-sm max-w-[200px] mx-auto mt-1 drop-shadow-sm opacity-90">
                Energy for Life.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="ml-1 text-foreground font-extrabold"
                >
                  Usuário
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 h-14 aero-input rounded-2xl transition-all border-white/70 bg-white/70 dark:bg-black/30 text-lg font-medium placeholder:text-muted-foreground/60"
                    placeholder="user"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="ml-1 text-foreground font-extrabold"
                >
                  Senha
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 aero-input rounded-2xl transition-all border-white/70 bg-white/70 dark:bg-black/30 text-lg font-medium placeholder:text-muted-foreground/60"
                    placeholder="1234"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-full font-bold text-lg bg-gradient-to-r from-primary to-cyan-700 dark:to-cyan-600 hover:brightness-110 text-white shadow-[0_4px_14px_rgba(var(--primary),0.4)] border border-white/20 relative overflow-hidden group"
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                {isLoading ? 'Acessando...' : 'Entrar'}{' '}
                {!isLoading && <ArrowRight className="h-5 w-5" />}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground font-semibold">
              Teste: user / 1234
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
