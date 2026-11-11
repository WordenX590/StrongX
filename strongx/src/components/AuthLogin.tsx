import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, Shield, Wrench, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { api } from '../services/api';

interface AuthLoginProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
}

export const AuthLogin: React.FC<AuthLoginProps> = ({ onSuccess, onNavigateRegister }) => {
  const { login, adminLogin } = useAuth();

  // Mode: regular user login vs exclusive admin access
  const [mode, setMode] = useState<'creator' | 'admin'>('creator');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoverySent, setRecoverySent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'creator') {
        if (!email.trim() || !password) {
          throw new Error('E-mail e palavra-passe são obrigatórios.');
        }
        await login(email.trim(), password);
      } else {
        if (!email.trim() || !adminKey.trim()) {
          throw new Error('E-mail administrativo e chave de acesso são obrigatórios.');
        }
        await adminLogin(email.trim(), adminKey.trim());
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao efetuar início de sessão.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      await api.recoverPassword(forgotEmail);
      setRecoverySent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#18191C] border border-white/10 rounded-lg p-7 sm:p-9 relative">
        
        {/* Toggle between Creator and Admin Login */}
        <div className="flex items-center p-1 bg-[#202125] border border-white/5 rounded-md mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('creator');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'creator'
                ? 'bg-brand-600 text-neutral-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Criador / Utilizador</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setError(null);
              if (!email) setEmail('flatthedragon@gmail.com');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'admin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>Administrador</span>
          </button>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'creator' ? 'Iniciar Sessão' : 'Autenticação Administrativa'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'creator'
              ? 'Aceda aos seus projetos e créditos de criação de sites'
              : 'Acesso restrito ao proprietário da plataforma StrongX'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {mode === 'creator' ? 'Endereço de E-mail' : 'E-mail Administrativo'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'creator' ? 'seu.email@exemplo.com' : 'flatthedragon@gmail.com'}
                className="w-full bg-[#222327] border border-white/10 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Password (for Creator) or Admin Key (for Admin) */}
          {mode === 'creator' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Palavra-passe</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
                >
                  Esqueceu-se da palavra-passe?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduza a sua palavra-passe"
                  className="w-full bg-[#222327] border border-white/10 rounded-md pl-9 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Chave de Acesso Administrativa
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Introduza a chave de acesso privada do servidor"
                  className="w-full bg-[#222327] border border-white/10 rounded-md pl-9 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Validação estrita no backend. Chave protegida em ambiente seguro.
              </span>
            </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-[#222327] border-white/10 text-brand-600 focus:ring-0"
            />
            <label htmlFor="remember" className="text-xs text-slate-400 select-none cursor-pointer">
              Manter sessão iniciada neste dispositivo
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 text-xs font-semibold text-white rounded-md shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              mode === 'creator'
                ? 'bg-brand-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {loading ? (
              <span>A validar credenciais...</span>
            ) : (
              <>
                <span>{mode === 'creator' ? 'Entrar na Plataforma' : 'Aceder ao Painel Administrativo'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-slate-400">
          Ainda não tem conta no StrongX?{' '}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors cursor-pointer"
          >
            Criar Conta (150 Créditos Grátis)
          </button>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm bg-[#1E1F23] border border-white/10 rounded-lg p-6 text-center shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Recuperar Palavra-passe</h3>
            <p className="text-xs text-slate-400 mb-4">
              Introduza o seu e-mail para receber um link de reposição de credenciais.
            </p>

            {recoverySent ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-xs text-emerald-300 mb-4">
                Se a conta existir, enviámos instruções seguras para {forgotEmail}.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-neutral-950 bg-brand-600 hover:bg-brand-500 rounded-md transition-colors cursor-pointer"
                >
                  Enviar Instruções
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setShowForgotModal(false);
                setRecoverySent(false);
              }}
              className="mt-3 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
