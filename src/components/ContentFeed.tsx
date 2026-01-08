import { MOCK_ARTICLES } from '@/lib/data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

export function ContentFeed() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-xl text-shadow text-foreground px-2">
        Dicas & Artigos
      </h3>
      <div className="space-y-4">
        {MOCK_ARTICLES.map((article) => (
          <Card
            key={article.id}
            className="aero-card border-0 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex h-32">
              <div className="w-32 relative overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <CardContent className="flex-1 p-4 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/50"
                  >
                    {article.category}
                  </Badge>
                  <div className="flex items-center text-[10px] text-muted-foreground font-medium">
                    <Clock className="h-3 w-3 mr-1" />
                    {article.readTime}
                  </div>
                </div>
                <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {article.excerpt}
                </p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
