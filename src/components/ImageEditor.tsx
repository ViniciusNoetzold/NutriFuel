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
import { cn } from '@/lib/utils'

interface ImageEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (file: File) => void
  initialFile: File | null
  mask?: 'circle' | 'rect'
  title?: string
}

export function ImageEditor({
  open,
  onOpenChange,
  onSave,
  initialFile,
  mask = 'rect',
  title = 'Ajustar Imagem',
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

      // Set output size to 1080x1080 for high quality
      canvas.width = 1080
      canvas.height = 1080

      const img = imageRef.current
      const container = containerRef.current
      if (!container) throw new Error('No Container')

      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight

      // Draw white background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 1080, 1080)

      // Calculate logic to replicate screen transform to canvas
      const containerRect = container.getBoundingClientRect()
      const containerSize = containerRect.width // Assuming square viewing area
      const ratio = 1080 / containerSize

      // Render dimensions on screen (before transform)
      // The image is rendered with object-contain usually, but we need natural aspect ratio
      const renderedAspect = naturalWidth / naturalHeight
      let renderW, renderH

      if (renderedAspect > 1) {
        renderW = containerSize // max width
        renderH = containerSize / renderedAspect
      } else {
        renderH = containerSize // max height
        renderW = containerSize * renderedAspect
      }

      // If image is actually scaled by object-contain, we need to know rendered size
      // We will rely on imageRef.current.width/height if it is not transformed yet?
      // No, `transform` is applied to parent div usually or the img itself.
      // In JSX below: transform applied to div wrapping img. Img is `max-w-full max-h-full object-contain`.
      // So img dimensions are bounded by containerSize.

      const domImgW = img.width
      const domImgH = img.height

      ctx.save()

      // Apply Circular Clip if needed
      if (mask === 'circle') {
        ctx.beginPath()
        ctx.arc(1080 / 2, 1080 / 2, 1080 / 2, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.clip()
      }

      // Translate to center of canvas
      ctx.translate(1080 / 2, 1080 / 2)
      ctx.scale(scale, scale)
      ctx.translate(-1080 / 2, -1080 / 2)

      // Apply translation from drag
      ctx.translate(position.x * ratio, position.y * ratio)

      // We need to draw the image centered relative to the canvas center (which corresponds to container center)
      // The domImg is centered in the container by flexbox.

      ctx.drawImage(
        img,
        (1080 - domImgW * ratio) / 2,
        (1080 - domImgH * ratio) / 2,
        domImgW * ratio,
        domImgH * ratio,
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
      console.error(e)
      toast.error('Erro ao processar imagem')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="aero-glass max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Arraste e amplie para ajustar o corte.
          </p>

          <div
            className={cn(
              'relative w-64 h-64 md:w-80 md:h-80 overflow-hidden bg-black/10 cursor-move border-2 border-white/50 shadow-inner',
              mask === 'circle' ? 'rounded-full' : 'rounded-xl',
            )}
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => {
              setIsDragging(true)
              const touch = e.touches[0]
              setDragStart({
                x: touch.clientX - position.x,
                y: touch.clientY - position.y,
              })
            }}
            onTouchMove={(e) => {
              if (isDragging) {
                const touch = e.touches[0]
                setPosition({
                  x: touch.clientX - dragStart.x,
                  y: touch.clientY - dragStart.y,
                })
              }
            }}
            onTouchEnd={() => setIsDragging(false)}
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
                  pointerEvents: 'none',
                }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  className="max-w-full max-h-full object-contain pointer-events-none select-none"
                />
              </div>
            )}

            {/* Grid Overlay for Rect only */}
            {mask === 'rect' && (
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
            )}
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
