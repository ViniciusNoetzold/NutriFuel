import { useAppStore } from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useState } from 'react'
import { User, Sun, Moon, Camera, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, updateUser, logout } = useAppStore()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(user)
  const { setTheme, theme } = useTheme()
  const [avatarUrl, setAvatarUrl] = useState(user.avatar)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)

  const handleSave = () => {
    updateUser(formData)
    toast.success('Perfil atualizado com sucesso!')
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = () => {
    handleChange('avatar', avatarUrl)
    setIsAvatarDialogOpen(false)
    toast.success('Foto atualizada!')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col items-center justify-center space-y-4 pt-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-300 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
          <Avatar className="h-32 w-32 border-4 border-white/50 shadow-2xl relative z-10">
            <AvatarImage src={formData.avatar} />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <Dialog
            open={isAvatarDialogOpen}
            onOpenChange={setIsAvatarDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg z-20 bg-white text-primary hover:bg-white/90"
              >
                <Camera className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="aero-glass">
              <DialogHeader>
                <DialogTitle>Alterar Foto de Perfil</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Label>URL da Imagem</Label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="aero-input"
                  placeholder="https://..."
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setAvatarUrl(
                        `https://img.usecurling.com/ppl/medium?gender=${formData.gender}&seed=${Math.random()}`,
                      )
                    }
                  >
                    Gerar Aleatória
                  </Button>
                </div>
                <Button
                  onClick={handleAvatarChange}
                  className="w-full aero-button"
                >
                  Salvar Foto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-shadow">{formData.name}</h2>
          <Badge
            variant="secondary"
            className="mt-2 bg-white/30 backdrop-blur-md"
          >
            {formData.activityLevel}
          </Badge>
        </div>
      </div>

      <div className="aero-glass p-6 space-y-6">
        {/* Theme Switcher - Physical 3D Look */}
        <div className="flex items-center justify-between bg-white/20 p-4 rounded-2xl border border-white/20 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full text-white shadow-md">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </div>
            <span className="font-semibold text-lg">Tema do Ambiente</span>
          </div>

          <div
            className="relative w-20 h-10 bg-gray-300 dark:bg-gray-700 rounded-full shadow-inner cursor-pointer p-1 transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-b from-white to-gray-200 shadow-md transform transition-transform duration-300 ease-spring ${theme === 'dark' ? 'translate-x-10' : 'translate-x-0'}`}
            >
              <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full opacity-50" />
            </div>
          </div>
        </div>

        <Separator className="bg-white/20" />

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Dados Pessoais</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                className="aero-input"
                value={formData.age}
                onChange={(e) => handleChange('age', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gênero</Label>
              <Select
                value={formData.gender}
                onValueChange={(val) => handleChange('gender', val)}
              >
                <SelectTrigger className="aero-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                className="aero-input"
                value={formData.weight}
                onChange={(e) => handleChange('weight', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                className="aero-input"
                value={formData.height}
                onChange={(e) => handleChange('height', Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nível de Atividade</Label>
            <Select
              value={formData.activityLevel}
              onValueChange={(val) => handleChange('activityLevel', val)}
            >
              <SelectTrigger className="aero-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sedentário">Sedentário</SelectItem>
                <SelectItem value="Leve">Leve</SelectItem>
                <SelectItem value="Moderado">Moderado</SelectItem>
                <SelectItem value="Intenso">Intenso</SelectItem>
                <SelectItem value="Atleta">Atleta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-white/20" />

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Objetivos</h3>
          <div className="space-y-2">
            <Label>Meta Principal</Label>
            <Select
              value={formData.goal}
              onValueChange={(val) => handleChange('goal', val)}
            >
              <SelectTrigger className="aero-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Emagrecer">Emagrecer</SelectItem>
                <SelectItem value="Manter Peso">Manter Peso</SelectItem>
                <SelectItem value="Ganhar Massa">Ganhar Massa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meta Calórica</Label>
              <Input
                type="number"
                className="aero-input"
                value={formData.calorieGoal}
                onChange={(e) =>
                  handleChange('calorieGoal', Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Meta Água (ml)</Label>
              <Input
                type="number"
                className="aero-input"
                value={formData.waterGoal}
                onChange={(e) =>
                  handleChange('waterGoal', Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>

        <Button
          className="w-full text-lg h-14 aero-button mt-4 font-bold"
          onClick={handleSave}
        >
          Salvar Alterações
        </Button>

        <Button
          variant="ghost"
          className="w-full text-red-500 hover:bg-red-100/20 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>
    </div>
  )
}
