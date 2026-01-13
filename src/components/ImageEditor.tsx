import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Check, X, RotateCcw } from 'lucide-react'
import { processImage } from '@/lib/utils'
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
      const blob = await processImage(file)
      setProcessedPreview(URL.createObjectURL(blob))
    } catch (error) {
      toast.error('Erro ao processar imagem.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (initialFile && processedPreview) {
      // Re-process one last time to ensure binary data is fresh or just use logic
      // For MVP, we trust the processImage utility.
      try {
        const blob = await processImage(initialFile)
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
