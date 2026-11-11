import React from 'react';
import { Check, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PricingTableProps {
  onSelectPlan: (planId: 'free' | 'pro' | 'agency') => void;
  onSelectPack: (packId: string) => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ onSelectPlan, onSelectPack }) => {
  const { user, isAuthenticated } = useAuth();
  const currentPlan = user?.plan || 'free';

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* Title & Subtitle */}
      <div className="max-w-2xl mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">Planos e créditos</h2>
        <p className="mt-3 text-slate-300">
          Comece com 150 créditos grátis. Quando precisar de mais, subscreva um plano mensal ou compre créditos avulsos. Pagamento em dólares (USD) por VISA ou PayPal.
        </p>
      </div>

      {/* 3 Main Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
        
        {/* Plan 1: Starter (Free) */}
        <div className="p-7 bg-[#1A1B1E] border border-white/10 rounded-lg flex flex-col justify-between hover:border-white/20 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Starter</span>
              {currentPlan === 'free' && isAuthenticated && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Plano Atual
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white font-mono">$0</span>
              <span className="text-xs text-slate-500">USD / grátis</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Para testar a plataforma e criar os seus primeiros websites profissionais sem qualquer custo.
            </p>

            <div className="my-6 pt-6 border-t border-white/5 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span><strong className="text-white">150 Créditos Grátis</strong> de oferta no registo</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Até <strong className="text-white">15 Websites Completos</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Motor Gemini 3.8 Flash de alta velocidade</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Visualização Desktop, Tablet e Mobile</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Exportação completa em ficheiro ZIP</span>
              </div>
            </div>
          </div>

          <button
            disabled={currentPlan === 'free' && isAuthenticated}
            onClick={() => onSelectPlan('free')}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer disabled:opacity-50"
          >
            {currentPlan === 'free' && isAuthenticated ? 'Plano Ativo' : 'Começar Gratuitamente'}
          </button>
        </div>

        {/* Plan 2: Pro Creator (Most Popular) */}
        <div className="p-7 bg-[#1A1B1E] border-2 border-brand-500 rounded-lg flex flex-col justify-between relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-brand-500 text-neutral-950 text-[10px] font-bold rounded">
            Mais Escolhido
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-300">Pro Creator</span>
              {currentPlan === 'pro' && (
                <span className="text-[10px] font-semibold text-brand-300 bg-brand-500/20 px-2 py-0.5 rounded-full">
                  Plano Ativo
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white font-mono">$19</span>
              <span className="text-xs text-slate-400">USD / mês</span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Para designers, freelancers e criadores digitais que precisam de gerar e iterar websites frequentemente.
            </p>

            <div className="my-6 pt-6 border-t border-white/10 space-y-3 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span><strong className="text-white">500 Créditos Mensais</strong> renovados automaticamente</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Geração de até <strong className="text-white">50 Websites por mês</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Refinamento e modificações contínuas por chat IA</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Processamento prioritário com zero tempo de espera</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Exportação ZIP com código limpo e sem marca de água</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Pagamento via <strong>Cartão VISA ou PayPal</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan('pro')}
            className="w-full py-3 px-4 text-xs font-bold rounded-md text-neutral-950 bg-brand-500 hover:opacity-95 transition-all cursor-pointer"
          >
            {currentPlan === 'pro' ? 'Gerir Subscrição Pro' : 'Subscrever Pro ($19 USD)'}
          </button>
        </div>

        {/* Plan 3: Agency Business */}
        <div className="p-7 bg-[#1A1B1E] border border-white/10 rounded-lg flex flex-col justify-between hover:border-white/20 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Agency Business</span>
              {currentPlan === 'agency' && (
                <span className="text-[10px] font-semibold text-brand-300 bg-brand-500/20 px-2 py-0.5 rounded-full">
                  Plano Ativo
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white font-mono">$49</span>
              <span className="text-xs text-slate-500">USD / mês</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Para empresas, agências digitais e estúdios que desenvolvem websites para múltiplos clientes.
            </p>

            <div className="my-6 pt-6 border-t border-white/5 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span><strong className="text-white">1500 Créditos Mensais</strong> (~150 websites)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Projetos ilimitados guardados na conta</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Lojas e-commerce, dashboards e landing pages avançadas</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Exportação com personalização total de marca</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Suporte técnico VIP prioritário 24/7</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Pagamento via <strong>Cartão VISA ou PayPal</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan('agency')}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
          >
            {currentPlan === 'agency' ? 'Gerir Subscrição Agency' : 'Subscrever Agency ($49 USD)'}
          </button>
        </div>

      </div>

      {/* Quick Credit Recharge Packs */}
      <div className="max-w-4xl mx-auto p-8 bg-[#1A1B1E] border border-white/10 rounded-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-400 font-semibold mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Não quer uma subscrição mensal?</span>
          </div>
          <h3 className="text-xl font-bold text-white">Recargas Rápidas de Créditos Avulsos</h3>
          <p className="text-xs text-slate-400 mt-1">
            Compre créditos sem compromisso. Os créditos nunca expiram e ficam imediatamente disponíveis na sua conta.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Pack 100 */}
          <div className="p-5 bg-white/[0.02] border border-white/10 rounded-lg flex flex-col justify-between text-center hover:border-brand-500/30 transition-all">
            <div>
              <span className="text-xs font-medium text-slate-400">Pacote Básico</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">+100 CR</div>
              <div className="text-lg font-bold text-brand-400 font-mono mt-2">$9.00 USD</div>
              <p className="text-[11px] text-slate-500 mt-1">Dá para ~10 sites completos</p>
            </div>
            <button
              onClick={() => onSelectPack('pack_100')}
              className="mt-4 py-2 px-3 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-md transition-colors cursor-pointer"
            >
              Comprar $9 USD
            </button>
          </div>

          {/* Pack 300 */}
          <div className="p-5 bg-brand-500/10 border border-brand-500/40 rounded-lg flex flex-col justify-between text-center relative shadow-lg">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-brand-600 text-neutral-950 px-2.5 py-0.5 rounded-full">
              Melhor Valor
            </span>
            <div>
              <span className="text-xs font-medium text-brand-300">Pacote Criador</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">+300 CR</div>
              <div className="text-lg font-bold text-brand-300 font-mono mt-2">$22.00 USD</div>
              <p className="text-[11px] text-slate-400 mt-1">Dá para ~30 sites completos</p>
            </div>
            <button
              onClick={() => onSelectPack('pack_300')}
              className="mt-4 py-2 px-3 text-xs font-bold text-neutral-950 bg-brand-600 hover:bg-brand-500 rounded-md transition-colors cursor-pointer"
            >
              Comprar $22 USD
            </button>
          </div>

          {/* Pack 1000 */}
          <div className="p-5 bg-white/[0.02] border border-white/10 rounded-lg flex flex-col justify-between text-center hover:border-brand-500/30 transition-all">
            <div>
              <span className="text-xs font-medium text-slate-400">Pacote Estúdio</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">+1000 CR</div>
              <div className="text-lg font-bold text-brand-400 font-mono mt-2">$59.00 USD</div>
              <p className="text-[11px] text-slate-500 mt-1">Dá para ~100 sites completos</p>
            </div>
            <button
              onClick={() => onSelectPack('pack_1000')}
              className="mt-4 py-2 px-3 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-md transition-colors cursor-pointer"
            >
              Comprar $59 USD
            </button>
          </div>

        </div>

        {/* Payment badges */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">Pagamento em Dólares ($ USD):</span>
            <span className="px-2 py-0.5 bg-white/10 text-white rounded font-mono font-bold text-[11px]">
              Cartão VISA
            </span>
            <span className="px-2 py-0.5 bg-[#003087]/80 text-white rounded font-bold text-[11px]">
              PayPal
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <Shield className="w-3.5 h-3.5" />
            <span>Processamento seguro instantâneo</span>
          </div>
        </div>

      </div>

    </div>
  );
};
