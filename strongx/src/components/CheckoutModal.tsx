import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Check, Lock, AlertCircle, ShieldCheck, CreditCard, Wrench } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: {
    type: 'plan' | 'pack';
    id: string;
    title: string;
    priceUsd: number;
    credits: number;
    description: string;
  } | null;
  onSuccess: (newCredits: number, message: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'visa' | 'paypal'>('visa');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // VISA card fields
  const [cardNumber, setCardNumber] = useState<string>('4532 8920 1204 7831');
  const [cardHolder, setCardHolder] = useState<string>(
    user ? `${user.firstName} ${user.lastName}`.toUpperCase() : 'PEDRO SANTOS'
  );
  const [expiryDate, setExpiryDate] = useState<string>('12/28');
  const [cvv, setCvv] = useState<string>('842');

  // PayPal fields
  const [paypalEmail, setPaypalEmail] = useState<string>(user?.email || 'pedro.santos@exemplo.com');

  if (!isOpen || !selectedItem) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setExpiryDate(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const paymentDetails =
        paymentMethod === 'visa'
          ? {
              cardNumber,
              cardHolder,
              expiryDate,
              cvv,
            }
          : {
              paypalEmail,
              transactionId: `PAYPAL_${Date.now()}`,
            };

      const res = await api.checkoutPurchase({
        itemType: selectedItem.type,
        itemId: selectedItem.id,
        paymentMethod,
        paymentDetails,
      });

      await refreshUser();
      onSuccess(res.newCredits, res.message);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
      <div className="w-full max-w-lg bg-[#1A1B1E] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#141517] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Finalizar Pagamento Seguro</h3>
              <p className="text-[11px] text-slate-400">Transação encriptada em Dólares ($ USD)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="p-4 bg-[#202125] border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white">{selectedItem.title}</div>
            <div className="text-[11px] text-brand-400 font-mono">+{selectedItem.credits} Créditos Imediatos</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white font-mono tabular-nums">
              ${selectedItem.priceUsd}.00
              <span className="text-xs text-slate-400 ml-1 font-normal">USD</span>
            </div>
            <div className="text-[10px] text-emerald-400">Sem taxas ocultas</div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Selecione o Método de Pagamento</label>
            <div className="grid grid-cols-2 gap-3">
              
              {/* Option 1: Cartão VISA */}
              <button
                type="button"
                onClick={() => setPaymentMethod('visa')}
                className={`p-3 rounded-md border flex items-center justify-between transition-all cursor-pointer ${
                  paymentMethod === 'visa'
                    ? 'bg-brand-600/15 border-brand-500 text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-bold">Cartão VISA</span>
                </div>
                {paymentMethod === 'visa' && <Check className="w-4 h-4 text-brand-400" />}
              </button>

              {/* Option 2: PayPal */}
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-md border flex items-center justify-between transition-all cursor-pointer ${
                  paymentMethod === 'paypal'
                    ? 'bg-brand-600/15 border-brand-500 text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#003087] text-white flex items-center justify-center text-[10px] font-bold">
                    P
                  </div>
                  <span className="text-xs font-bold">PayPal</span>
                </div>
                {paymentMethod === 'paypal' && <Check className="w-4 h-4 text-brand-400" />}
              </button>

            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Form for VISA */}
            {paymentMethod === 'visa' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Número do Cartão VISA</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4000 1234 5678 9010"
                      className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-brand-400 font-mono tracking-widest">
                      VISA
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome no Cartão</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="NOME COMPLETO DO TITULAR"
                    className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Validade (MM/AA)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/AA"
                      className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">CVV (3 dígitos)</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form for PayPal */}
            {paymentMethod === 'paypal' && (
              <div className="p-4 bg-[#202125] border border-white/10 rounded-md space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#003087] flex items-center justify-center text-white font-bold text-lg">
                    P
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Pagamento Seguro via PayPal</h4>
                    <p className="text-[11px] text-slate-400">Pague em USD com saldo ou cartões associados</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">E-mail da Conta PayPal</label>
                  <input
                    type="email"
                    required
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="seu.email@paypal.com"
                    className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 text-xs sm:text-sm font-semibold text-neutral-950 bg-brand-500 rounded-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>A processar transação bancária...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-brand-200" />
                  <span>
                    Confirmar Pagamento de ${selectedItem.priceUsd}.00 USD ({paymentMethod === 'visa' ? 'VISA' : 'PayPal'})
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encriptação SSL 256-bit e proteção antifraude ativa</span>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
