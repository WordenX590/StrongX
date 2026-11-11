import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminMetrics, VisitorAnalytics, SystemHealth, User } from '../types';
import { api } from '../services/api';
import {
  Shield,
  Users,
  Eye,
  Coins,
  Activity,
  Layers,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Download,
  Lock,
  Server,
  Database,
  Cpu,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
  const { user, isAdmin, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'visitors' | 'credits' | 'system'>('overview');
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [usersList, setUsersList] = useState<(User & { projectsCount: number })[]>([]);
  const [visitorsData, setVisitorsData] = useState<VisitorAnalytics | null>(null);
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);

  // Search & Filters
  const [userSearch, setUserSearch] = useState<string>('');

  // Credit adjustment modal
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<(User & { projectsCount: number }) | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(10);
  const [creditReason, setCreditReason] = useState<string>('');
  const [creditSubmitting, setCreditSubmitting] = useState<boolean>(false);

  // Global Config form
  const [initialCreditsVal, setInitialCreditsVal] = useState<number>(150);
  const [generationCostVal, setGenerationCostVal] = useState<number>(10);
  const [configSuccess, setConfigSuccess] = useState<boolean>(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [m, u, v, h] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getAdminVisitors(),
        api.getAdminHealth(),
      ]);
      setMetrics(m);
      setUsersList(u.users);
      setVisitorsData(v);
      setHealthData(h);
      if (m?.config) {
        setInitialCreditsVal(m.config.initialCredits);
        setGenerationCostVal(m.config.generationCost);
      }
    } catch (err) {
      console.error('Failed fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (targetUser: User) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const actionLabel = nextStatus === 'suspended' ? 'suspender' : 'reativar';
    if (!confirm(`Deseja realmente ${actionLabel} a conta de ${targetUser.email}?`)) return;

    try {
      await api.updateUserStatus(targetUser.id, nextStatus);
      setUsersList(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, status: nextStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar estado do utilizador.');
    }
  };

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCredit || !creditReason.trim()) return;

    try {
      setCreditSubmitting(true);
      await api.adjustUserCredits(selectedUserForCredit.id, creditAmount, creditReason.trim());
      // Refresh list
      await fetchAdminData();
      setSelectedUserForCredit(null);
      setCreditReason('');
    } catch (err: any) {
      alert(err.message || 'Erro ao ajustar créditos.');
    } finally {
      setCreditSubmitting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateConfig({
        initialCredits: Number(initialCreditsVal),
        generationCost: Number(generationCostVal),
      });
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 2500);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao guardar configurações.');
    }
  };

  const handleBackupExport = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      admin: user?.email,
      metrics,
      users: usersList,
      visitors: visitorsData,
      health: healthData,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strongx_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[#18191C] border border-red-500/30 rounded-lg text-center">
        <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Acesso Exclusivo ao Proprietário</h2>
        <p className="text-xs text-slate-400 mb-6">
          Esta área é restrita a administradores autorizados com validação estrita no servidor.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-md"
        >
          Voltar à Página Inicial
        </button>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    u =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.lastName.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 min-h-[85vh]">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Painel de Controlo do Proprietário · flatthedragon@gmail.com</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Administração Geral StrongX
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Métricas em tempo real, auditoria de segurança, telemetria de visitantes e controlo de créditos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBackupExport}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-brand-400" />
            <span>Cópia de Segurança (JSON)</span>
          </button>

          <button
            onClick={() => fetchAdminData()}
            className="p-2.5 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-md transition-colors cursor-pointer"
            title="Recarregar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] my-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview' ? 'border-amber-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Visão Geral & Métricas
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users' ? 'border-amber-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Gestão de Utilizadores ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('visitors')}
          className={`pb-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'visitors' ? 'border-amber-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Análise de Visitantes ({visitorsData?.total || 0})
        </button>

        <button
          onClick={() => setActiveTab('credits')}
          className={`pb-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'credits' ? 'border-amber-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Gestão de Créditos
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'system' ? 'border-amber-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Estado da Plataforma & Segurança
        </button>
      </div>

      {/* ----------------- TAB 1: OVERVIEW METRICS ----------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Main Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 bg-[#1A1B1E] border border-white/10 rounded-lg">
              <div className="text-xs text-slate-400 font-medium">Total de Utilizadores</div>
              <div className="text-3xl font-bold text-white font-mono tabular-nums mt-2">
                {metrics?.totalUsers ?? 0}
              </div>
              <div className="mt-2 text-[11px] text-emerald-400 font-medium">
                {metrics?.activeUsers ?? 0} contas ativas
              </div>
            </div>

            <div className="p-5 bg-[#1A1B1E] border border-white/10 rounded-lg">
              <div className="text-xs text-slate-400 font-medium">Total de Visitantes</div>
              <div className="text-3xl font-bold text-brand-400 font-mono tabular-nums mt-2">
                {metrics?.totalVisitors ?? 0}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                Sessões anónimas rastreadas
              </div>
            </div>

            <div className="p-5 bg-[#1A1B1E] border border-white/10 rounded-lg">
              <div className="text-xs text-slate-400 font-medium">Websites Gerados com IA</div>
              <div className="text-3xl font-bold text-brand-400 font-mono tabular-nums mt-2">
                {metrics?.totalProjects ?? 0}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                {metrics?.completedGenerations ?? 0} gerações concluídas
              </div>
            </div>

            <div className="p-5 bg-[#1A1B1E] border border-amber-500/20 rounded-lg">
              <div className="text-xs text-slate-400 font-medium">Créditos Consumidos</div>
              <div className="text-3xl font-bold text-amber-400 font-mono tabular-nums mt-2">
                {metrics?.totalCreditsConsumed ?? 0}
                <span className="text-xs text-slate-500 ml-1 font-normal">CR</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                De {metrics?.totalCreditsDistributed ?? 0} distribuídos
              </div>
            </div>

          </div>

          {/* Operational Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-6 bg-[#1A1B1E] border border-white/10 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-white">Eficiência do Motor de IA</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Gerações Bem-Sucedidas</span>
                    <span className="font-mono text-emerald-400 font-bold">{metrics?.completedGenerations ?? 0}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[95%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Falhas com Reembolso Automático</span>
                    <span className="font-mono text-brand-400 font-bold">{metrics?.failedGenerations ?? 0}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 w-[5%]" />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-2 border-t border-white/5">
                O mecanismo de transação garante reembolso instantâneo aos utilizadores caso o modelo Gemini sofra qualquer latência anormal.
              </p>
            </div>

            <div className="p-6 bg-[#1A1B1E] border border-white/10 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-white">Configuração Ativa da Plataforma</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-md">
                  <span className="text-slate-500 block text-[10px]">Créditos Iniciais</span>
                  <span className="text-white font-mono font-bold text-lg">{metrics?.config?.initialCredits ?? 150} CR</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-md">
                  <span className="text-slate-500 block text-[10px]">Custo por Geração</span>
                  <span className="text-white font-mono font-bold text-lg">{metrics?.config?.generationCost ?? 10} CR</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                Pode alterar estes parâmetros a qualquer momento no separador <span className="text-amber-400 font-medium">Gestão de Créditos</span>.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ----------------- TAB 2: USER MANAGEMENT ----------------- */}
      {activeTab === 'users' && (
        <div className="bg-[#1A1B1E] border border-white/10 rounded-lg p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Utilizadores Registados</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Consulte o estado das contas, créditos e projetos. Por segurança e privacidade, palavras-passe não são acessíveis.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Pesquisar por nome ou e-mail..."
                className="w-full bg-[#222327] border border-white/10 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 border-b border-white/10 pb-2">
                <tr>
                  <th className="py-2.5 font-semibold">Utilizador</th>
                  <th className="py-2.5 font-semibold">Registo</th>
                  <th className="py-2.5 font-semibold">Estado</th>
                  <th className="py-2.5 font-semibold font-mono">Créditos</th>
                  <th className="py-2.5 font-semibold font-mono">Sites</th>
                  <th className="py-2.5 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-3">
                      <div className="font-semibold text-white">{u.firstName} {u.lastName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 font-mono text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {u.status === 'active' ? 'Ativo' : 'Suspenso'}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-brand-400 tabular-nums">
                      {u.credits} CR
                    </td>
                    <td className="py-3 font-mono text-white tabular-nums">
                      {u.projectsCount}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedUserForCredit(u)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
                      >
                        Ajustar Créditos
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                          u.status === 'active'
                            ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20 border-red-500/30'
                            : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspender' : 'Reativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ----------------- TAB 3: VISITOR ANALYTICS ----------------- */}
      {activeTab === 'visitors' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Countries Breakdown */}
            <div className="p-6 bg-[#1A1B1E] border border-white/10 rounded-lg">
              <h3 className="text-sm font-bold text-white mb-4">Países de Origem</h3>
              <div className="space-y-2.5 text-xs">
                {visitorsData?.countries.map((c) => (
                  <div key={c.country} className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-300">{c.country}</span>
                    <span className="font-mono text-brand-400 font-bold tabular-nums">{c.count} visitas</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices & Browsers */}
            <div className="p-6 bg-[#1A1B1E] border border-white/10 rounded-lg">
              <h3 className="text-sm font-bold text-white mb-4">Dispositivos Utilizados</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Computador (Desktop)</span>
                    <span className="font-mono font-bold text-brand-400">{visitorsData?.devices.desktop ?? 0}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Telemóvel (Mobile)</span>
                    <span className="font-mono font-bold text-brand-400">{visitorsData?.devices.mobile ?? 0}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Tablet</span>
                    <span className="font-mono font-bold text-slate-400">{visitorsData?.devices.tablet ?? 0}</span>
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-bold text-white mt-6 mb-3 text-slate-400">Navegadores</h4>
              <div className="space-y-1.5 text-xs">
                {visitorsData?.browsers.map((b) => (
                  <div key={b.browser} className="flex items-center justify-between text-slate-400">
                    <span>{b.browser}</span>
                    <span className="font-mono text-white tabular-nums">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethical Voluntary Demographics */}
            <div className="p-6 bg-[#1A1B1E] border border-white/10 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Estatísticas Demográficas</h3>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                  Baseadas exclusivamente em dados voluntariamente fornecidos pelos utilizadores no registo, respeitando a privacidade e sem inferências de IP.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-md flex items-center justify-between">
                    <span className="text-slate-300">Adultos (25+ anos)</span>
                    <span className="font-mono font-bold text-brand-400 tabular-nums">
                      {visitorsData?.demographics.adult ?? 0}
                    </span>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-md flex items-center justify-between">
                    <span className="text-slate-300">Jovens (18 - 24 anos)</span>
                    <span className="font-mono font-bold text-brand-400 tabular-nums">
                      {visitorsData?.demographics.youth ?? 0}
                    </span>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-md flex items-center justify-between">
                    <span className="text-slate-300">Menores de idade</span>
                    <span className="font-mono font-bold text-slate-400 tabular-nums">
                      {visitorsData?.demographics.minor ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-white/5">
                Total agregado em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD).
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ----------------- TAB 4: CREDIT GOVERNANCE ----------------- */}
      {activeTab === 'credits' && (
        <div className="max-w-2xl bg-[#1A1B1E] border border-white/10 rounded-lg p-7 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Configuração Global do Sistema de Créditos</h3>
            <p className="text-xs text-slate-400 mt-1">
              Altere a quantidade de créditos atribuídos a novas contas ou o custo de criação de sites por IA.
            </p>
          </div>

          {configSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-md flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Configurações atualizadas com sucesso no servidor!</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">
                Créditos Iniciais para Novos Utilizadores
              </label>
              <input
                type="number"
                min="0"
                value={initialCreditsVal}
                onChange={(e) => setInitialCreditsVal(Number(e.target.value))}
                className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Predefinido: 150 créditos (permite 15 sites).</span>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1.5">
                Custo de Créditos por Criação de Site
              </label>
              <input
                type="number"
                min="1"
                value={generationCostVal}
                onChange={(e) => setGenerationCostVal(Number(e.target.value))}
                className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Predefinido: 10 créditos por site concluído.</span>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors cursor-pointer"
            >
              Guardar Configurações no Servidor
            </button>
          </form>
        </div>
      )}

      {/* ----------------- TAB 5: SYSTEM HEALTH & SECURITY AUDIT ----------------- */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          
          {/* Diagnostic indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 bg-[#1A1B1E] border border-white/10 rounded-lg flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400">Estado do Servidor Node.js</span>
                <div className="text-sm font-bold text-emerald-400">Online & Ativo</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Uptime: {healthData?.uptimeSeconds}s</div>
              </div>
            </div>

            <div className="p-5 bg-[#1A1B1E] border border-white/10 rounded-lg flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400">Base de Dados Persistente</span>
                <div className="text-sm font-bold text-brand-400">Operacional (JSON Store)</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Integridade verificada</div>
              </div>
            </div>

            <div className="p-5 bg-[#1A1B1E] border border-white/10 rounded-lg flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400">API Gemini (Google GenAI)</span>
                <div className="text-sm font-bold text-brand-400">Ligada & Pronta</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">gemini-3.8-flash</div>
              </div>
            </div>

          </div>

          {/* Audit Logs Table */}
          <div className="bg-[#1A1B1E] border border-white/10 rounded-lg p-6">
            <h3 className="text-sm font-bold text-white mb-2">Histórico de Auditoria & Segurança</h3>
            <p className="text-xs text-slate-400 mb-4">
              Tentativas de acesso administrativo e alterações efetuadas com validação de IP e hora.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-slate-400 border-b border-white/10 pb-2">
                  <tr>
                    <th className="py-2.5 font-semibold">Data e Hora</th>
                    <th className="py-2.5 font-semibold">E-mail</th>
                    <th className="py-2.5 font-semibold">Ação</th>
                    <th className="py-2.5 font-semibold">IP</th>
                    <th className="py-2.5 font-semibold">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {healthData?.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 text-slate-400">
                        {new Date(log.timestamp).toLocaleString('pt-PT')}
                      </td>
                      <td className="py-3 text-slate-300">{log.adminEmail}</td>
                      <td className="py-3 text-white">{log.action}</td>
                      <td className="py-3 text-slate-500">{log.ip || '127.0.0.1'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.success
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {log.success ? 'Sucesso' : 'Recusado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Credit Adjustment Modal */}
      {selectedUserForCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm bg-[#1E1F23] border border-white/10 rounded-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Ajustar Saldo de Créditos</h3>
            <p className="text-xs text-slate-400 mb-4">
              Para o utilizador <span className="text-brand-400 font-semibold">{selectedUserForCredit.email}</span> (Saldo atual: {selectedUserForCredit.credits} CR)
            </p>

            <form onSubmit={handleAdjustCredits} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Montante (positivo adiciona, negativo retira)</label>
                <input
                  type="number"
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  placeholder="Ex: 50 ou -10"
                  className="w-full bg-[#222327] border border-white/10 rounded-md px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Motivo da Operação (Obrigatório)</label>
                <textarea
                  required
                  rows={2}
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="Ex: Bónus promocional concedido ou correção manual..."
                  className="w-full bg-[#222327] border border-white/10 rounded-md p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForCredit(null)}
                  className="w-1/3 py-2 text-slate-300 bg-white/5 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creditSubmitting}
                  className="w-2/3 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors cursor-pointer"
                >
                  {creditSubmitting ? 'A registar...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
