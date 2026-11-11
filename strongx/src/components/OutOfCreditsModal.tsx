import React from 'react';
import { Wrench, AlertCircle, ArrowRight, Check, CreditCard, Zap } from 'lucide-react';

interface OutOfCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: 'pro' | 'agency') => void;
  onSelectPack: (packId: string) => void;
  currentCredits: number;
}

export const OutOfCreditsModal: React.FC<OutOfCreditsModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  onSelectPack,
  currentCredits,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6">
      <div className="w-full max-w-xl bg-[#1A1B1E] border border-brand-500/40 rounded-lg shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-brand-600/20 rounded-full pointer-events-none" />

        {/* Header */}
        <div className="p-6 sm:p-8 text-center border-b border-white/[0.08] relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Os seus créditos gratuitos terminaram!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
            Parabéns por utilizar os seus 150 créditos de boas-vindas do StrongX. Para continuar a criar websites profissionais sem interrupções, faça agora a atualização do seu plano.
          </p>

          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-slate-400">
            <span>Saldo Atual:</span>
            <span className="text-amber-400 font-bold tabular-nums">{currentCredits} CR</span>
            <span className="text-slate-500">· Necessita de 10 CR para novo site</span>
          </div>
        </div>

        {/* Recommended Upgrade Offer */}
        <div className="p-6 space-y-4">
          
          <div className="p-5 bg-[#1A1B1E] border border-brand-500/60 rounded-lg relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-300">Plano Recomendado</span>
                <span className="text-[10px] bg-brand-500/30 text-brand-200 px-2 py-0.5 rounded-full font-semibold">
                  Mais Popular
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white font-mono">$19</span>
                <span className="text-xs text-slate-400 font-normal"> / mês (USD)</span>
              </div>
            </div>

            <h3 className="text-base font-bold text-white">Pro Creator (+500 Créditos Mensais)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ideal para criadores e freelancers criarem até 50 novos websites por mês com IA.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand-400" /> 500 Créditos Mensais</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand-400" /> Refinamento Ilimitado</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand-400" /> Exportação ZIP Completa</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand-400" /> Pagamento VISA ou PayPal</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onSelectPlan('pro');
              }}
              className="w-full mt-4 py-2.5 px-4 text-xs font-bold text-neutral-950 bg-brand-500 rounded-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Subscrever Plano Pro ($19 USD via VISA ou PayPal)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Credit Packs */}
          <div>
            <div className="text-xs font-medium text-slate-400 mb-2">Ou compre apenas uma recarga rápida avulsa:</div>
            <div className="grid grid-cols-3 gap-2.5">
              
              <button
                onClick={() => {
                  onClose();
                  onSelectPack('pack_100');
                }}
                className="p-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-md text-center transition-all cursor-pointer"
              >
                <div className="text-sm font-bold text-white font-mono">+100 CR</div>
                <div className="text-[11px] text-brand-400 font-semibold font-mono mt-0.5">$9 USD</div>
                <div className="text-[10px] text-slate-500 mt-1">~10 Sites</div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSelectPack('pack_300');
                }}
                className="p-3 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/40 rounded-md text-center transition-all cursor-pointer relative"
              >
                <div className="text-sm font-bold text-white font-mono">+300 CR</div>
                <div className="text-[11px] text-brand-300 font-semibold font-mono mt-0.5">$22 USD</div>
                <div className="text-[10px] text-slate-400 mt-1">~30 Sites</div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSelectPack('pack_1000');
                }}
                className="p-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-md text-center transition-all cursor-pointer"
              >
                <div className="text-sm font-bold text-white font-mono">+1000 CR</div>
                <div className="text-[11px] text-brand-400 font-semibold font-mono mt-0.5">$59 USD</div>
                <div className="text-[10px] text-slate-500 mt-1">~100 Sites</div>
              </button>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141517] border-t border-white/[0.08] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CreditCard className="w-4 h-4 text-brand-400" />
            <span>Aceitamos VISA e PayPal com fatura imediata</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
