import { Check, Dumbbell, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Plans() {
  const plans = [
    {
      name: 'Basic',
      price: 'Grátis',
      description: 'Para começar sua jornada',
      features: [
        'Registro de água',
        '3 receitas por dia',
        'Monitoramento de peso simples',
      ],
      icon: Dumbbell,
      color: 'bg-blue-500',
      popular: false,
    },
    {
      name: 'Pro Member',
      price: 'R$ 29,90/mês',
      description: 'A experiência completa',
      features: [
        'Tudo do Basic',
        'Receitas ilimitadas',
        'Gráficos avançados',
        'Sem anúncios',
      ],
      icon: Star,
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      popular: true,
    },
    {
      name: 'Trial',
      price: '7 Dias Grátis',
      description: 'Teste o poder do Pro',
      features: ['Acesso total por 7 dias', 'Cancele quando quiser'],
      icon: Zap,
      color: 'bg-purple-500',
      popular: false,
    },
  ]

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center space-y-2 py-4">
        <h2 className="text-3xl font-bold tracking-tight text-shadow-lg">
          Escolha seu Plano
        </h2>
        <p className="text-muted-foreground">
          Desbloqueie todo o potencial do seu corpo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`aero-card border-0 relative overflow-hidden transition-all duration-500 hover:scale-105 ${plan.popular ? 'ring-2 ring-primary shadow-xl' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-md z-10">
                POPULAR
              </div>
            )}

            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

            <CardHeader className="text-center pb-2 relative z-10">
              <div
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white shadow-lg ${plan.color}`}
              >
                <plan.icon className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="text-3xl font-extrabold text-primary mt-2 text-shadow-sm">
                {plan.price}
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 text-green-600">
                      <Check className="h-3 w-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-12 rounded-full font-bold shadow-md transition-transform active:scale-95 ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-white/50 hover:bg-white/70 text-foreground border border-white/40'}`}
              >
                Escolher {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
