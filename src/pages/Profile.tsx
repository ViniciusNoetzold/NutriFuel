import { useAppStore } from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useState, useRef } from 'react'
import { User, LogOut, Camera, Loader2, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { ImageEditor } from '@/components/ImageEditor'

export default function Profile() {
  const { user, updateUser, logout } = useAppStore()
  const { user: authUser } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(user)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSave = () => {
    updateUser(formData)
    toast.success('Perfil atualizado com sucesso!')
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setEditorOpen(true)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true)
      if (!authUser) return

      const fileExt = 'jpg'
      const fileName = `${authUser.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true, contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName)

      updateUser({ avatar: publicUrl })
      setFormData((prev) => ({ ...prev, avatar: publicUrl }))
      toast.success('Foto atualizada!')
    } catch (error: any) {
      toast.error('Erro ao enviar foto: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8 pb-24 relative">
      <ImageEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialFile={selectedFile}
        onSave={handleAvatarUpload}
      />

      <div className="flex flex-col items-center justify-center space-y-4 pt-4">
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-300 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
          <Avatar
            className="h-32 w-32 border-4 border-white/50 shadow-2xl relative z-10"
            onClick={() => fileInputRef.current?.click()}
          >
            <AvatarImage src={formData.avatar} />
            <AvatarFallback>
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <User className="h-12 w-12" />
              )}
            </AvatarFallback>
          </Avatar>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <Button
            size="icon"
            className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg z-20 bg-white text-primary hover:bg-white/90 border border-black/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </Button>
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

      <div className="aero-glass p-6 space-y-8">
        {/* Read-Only Identity Section */}
        <div className="space-y-4 pb-4 border-b border-white/20">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Identidade <Lock className="h-4 w-4 text-muted-foreground" />
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Email da Conta</Label>
              <Input
                value={formData.email || ''}
                readOnly
                className="aero-input bg-gray-100/50 dark:bg-black/20 text-muted-foreground cursor-not-allowed opacity-70"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.phone || ''}
                readOnly
                className="aero-input bg-gray-100/50 dark:bg-black/20 text-muted-foreground cursor-not-allowed opacity-70"
                placeholder="Não cadastrado"
              />
            </div>
            <div className="space-y-2">
              <Label>Objetivo Pessoal</Label>
              <div className="aero-input bg-gray-100/50 dark:bg-black/20 text-muted-foreground flex items-center px-3 py-2 rounded-xl cursor-not-allowed opacity-70">
                {formData.goal}
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4 pb-4 border-b border-white/20">
          <h3 className="font-semibold text-lg">Configurações</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="hide-articles">Ocultar Artigos/Dicas</Label>
            <Switch
              id="hide-articles"
              checked={formData.hideArticles}
              onCheckedChange={(val) => handleChange('hideArticles', val)}
            />
          </div>
        </div>

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
