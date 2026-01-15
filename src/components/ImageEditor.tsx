import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react'
import { toast } from 'sonner'
import { Slider } from '@/components/ui/slider'

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
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialFile) {
      const url = URL.createObjectURL(initialFile)
      setImageSrc(url)
      setScale(1)
      setPosition({ x: 0, y: 0 })
      return () => URL.revokeObjectURL(url)
    }
  }, [initialFile])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleConfirm = async () => {
    if (!imageRef.current || !initialFile) return
    setLoading(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No Context')

      // Set output size to 1080x1080
      canvas.width = 1080
      canvas.height = 1080

      const img = imageRef.current
      const container = containerRef.current

      if (!container) throw new Error('No Container')

      // Calculate the visible area of the image in the container
      // The container is a square viewing port.
      // We need to map the visible pixels of the image DOM element to the canvas.

      // Image Natural Dimensions
      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight

      // Rendered Dimensions (including scale)
      // The image is rendered with object-cover equivalent logic but via transform
      // Actually we are using `transform` on the image.

      // We need to calculate what part of natural image corresponds to the 1080x1080 canvas
      // The container represents the 1080x1080 crop area.

      // 1. Determine render scale factor relative to natural size
      // We display the image in a container of size S (e.g. 300px)
      // The image is scaled by `scale` and translated by `position`.

      const containerRect = container.getBoundingClientRect()
      const containerSize = containerRect.width // It's a square

      // Draw white background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 1080, 1080)

      // Calculate mapping
      // Canvas / Container ratio
      const ratio = 1080 / containerSize

      // The image is drawn at (position.x, position.y) with scale `scale` inside container
      // So on canvas it should be drawn at (position.x * ratio, position.y * ratio)
      // with size (renderedWidth * ratio, renderedHeight * ratio)

      // Determine initial rendered size (before zoom) inside container
      // "fit contain" logic usually, but here we just render the image tag.
      // Let's assume the image is rendered naturally or via CSS.
      // Better approach: Draw the image onto the canvas using the same transform logic.

      // Current render width/height of the image element (untransformed)
      const renderW = img.width
      const renderH = img.height

      // Transform origin is center usually, but here likely top-left based on implementation
      // Let's use the exact drawImage parameters

      ctx.save()
      // Move to center of canvas
      ctx.translate(1080 / 2, 1080 / 2)
      ctx.scale(scale, scale)
      ctx.translate(-1080 / 2, -1080 / 2)
      ctx.translate(position.x * ratio, position.y * ratio)

      // We need to know the base scale of image in container to match visual
      // If image is WxH and container is CxC.
      // If we style img with max-width: 100%, max-height: 100%, it scales.
      // We should force a specific size for control.
      // Let's say we render image "cover" style initially?
      // Simpler: Just render the image at natural size scaled to fit canvas width or height * zoom.

      // Let's rely on the ratio.
      // On screen: image is `renderW` wide.
      // On canvas: `renderW * ratio` wide.

      ctx.drawImage(
        img,
        0,
        0,
        naturalWidth,
        naturalHeight,
        0,
        0,
        renderW * ratio,
        renderH * ratio,
      )

      ctx.restore()

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newFile = new File([blob], initialFile.name, {
              type: 'image/jpeg',
            })
            onSave(newFile)
            onOpenChange(false)
          }
          setLoading(false)
        },
        'image/jpeg',
        0.9,
      )
    } catch (e) {
      toast.error('Erro ao processar imagem')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="aero-glass max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajustar Imagem</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Arraste e amplie para ajustar o corte.
          </p>

          <div
            className="relative w-64 h-64 md:w-80 md:h-80 overflow-hidden bg-black/10 rounded-xl cursor-move border-2 border-white/50 shadow-inner"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {imageSrc && (
              <div
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transformOrigin: 'center',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  draggable={false}
                  className="max-w-full max-h-full object-contain pointer-events-none select-none"
                />
              </div>
            )}
            {/* Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-white"></div>
              <div className="border-r border-white"></div>
              <div></div>
            </div>
          </div>

          <div className="w-full max-w-xs space-y-4">
            <div className="flex items-center gap-4">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[scale]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={(val) => setScale(val[0])}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex gap-2">
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
                <Check className="mr-2 h-4 w-4" />{' '}
                {loading ? 'Processando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
