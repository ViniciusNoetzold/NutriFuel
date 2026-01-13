import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface ImageEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (file: File) => void
  initialFile: File | null
}

export function ImageEditor({
  open,
  onOpenChange,
  onSave,
  initialFile,
}: ImageEditorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [processedPreview, setProcessedPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialFile) {
      setImageSrc(URL.createObjectURL(initialFile))
      handleProcess(initialFile)
    }
  }, [initialFile])

  const handleProcess = async (file: File) => {
    try {
      setLoading(true)
      const blob = await processImageToSquare(file)
      setProcessedPreview(URL.createObjectURL(blob))
    } catch (error) {
      toast.error('Erro ao processar imagem.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (initialFile && processedPreview) {
      try {
        const blob = await processImageToSquare(initialFile)
        const newFile = new File([blob], initialFile.name, {
          type: 'image/jpeg',
        })
        onSave(newFile)
        onOpenChange(false)
      } catch (e) {
        toast.error('Erro ao salvar.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="aero-glass max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Imagem</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            A imagem será ajustada automaticamente para 1080x1080px (Quadrado).
          </p>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold">Original</span>
              {imageSrc && (
                <img
                  src={imageSrc}
                  className="w-full aspect-square object-contain bg-black/10 rounded-lg"
                />
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-primary">Preview</span>
              {loading ? (
                <div className="w-full aspect-square flex items-center justify-center bg-black/10 rounded-lg">
                  <span className="text-xs">Processando...</span>
                </div>
              ) : (
                processedPreview && (
                  <img
                    src={processedPreview}
                    className="w-full aspect-square object-cover border-2 border-primary rounded-lg shadow-md"
                  />
                )
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button
              className="flex-1 aero-button"
              onClick={handleConfirm}
              disabled={loading}
            >
              <Check className="mr-2 h-4 w-4" /> Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

async function processImageToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 1080, 1080)

      // Calculate cover logic
      const scale = Math.max(1080 / img.width, 1080 / img.height)
      const x = (1080 - img.width * scale) / 2
      const y = (1080 - img.height * scale) / 2

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas to Blob failed'))
        },
        'image/jpeg',
        0.9,
      )
    }
    img.onerror = reject
  })
}
