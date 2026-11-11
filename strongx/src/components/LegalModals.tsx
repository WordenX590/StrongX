import React, { useState, useEffect } from 'react';
import { Shield, FileText, Check } from 'lucide-react';

interface LegalModalsProps {
  showPrivacy: boolean;
  showTerms: boolean;
  onClosePrivacy: () => void;
  onCloseTerms: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({
  showPrivacy,
  showTerms,
  onClosePrivacy,
  onCloseTerms,
}) => {
  const [cookieConsent, setCookieConsent] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem('strongx_cookie_consent');
    if (!saved) setCookieConsent(false);
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('strongx_cookie_consent', 'accepted');
    setCookieConsent(true);
  };

  return (
    <>
      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
          <div className="w-full max-w-2xl max-h-[85vh] bg-[#1A1B1E] border border-white/10 rounded-lg flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141517]">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Shield className="w-4 h-4 text-brand-400" />
                <span>Política de Privacidade · StrongX</span>
              </div>
              <button onClick={onClosePrivacy} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-xs text-slate-300 space-y-4 leading-relaxed">
              <h4 className="text-sm font-semibold text-white">1. Compromisso com a Privacidade</h4>
              <p>
                A plataforma StrongX respeita escrupulosamente a privacidade e a segurança dos seus utilizadores. Todas as palavras-passe são protegidas por funções de hashing criptográfico unidirecional com salt no servidor, nunca sendo acessíveis em texto claro nem por membros da nossa equipa.
              </p>

              <h4 className="text-sm font-semibold text-white">2. Dados Demográficos Voluntários</h4>
              <p>
                As informações demográficas de faixa etária solicitadas durante o registo ou navegação têm natureza estritamente voluntária. O StrongX nunca tenta deduzir a idade ou identidade pessoal por via do endereço IP ou rastreios invasivos. Os relatórios analíticos são gerados de forma puramente agregada e anónima.
              </p>

              <h4 className="text-sm font-semibold text-white">3. Armazenamento e Segurança</h4>
              <p>
                Os seus projetos e código-fonte gerados são guardados de forma segura e apenas o titular da conta tem acesso a editá-los e exportá-los. Os segredos de backend e chaves de API da Inteligência Artificial nunca são expostos ao navegador.
              </p>

              <h4 className="text-sm font-semibold text-white">4. Direitos do Titular (RGPD)</h4>
              <p>
                Os utilizadores podem solicitar a qualquer momento a consulta, retificação ou eliminação integral dos seus dados e projetos através das ferramentas da plataforma.
              </p>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#141517] flex justify-end">
              <button
                onClick={onClosePrivacy}
                className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-brand-600 hover:bg-brand-500 rounded-md transition-colors cursor-pointer"
              >
                Compreendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
          <div className="w-full max-w-2xl max-h-[85vh] bg-[#1A1B1E] border border-white/10 rounded-lg flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141517]">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-brand-400" />
                <span>Termos de Utilização · StrongX</span>
              </div>
              <button onClick={onCloseTerms} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-xs text-slate-300 space-y-4 leading-relaxed">
              <h4 className="text-sm font-semibold text-white">1. Condições Gerais</h4>
              <p>
                Ao utilizar a plataforma StrongX, o utilizador concorda com as presentes regras de utilização. O serviço destina-se à criação profissional de websites assistida por Inteligência Artificial.
              </p>

              <h4 className="text-sm font-semibold text-white">2. Sistema de Créditos e Reembolsos</h4>
              <p>
                Cada utilizador recebe 150 créditos no momento do registo. Cada geração completa consome 10 créditos. Caso ocorra uma falha técnica imputável aos nossos servidores ou à API de inteligência artificial, o sistema reembolsa automaticamente os 10 créditos de forma transparente e imediata no registo de transações.
              </p>

              <h4 className="text-sm font-semibold text-white">3. Propriedade Intelectual do Código</h4>
              <p>
                Todo o código-fonte HTML, CSS e JavaScript gerado e exportado pelo utilizador pertence integralmente ao respetivo utilizador, sem qualquer tipo de licença de royalties associada. O utilizador é livre para alojar, vender ou modificar os websites criados.
              </p>

              <h4 className="text-sm font-semibold text-white">4. Uso Responsável</h4>
              <p>
                É estritamente proibida a criação de websites destinados a esquemas fraudulentos, propagação de malware, difamação ou conteúdos ilegais. Contas que violem estas regras serão suspensas administrativamente.
              </p>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#141517] flex justify-end">
              <button
                onClick={onCloseTerms}
                className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-brand-600 hover:bg-brand-500 rounded-md transition-colors cursor-pointer"
              >
                Aceitar Termos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {!cookieConsent && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 p-4 bg-[#1E1F23] border border-white/10 rounded-lg shadow-2xl flex flex-col gap-3">
          <div className="text-xs text-slate-300 leading-relaxed">
            Utilizamos cookies essenciais e análises anónimas e éticas para garantir o bom funcionamento e a segurança da plataforma StrongX.
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleAcceptCookies}
              className="px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer"
            >
              Aceitar Cookies
            </button>
          </div>
        </div>
      )}
    </>
  );
};
