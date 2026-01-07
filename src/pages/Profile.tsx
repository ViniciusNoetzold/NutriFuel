import { useAppStore } from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useState } from 'react'
import { User } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAppStore()
  const [formData, setFormData] = useState(user)

  const handleSave = () => {
    updateUser(formData)
    toast.success('Perfil atualizado com sucesso!')
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
            <AvatarImage src={formData.avatar} />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-sm"
          >
            <span className="text-xs">Edit</span>
          </Button>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{formData.name}</h2>
          <p className="text-sm text-muted-foreground">
            {formData.activityLevel}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Dados Pessoais</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
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
                <SelectTrigger>
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
                value={formData.weight}
                onChange={(e) => handleChange('weight', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
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
              <SelectTrigger>
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

        <Separator />

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Objetivos</h3>
          <div className="space-y-2">
            <Label>Meta Principal</Label>
            <Select
              value={formData.goal}
              onValueChange={(val) => handleChange('goal', val)}
            >
              <SelectTrigger>
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
                value={formData.waterGoal}
                onChange={(e) =>
                  handleChange('waterGoal', Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Restrições e Preferências</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif" className="text-base font-normal">
              Notificações de Água
            </Label>
            <Switch id="notif" defaultChecked />
          </div>
          <div className="space-y-2 pt-2">
            <Label className="text-base font-normal mb-2 block">
              Restrições Alimentares
            </Label>
            <div className="flex flex-wrap gap-2">
              {['Sem Glúten', 'Sem Lactose', 'Vegetariano', 'Vegan'].map(
                (restriction) => (
                  <div
                    key={restriction}
                    className="flex items-center gap-2 border p-2 rounded-md bg-card"
                  >
                    <Switch
                      id={`r-${restriction}`}
                      checked={formData.dietaryRestrictions.includes(
                        restriction,
                      )}
                      onCheckedChange={(checked) => {
                        const newRestrictions = checked
                          ? [...formData.dietaryRestrictions, restriction]
                          : formData.dietaryRestrictions.filter(
                              (r) => r !== restriction,
                            )
                        handleChange('dietaryRestrictions', newRestrictions)
                      }}
                    />
                    <Label
                      htmlFor={`r-${restriction}`}
                      className="cursor-pointer"
                    >
                      {restriction}
                    </Label>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <Button className="w-full text-lg h-12" onClick={handleSave}>
          Salvar Alterações
        </Button>
      </div>
    </div>
  )
}
