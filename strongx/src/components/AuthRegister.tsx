import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Check, X, Shield, Wrench, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';

interface AuthRegisterProps {
  onSuccessCreator: () => void;
  onSuccessAdmin: () => void;
  onNavigateLogin: () => void;
}

export const AuthRegister: React.FC<AuthRegisterProps> = ({
  onSuccessCreator,
  onSuccessAdmin,
  onNavigateLogin,
}) => {
  const { register, adminLogin } = useAuth();

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ageDemographic, setAgeDemographic] = useState<'minor' | 'youth' | 'adult'>('adult');

  // UI States
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Email verification step
  const [step, setStep] = useState<'form' | 'verify_email' | 'role_select' | 'admin_credentials'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('784291');

  // Admin validation form in Step 3 (Role Select -> Admin)
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  // Password Security Calculations
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const passwordStrengthScore = [hasMinLength, hasNumber, hasSpecial, password.length >= 10].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Introduza um formato de e-mail válido.');
      return;
    }

    if (!hasMinLength) {
      setError('A palavra-passe deve conter pelo menos 8 caracteres.');
      return;
    }

    if (!passwordsMatch) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    try {
      setLoading(true);
      // Register account on server
      await register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        ageDemographic,
      });

      // Proceed to email verification code step
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedCode(randomCode);
      setStep('verify_email');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim() !== simulatedCode && verificationCode.trim() !== '123456') {
      setError('Código de verificação incorreto. Tente novamente ou use o código fornecido.');
      return;
    }
    setError(null);
    setStep('role_select');
  };

  const handleSelectCreator = () => {
    onSuccessCreator();
  };

  const handleSelectAdminOption = () => {
    setStep('admin_credentials');
  };

  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setLoading(true);

    try {
      // Calls strict server-side admin check
      await adminLogin(email, adminKeyInput);
      onSuccessAdmin();
    } catch (err: any) {
      setAdminAuthError(err.message || 'Chave administrativa incorreta ou e-mail sem autorização.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#18191C] border border-white/10 rounded-lg p-7 sm:p-9 relative">
        
        {/* Step 1: Registration Form */}
        {step === 'form' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-3">
                <Wrench className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Criar Conta no StrongX</h2>
              <p className="text-xs text-slate-400 mt-1">
                Comece hoje com <span className="text-brand-400 font-semibold">150 créditos gratuitos</span> para criar sites com IA.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-md bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Primeiro Nome</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ex: Pedro"
                      className="w-full bg-[#222327] border border-white/10 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Último Nome</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: Santos"
                    className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Endereço de E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-[#222327] border border-white/10 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Criar Palavra-passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Pelo menos 8 caracteres"
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

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 ${passwordStrengthScore >= 1 ? 'bg-red-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${passwordStrengthScore >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${passwordStrengthScore >= 3 ? 'bg-brand-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${passwordStrengthScore >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className={hasMinLength ? 'text-emerald-400' : 'text-slate-500'}>8+ caracteres</span>
                      <span className={hasNumber ? 'text-emerald-400' : 'text-slate-500'}>Número</span>
                      <span className={hasSpecial ? 'text-emerald-400' : 'text-slate-500'}>Símbolo</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirmar Palavra-passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a palavra-passe"
                    className="w-full bg-[#222327] border border-white/10 rounded-md pl-9 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <span className="text-[10px] text-red-400 mt-1 block">As palavras-passe não coincidem.</span>
                )}
              </div>

              {/* Voluntary Demographic Age Information (respecting privacy) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Faixa Etária (informação voluntária para estatísticas da plataforma)
                </label>
                <select
                  value={ageDemographic}
                  onChange={(e: any) => setAgeDemographic(e.target.value)}
                  className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
                >
                  <option value="adult">Adulto (25+ anos)</option>
                  <option value="youth">Jovem (18 - 24 anos)</option>
                  <option value="minor">Menor de idade (menos de 18 anos)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 text-xs font-semibold text-neutral-950 bg-brand-500 rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>A processar registo...</span>
                ) : (
                  <>
                    <span>Criar Conta e Receber 150 Créditos</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-slate-400">
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-brand-400 hover:text-brand-300 font-medium transition-colors cursor-pointer"
              >
                Iniciar Sessão
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Email Verification Simulation */}
        {step === 'verify_email' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Verificação de E-mail</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Enviámos um código de segurança para <span className="text-white font-medium">{email}</span> para validar a autenticidade da conta.
            </p>

            <div className="my-5 p-3 bg-brand-500/10 border border-brand-500/20 rounded-md text-xs text-brand-300">
              Código de teste: <span className="font-mono font-bold text-sm tracking-widest">{simulatedCode}</span>
            </div>

            {error && (
              <div className="mb-4 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Introduza o código de 6 dígitos"
                className="w-full bg-[#222327] border border-white/10 rounded-md px-4 py-3 text-center text-lg font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />

              <button
                type="submit"
                className="w-full py-3 px-4 text-xs font-semibold text-neutral-950 bg-brand-500 rounded-md hover:opacity-90 transition-all cursor-pointer"
              >
                Confirmar E-mail
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Mandatory Profile Selection Post-Registration */}
        {step === 'role_select' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-3">
              <Wrench className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Registo Concluído!</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              A sua conta foi validada com sucesso e 150 créditos foram creditados. Selecione o ambiente pretendido:
            </p>

            <div className="space-y-3.5 text-left">
              
              {/* Option 2: Criador (Recommended) */}
              <button
                type="button"
                onClick={handleSelectCreator}
                className="w-full p-4.5 rounded-md border border-brand-500/40 bg-brand-500/10 hover:bg-brand-500/20 transition-all group flex items-start gap-3.5 cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-neutral-950 shrink-0 mt-0.5">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Conta de criador</span>
                    <span className="text-[10px] bg-brand-500/30 text-brand-200 px-2 py-0.5 rounded-full font-medium">Recomendado</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Aceda ao estúdio de criação de sites com Inteligência Artificial e ao seu painel pessoal de projetos com os 150 créditos.
                  </p>
                </div>
              </button>

              {/* Option 1: Administrador */}
              <button
                type="button"
                onClick={handleSelectAdminOption}
                className="w-full p-4.5 rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all group flex items-start gap-3.5 cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Conta de administrador</div>
                  <p className="text-xs text-slate-400 mt-1">
                    Acesso exclusivo ao painel administrativo. Requer validação estrita no servidor do e-mail autorizado e chave de acesso privada.
                  </p>
                </div>
              </button>

            </div>
          </div>
        )}

        {/* Step 4: Admin Credential Verification (Server Validation) */}
        {step === 'admin_credentials' && (
          <div>
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Validação Administrativa</h2>
              <p className="text-xs text-slate-400 mt-1">
                Introduza a chave de acesso privada do proprietário para o e-mail autorizado.
              </p>
            </div>

            {adminAuthError && (
              <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{adminAuthError}</span>
              </div>
            )}

            <form onSubmit={handleAdminVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">E-mail Administrativo</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-xs text-slate-400 opacity-80"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Apenas o e-mail do proprietário (flatthedragon@gmail.com) tem permissão de acesso.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Chave de Acesso Administrativa</label>
                <input
                  type="password"
                  required
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  placeholder="Introduza a chave privada do proprietário"
                  className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('role_select')}
                  className="w-1/3 py-2.5 text-xs text-slate-300 bg-white/5 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors cursor-pointer"
                >
                  {loading ? 'A validar...' : 'Validar no Servidor'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
