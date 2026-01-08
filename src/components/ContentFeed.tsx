import { MOCK_ARTICLES } from '@/lib/data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, BookOpen, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ContentFeed() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-xl text-shadow text-foreground px-2">
        Dicas & Artigos
      </h3>
      <div className="space-y-4">
        {MOCK_ARTICLES.map((article) => (
          <Dialog key={article.id}>
            <DialogTrigger asChild>
              <Card className="aero-card border-0 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
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
            </DialogTrigger>
            <DialogContent className="aero-glass p-0 overflow-hidden max-w-2xl border-white/20">
              <div className="relative h-64 w-full">
                <img
                  src={article.image}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <DialogClose asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </DialogClose>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <Badge className="mb-2 bg-primary/80 backdrop-blur-md border border-white/20 text-white">
                    {article.category}
                  </Badge>
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold leading-tight text-shadow-lg text-left">
                      {article.title}
                    </DialogTitle>
                  </DialogHeader>
                </div>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>Leitura de {article.readTime}</span>
                  <span className="mx-2">•</span>
                  <BookOpen className="h-4 w-4" />
                  <span>Artigo Completo</span>
                </div>
                <p className="leading-relaxed text-foreground/90 text-lg">
                  {article.excerpt}
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  {/* Mock content since we don't have full text in type */}
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
