import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { toast } from 'sonner'
import { ChevronRight, Check } from 'lucide-react'

export default function Onboarding() {
  const { updateUser } = useAppStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    height: '',
    age: '',
    phone: '',
    goal: 'Manter Peso',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (
      step === 1 &&
      (!formData.name || !formData.weight || !formData.height || !formData.age)
    ) {
      toast.error('Preencha todos os campos')
      return
    }
    if (step === 2 && !formData.phone) {
      toast.error('Telefone é obrigatório')
      return
    }
    setStep((prev) => prev + 1)
  }

  const handleFinish = async () => {
    try {
      await updateUser({
        name: formData.name,
        weight: Number(formData.weight),
        height: Number(formData.height),
        age: Number(formData.age),
        phone: formData.phone,
        goal: formData.goal as any,
      })
      toast.success('Perfil criado com sucesso!')
      navigate('/')
    } catch (e) {
      toast.error('Erro ao salvar perfil')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-200 to-blue-200 dark:from-[#0f172a] dark:to-[#1e293b]">
      <div className="w-full max-w-md aero-glass p-8 rounded-[32px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-metallic mb-2">
            Bem-vindo!
          </h1>
          <p className="text-muted-foreground text-sm">
            Vamos configurar seu perfil para começar.
          </p>
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-2">
            Seu corpo, seu combustível.
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="space-y-2">
              <Label>Nome de Exibição</Label>
              <Input
                className="aero-input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  className="aero-input"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  placeholder="70"
                />
              </div>
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input
                  type="number"
                  className="aero-input"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  placeholder="175"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Idade</Label>
              <Input
                type="number"
                className="aero-input"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="25"
              />
            </div>
            <Button className="w-full aero-button" onClick={handleNext}>
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                type="tel"
                className="aero-input"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label>Objetivo</Label>
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
            <Button className="w-full aero-button" onClick={handleFinish}>
              Concluir <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex justify-center gap-2 mt-4">
          <div
            className={`h-2 w-2 rounded-full transition-colors ${step === 1 ? 'bg-primary' : 'bg-gray-300'}`}
          />
          <div
            className={`h-2 w-2 rounded-full transition-colors ${step === 2 ? 'bg-primary' : 'bg-gray-300'}`}
          />
        </div>
      </div>
    </div>
  )
}
