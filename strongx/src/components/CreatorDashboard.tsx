import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Project, Transaction, ActivityLog } from '../types';
import { api } from '../services/api';
import {
  Wrench,
  Plus,
  Code,
  Eye,
  Trash2,
  Download,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  RefreshCw,
  Layers,
  Zap,
  AlertCircle,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import JSZip from 'jszip';
import { PricingTable } from './PricingTable';

interface CreatorDashboardProps {
  onOpenStudio: (project?: Project) => void;
  onNavigateHome: () => void;
  onSelectPlan: (planId: 'free' | 'pro' | 'agency') => void;
  onSelectPack: (packId: string) => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  onOpenStudio,
  onNavigateHome,
  onSelectPlan,
  onSelectPack,
}) => {
  const { user, refreshUser } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'history' | 'pricing' | 'settings'>('projects');
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, histRes] = await Promise.all([
        api.getProjects(),
        api.getCreditHistory(),
      ]);
      setProjects(projRes.projects);
      setTransactions(histRes.transactions);
      setActivities(histRes.activities);
      await refreshUser();
    } catch (err) {
      console.error('Failed loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Tem a certeza que deseja eliminar o projeto "${name}"?`)) return;
    try {
      await api.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar projeto.');
    }
  };

  const handleExportZip = async (project: Project) => {
    const zip = new JSZip();
    zip.file('index.html', project.sourceCode.fullCode || project.sourceCode.html);
    zip.file('style.css', project.sourceCode.css || '/* StrongX Generated Styles */');
    zip.file('script.js', project.sourceCode.js || '// StrongX Interactive Scripts');
    zip.file(
      'README.md',
      `# ${project.name}\n\n${project.description}\n\nGerado com a plataforma StrongX com Inteligência Artificial.\nPronto para publicação em qualquer servidor web ou CDN.`
    );

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_strongx.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const usedCredits = transactions
    .filter(t => t.type === 'deduction')
    .reduce((acc, t) => acc + Math.abs(t.credits), 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-[85vh]">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-400 font-medium mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>Painel do Criador StrongX</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Bem-vindo, {user?.firstName || 'Criador'}!
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gira os seus websites criados por IA, consulte transações de créditos e lance novos projetos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-md transition-colors cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
          </button>
          <button
            onClick={() => onOpenStudio()}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-950 bg-brand-500 rounded-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Site (10 CR)</span>
          </button>
        </div>
      </div>

      {/* Alert when Free Credits End */}
      {(user?.credits ?? 0) < 10 && (
        <div className="my-6 p-4.5 bg-[#1A1B1E] border border-white/10 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Os seus créditos gratuitos terminaram ({user?.credits ?? 0} CR disponíveis)
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Para continuar a criar novos sites profissionais e refinar páginas existentes com IA, faça a atualização do seu plano ou adquira uma recarga em Dólares ($ USD) via VISA ou PayPal.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('pricing')}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <span>Fazer Upgrade de Plano</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        
        {/* Credits Balance */}
        <div className="p-5 bg-[#1A1B1E] border border-brand-500/30 rounded-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Saldo de Créditos</div>
            <div className="text-3xl font-bold text-brand-400 font-mono tabular-nums mt-2">
              {user?.credits ?? 0}
              <span className="text-xs text-slate-500 ml-1.5 font-normal">CR</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Dá para {Math.floor((user?.credits || 0) / 10)} sites completos</span>
              <span className="text-brand-400 font-medium">10 CR / site</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('pricing')}
            className="mt-4 w-full py-1.5 text-[11px] font-semibold text-brand-300 hover:text-white bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-3 h-3 text-brand-400" />
            <span>Fazer Upgrade / Recarregar</span>
          </button>
        </div>

        {/* Sites Created */}
        <div className="p-5 bg-[#1A1B1E] border border-white/10 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Sites Criados</div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums mt-2">
            {projects.length}
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            {projects.length > 0 ? 'Projetos guardados e prontos' : 'Nenhum site gerado ainda'}
          </div>
        </div>

        {/* Credits Used */}
        <div className="p-5 bg-[#1A1B1E] border border-white/10 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Créditos Consumidos</div>
          <div className="text-3xl font-bold text-brand-400 font-mono tabular-nums mt-2">
            {usedCredits}
            <span className="text-xs text-slate-500 ml-1.5 font-normal">CR</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Controlo de transações sem duplicados
          </div>
        </div>

        {/* Account Status */}
        <div className="p-5 bg-[#1A1B1E] border border-white/10 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Estado da Conta</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-lg font-bold text-emerald-400">Ativa & Verificada</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            {user?.email}
          </div>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] mb-6">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Meus Projetos ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Histórico de Créditos & Atividades
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'pricing'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Planos & Upgrade ($ USD)
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Definições de Conta
        </button>
      </div>

      {/* ---------------- TAB 1: PROJECTS ---------------- */}
      {activeTab === 'projects' && (
        <div>
          {projects.length === 0 ? (
            <div className="p-12 text-center bg-[#1A1B1E] border border-white/10 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 mx-auto flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ainda não criou nenhum website</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Descreva uma ideia em linguagem natural e a nossa IA constrói o código, estilos e páginas completas em poucos segundos.
              </p>
              <button
                onClick={() => onOpenStudio()}
                className="px-6 py-2.5 text-xs font-semibold text-neutral-950 bg-brand-600 hover:bg-brand-500 rounded-md transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Meu Primeiro Site com IA</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[#1A1B1E] border border-white/10 rounded-lg overflow-hidden hover:border-brand-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Visual Card Header */}
                    <div className="h-36 bg-[#202125] border-b border-white/5 p-4 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-brand-300 bg-brand-500/20 px-2 py-0.5 rounded">
                          {project.category || 'Geral'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(project.updatedAt).toLocaleDateString('pt-PT')}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                          {project.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {project.description || 'Website gerado pelo StrongX Studio'}
                        </p>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-4 flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5">
                      <span>HTML5 · Tailwind CSS · JS</span>
                      <span className="text-emerald-400 font-medium">Publicável</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 bg-[#161719] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewProject(project)}
                      className="flex-1 py-1.5 px-2.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-brand-400" />
                      <span>Pré-visualizar</span>
                    </button>

                    <button
                      onClick={() => onOpenStudio(project)}
                      className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-neutral-950 bg-brand-600/80 hover:bg-brand-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Editar no Studio</span>
                    </button>

                    <button
                      onClick={() => handleExportZip(project)}
                      title="Exportar ZIP"
                      className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      title="Eliminar projeto"
                      className="p-1.5 text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAB 2: CREDIT HISTORY & ACTIVITIES ---------------- */}
      {activeTab === 'history' && (
        <div className="space-y-8">
          
          {/* Transactions Ledger */}
          <div className="bg-[#1A1B1E] border border-white/10 rounded-lg p-6">
            <h3 className="text-sm font-bold text-white mb-4">Registo de Transações de Créditos</h3>
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400">Sem transações registadas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-slate-400 border-b border-white/10 pb-2">
                    <tr>
                      <th className="py-2.5 font-semibold">Data / Hora</th>
                      <th className="py-2.5 font-semibold">Tipo</th>
                      <th className="py-2.5 font-semibold">Motivo</th>
                      <th className="py-2.5 font-semibold text-right">Créditos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-mono tabular-nums text-slate-400">
                          {new Date(tx.timestamp).toLocaleString('pt-PT')}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              tx.credits > 0
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
                            }`}
                          >
                            {tx.type === 'initial_grant' && 'Bónus de Boas-Vindas'}
                            {tx.type === 'deduction' && 'Geração de Site'}
                            {tx.type === 'refund' && 'Reembolso Automático'}
                            {tx.type === 'admin_adjustment' && 'Ajuste de Gestão'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-300">{tx.reason}</td>
                        <td
                          className={`py-3 text-right font-mono font-bold tabular-nums ${
                            tx.credits > 0 ? 'text-emerald-400' : 'text-brand-400'
                          }`}
                        >
                          {tx.credits > 0 ? `+${tx.credits}` : tx.credits} CR
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-[#1A1B1E] border border-white/10 rounded-lg p-6">
            <h3 className="text-sm font-bold text-white mb-4">Últimas Atividades da Conta</h3>
            <div className="space-y-3">
              {activities.slice(0, 10).map((act) => (
                <div key={act.id} className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    <span className="text-slate-300">{act.action}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {new Date(act.timestamp).toLocaleString('pt-PT')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ---------------- TAB 3: PRICING & UPGRADE ---------------- */}
      {activeTab === 'pricing' && (
        <div className="bg-[#1A1B1E] border border-white/10 rounded-lg overflow-hidden p-2 sm:p-4">
          <PricingTable onSelectPlan={onSelectPlan} onSelectPack={onSelectPack} />
        </div>
      )}

      {/* ---------------- TAB 4: ACCOUNT SETTINGS ---------------- */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-[#1A1B1E] border border-white/10 rounded-lg p-7 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Dados da Conta</h3>
            <p className="text-xs text-slate-400 mt-1">Informações associadas ao seu perfil de utilizador StrongX.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Nome Completo</span>
              <span className="text-white font-medium">{user?.firstName} {user?.lastName}</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Endereço de E-mail</span>
              <span className="text-white font-medium">{user?.email}</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Data de Registo</span>
              <span className="text-slate-300 font-mono">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-PT') : 'Hoje'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Tipo de Acesso</span>
              <span className="text-brand-400 font-semibold">{user?.accountType}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="text-xs text-slate-400 leading-relaxed">
              A sua conta está protegida por encriptação forte e as credenciais são verificadas unicamente no servidor.
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-8">
          <div className="w-full max-w-6xl h-[90vh] bg-[#1A1B1E] border border-white/10 rounded-lg flex flex-col overflow-hidden shadow-2xl">
            
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#161719]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{previewProject.name}</span>
                <span className="text-xs text-slate-400">· Modo Pré-visualização</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const p = previewProject;
                    setPreviewProject(null);
                    onOpenStudio(p);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-brand-600 rounded-lg hover:bg-brand-500 cursor-pointer"
                >
                  Abrir no Studio
                </button>
                <button
                  onClick={() => setPreviewProject(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white">
              <iframe
                title={previewProject.name}
                srcDoc={previewProject.sourceCode.fullCode || previewProject.sourceCode.html}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
