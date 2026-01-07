import { Check, Star, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Plans() {
  const plans = [
    {
      name: 'Basic',
      price: 'R$ 0,00',
      description: 'Grátis para começar',
      features: [
        'Registro de água',
        'Receitas básicas',
        'Monitoramento simples',
      ],
      icon: Zap,
      color: 'bg-gray-400',
      popular: false,
    },
    {
      name: 'Pro Member',
      price: 'R$ 35,00',
      period: '/mês',
      description: 'Evolução consistente',
      features: [
        'Tudo do Basic',
        'Receitas ilimitadas',
        'Gráficos avançados',
        'Sem anúncios',
      ],
      icon: Star,
      color: 'bg-gradient-to-br from-blue-400 to-cyan-500',
      popular: false,
    },
    {
      name: 'Master',
      price: 'R$ 30,00',
      period: '/mês (Anual)',
      description: 'Comprometimento total',
      features: [
        'Acesso VIP total',
        'Prioridade no suporte',
        'Consultoria mensal',
        'Economia de 14%',
      ],
      icon: Crown,
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      popular: true, // Master is now the best/most popular
      badge: 'Melhor Desconto',
      savings: 'Economize R$ 60/ano',
    },
  ]

  return (
    <div className="space-y-8 pb-24 px-1">
      <div className="text-center space-y-2 py-4">
        <h2 className="text-3xl font-bold tracking-tight text-shadow-lg">
          Níveis de Acesso
        </h2>
        <p className="text-muted-foreground">
          Escolha o melhor plano para sua evolução.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`aero-card border-0 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
              plan.popular
                ? 'ring-2 ring-primary shadow-[0_0_40px_rgba(var(--primary),0.4)] scale-105 z-10'
                : 'opacity-90 hover:opacity-100'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary to-cyan-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl shadow-md z-10 border-b border-l border-white/20">
                {plan.badge || 'POPULAR'}
              </div>
            )}

            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            <CardHeader className="text-center pb-2 relative z-10 pt-8">
              <div
                className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg border border-white/30 ${plan.color}`}
              >
                <plan.icon className="h-8 w-8 drop-shadow-md" />
              </div>
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="flex flex-col items-center justify-center gap-1 mt-2 text-shadow-sm">
                <span className="text-3xl font-extrabold text-foreground">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                )}
                {plan.savings && (
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1">
                    {plan.savings}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium mt-2">
                {plan.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              <ul className="space-y-3 bg-white/20 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400">
                      <Check className="h-3 w-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-12 rounded-full font-bold shadow-lg transition-transform active:scale-95 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-cyan-600 hover:brightness-110 text-white border-white/20'
                    : 'aero-button hover:bg-white/40'
                }`}
              >
                Selecionar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
