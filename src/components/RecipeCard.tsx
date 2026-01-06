import { Link } from 'react-router-dom'
import { Clock, Flame, Star, Plus } from 'lucide-react'
import { Recipe } from '@/lib/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RecipeCardProps {
  recipe: Recipe
  onAdd?: () => void
}

export function RecipeCard({ recipe, onAdd }: RecipeCardProps) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-white/90 text-orange-600 backdrop-blur-sm shadow-sm"
            >
              <Star className="h-3 w-3 fill-orange-500" />
              {recipe.rating}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2 flex gap-1">
            <Badge
              variant="secondary"
              className="bg-black/60 text-white backdrop-blur-md border-0 text-[10px] h-5 px-1.5"
            >
              {recipe.difficulty}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4 flex-1">
          <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span>{recipe.calories} kcal</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>{recipe.prepTime} min</span>
            </div>
          </div>
        </CardContent>
        {onAdd && (
          <CardFooter className="p-4 pt-0">
            <Button
              onClick={(e) => {
                e.preventDefault()
                onAdd()
              }}
              className="w-full bg-secondary hover:bg-secondary/90 text-white"
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
