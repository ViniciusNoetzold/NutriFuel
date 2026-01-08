import { Link } from 'react-router-dom'
import { Clock, Flame, Plus, Heart } from 'lucide-react'
import { Recipe } from '@/lib/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

interface RecipeCardProps {
  recipe: Recipe
  onAdd?: () => void
}

export function RecipeCard({ recipe, onAdd }: RecipeCardProps) {
  const { toggleFavorite } = useAppStore()

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(recipe.id)
  }

  return (
    <Link to={`/recipes/${recipe.id}`} className="block group h-full">
      <Card className="aero-card h-full flex flex-col overflow-hidden border-0 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

        <div className="relative aspect-video overflow-hidden rounded-t-[20px] m-1 shadow-sm">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute bottom-2 left-2 flex gap-1 z-10">
            <Badge
              variant="secondary"
              className="bg-black/50 backdrop-blur-md text-white border-white/20 text-[10px] h-5 px-2 font-medium"
            >
              {recipe.difficulty}
            </Badge>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleFavorite}
            className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white"
          >
            <Heart
              className={cn(
                'h-4 w-4',
                recipe.isFavorite && 'fill-red-500 text-red-500',
              )}
            />
          </Button>

          {/* Glass glare on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 opacity-60" />
        </div>

        <CardContent className="p-4 flex-1 relative z-10">
          <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors text-shadow-sm">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1 bg-orange-50/50 dark:bg-orange-900/30 px-2 py-1 rounded-full border border-orange-100 dark:border-orange-800 shadow-sm">
              <Flame className="h-3 w-3 text-orange-500" />
              <span>{recipe.calories} kcal</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50/50 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800 shadow-sm">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>{recipe.prepTime} min</span>
            </div>
          </div>
        </CardContent>
        {onAdd && (
          <CardFooter className="p-4 pt-0 relative z-10">
            <Button
              onClick={(e) => {
                e.preventDefault()
                onAdd()
              }}
              className="w-full aero-button text-primary-foreground font-semibold hover:brightness-110 border-white/20"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}
