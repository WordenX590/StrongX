import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { api } from '../services/api';
import {
  Wrench,
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Code2,
  Download,
  Save,
  RotateCcw,
  Send,
  Check,
  AlertCircle,
  Copy,
  Layers,
  FileCode,
  Zap,
} from 'lucide-react';
import JSZip from 'jszip';
import { OutOfCreditsModal } from './OutOfCreditsModal';

interface BuilderStudioProps {
  initialProject?: Project | null;
  initialPrompt?: string;
  onBackToDashboard: () => void;
  onSelectPlan: (planId: 'free' | 'pro' | 'agency') => void;
  onSelectPack: (packId: string) => void;
}

export const BuilderStudio: React.FC<BuilderStudioProps> = ({
  initialProject,
  initialPrompt = '',
  onBackToDashboard,
  onSelectPlan,
  onSelectPack,
}) => {
  const { user, updateLocalCredits } = useAuth();
  const [showOutOfCreditsModal, setShowOutOfCreditsModal] = useState<boolean>(false);

  // Project state
  const [projectId, setProjectId] = useState<string | null>(initialProject?.id || null);
  const [projectName, setProjectName] = useState<string>(initialProject?.name || 'Novo Website com IA');
  const [projectDescription, setProjectDescription] = useState<string>(initialProject?.description || '');
  const [projectCategory, setProjectCategory] = useState<string>(initialProject?.category || 'Geral');

  // Code state
  const [htmlCode, setHtmlCode] = useState<string>(initialProject?.sourceCode?.html || '');
  const [cssCode, setCssCode] = useState<string>(initialProject?.sourceCode?.css || '');
  const [jsCode, setJsCode] = useState<string>(initialProject?.sourceCode?.js || '');
  const [fullCode, setFullCode] = useState<string>(initialProject?.sourceCode?.fullCode || '');

  // UI modes
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [codeTab, setCodeTab] = useState<'full' | 'html' | 'css' | 'js'>('full');

  // Chat & AI interaction state
  const [instructionInput, setInstructionInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: initialProject
        ? `Projeto "${initialProject.name}" carregado. Peça modificações como "Adicionar depoimentos" ou "Mudar paleta de cores".`
        : 'Olá! Descreva o website que pretende criar ou use uma das sugestões abaixo.',
      time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Loading & generation status
  const [generating, setGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Suggested quick prompts for modification or initial creation
  const quickRefinements = [
    'Adicionar secção de depoimentos com avaliação de 5 estrelas',
    'Adicionar tabela com 3 planos de preços e botão de destaque',
    'Tornar a barra de navegação fixa com efeito de vidro fosco',
    'Adicionar formulário de contacto interativo com validação',
    'Mudar o tema visual para Dark Indigo com detalhes em ciano',
  ];

  // If there's an initial prompt passed from Landing, trigger generation automatically
  useEffect(() => {
    if (initialPrompt && !initialProject && !fullCode) {
      handleGenerate(initialPrompt);
    }
  }, [initialPrompt]);

  const handleGenerate = async (promptToUse?: string) => {
    const promptText = (promptToUse || instructionInput).trim();
    if (!promptText) return;

    if ((user?.credits ?? 0) < 10) {
      setShowOutOfCreditsModal(true);
      setErrorBanner('Os seus créditos terminaram. Necessita de 10 créditos para gerar um novo site com IA.');
      return;
    }

    setErrorBanner(null);
    setSuccessBanner(null);
    setGenerating(true);
    setStatusMessage('A analisar a visão e a estruturar a arquitetura com IA...');

    // Add to chat
    setChatHistory(prev => [
      ...prev,
      { role: 'user', text: promptText, time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setInstructionInput('');

    try {
      setTimeout(() => setStatusMessage('A compilar componentes semânticos e Tailwind CSS...'), 1200);
      setTimeout(() => setStatusMessage('A injetar lógica JavaScript e responsividade...'), 2600);

      const res = await api.generateSite(promptText);

      setProjectId(res.project.id);
      setProjectName(res.project.name);
      setProjectDescription(res.project.description);
      setProjectCategory(res.project.category);
      setHtmlCode(res.project.sourceCode.html);
      setCssCode(res.project.sourceCode.css);
      setJsCode(res.project.sourceCode.js);
      setFullCode(res.project.sourceCode.fullCode);

      updateLocalCredits(res.credits);
      setSuccessBanner(`Website gerado com sucesso! Foram consumidos ${res.creditsDeducted} créditos.`);

      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Website "${res.project.name}" criado com sucesso! Pode agora pré-visualizar, ajustar ou pedir alterações pontuais.`,
          time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Generation error:', err);
      if (err.message && (err.message.toLowerCase().includes('créditos') || err.message.toLowerCase().includes('insuficientes'))) {
        setShowOutOfCreditsModal(true);
      }
      setErrorBanner(err.message || 'Erro na geração. Os seus créditos foram reembolsados automaticamente.');
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Ocorreu um erro no processamento. Os seus créditos foram devolvidos. Mensagem: ${err.message}`,
          time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setGenerating(false);
      setStatusMessage('');
    }
  };

  const handleRefine = async () => {
    const instruction = instructionInput.trim();
    if (!instruction || !fullCode) return;

    if ((user?.credits ?? 0) < 5) {
      setShowOutOfCreditsModal(true);
      setErrorBanner('Os seus créditos terminaram. Necessita de 5 créditos para modificar o site.');
      return;
    }

    setErrorBanner(null);
    setSuccessBanner(null);
    setGenerating(true);
    setStatusMessage('A aplicar modificações solicitadas sem reconstruir tudo...');

    setChatHistory(prev => [
      ...prev,
      { role: 'user', text: instruction, time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setInstructionInput('');

    try {
      const res = await api.refineSite({
        existingCode: fullCode,
        instruction,
        projectId: projectId || undefined,
      });

      setHtmlCode(res.refined.html);
      setCssCode(res.refined.css);
      setJsCode(res.refined.js);
      setFullCode(res.refined.fullCode);
      if (res.refined.projectName) setProjectName(res.refined.projectName);

      updateLocalCredits(res.credits);
      setSuccessBanner('Alterações aplicadas com sucesso pelo motor de IA!');

      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Modificação concluída: "${instruction}". O website foi atualizado mantendo a estrutura existente.`,
          time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      if (err.message && (err.message.toLowerCase().includes('créditos') || err.message.toLowerCase().includes('insuficientes'))) {
        setShowOutOfCreditsModal(true);
      }
      setErrorBanner(err.message || 'Erro ao refinar website. Créditos reembolsados.');
    } finally {
      setGenerating(false);
      setStatusMessage('');
    }
  };

  const handleSaveProject = async () => {
    if (!fullCode) {
      alert('Gere primeiro um website antes de guardar.');
      return;
    }

    try {
      if (projectId) {
        await api.updateProject(projectId, {
          name: projectName,
          description: projectDescription,
          category: projectCategory,
          sourceCode: { html: htmlCode, css: cssCode, js: jsCode, fullCode },
        });
        setSuccessBanner('Projeto atualizado com sucesso na sua conta!');
      } else {
        const res = await api.saveProject({
          name: projectName,
          description: projectDescription,
          category: projectCategory,
          sourceCode: { html: htmlCode, css: cssCode, js: jsCode, fullCode },
        });
        setProjectId(res.project.id);
        setSuccessBanner('Novo projeto guardado com sucesso na sua conta!');
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Erro ao guardar projeto.');
    }
  };

  const handleExportZip = async () => {
    if (!fullCode) {
      alert('Nenhum código para exportar.');
      return;
    }

    const zip = new JSZip();
    zip.file('index.html', fullCode);
    zip.file('style.css', cssCode || '/* StrongX Custom Styles */');
    zip.file('script.js', jsCode || '// StrongX Custom Scripts');
    zip.file(
      'README.md',
      `# ${projectName}\n\n${projectDescription}\n\nGerado com a plataforma profissional StrongX.\n\nInstruções:\n1. Abra o ficheiro index.html em qualquer navegador web.\n2. Publique na Vercel, Netlify, Cloudflare ou no seu servidor Apache/Nginx.`
    );

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_strongx.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    const codeToCopy =
      codeTab === 'full' ? fullCode : codeTab === 'html' ? htmlCode : codeTab === 'css' ? cssCode : jsCode;
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-62px)] bg-[#111214] overflow-hidden">
      
      {/* ----------------- STUDIO TOPBAR ----------------- */}
      <div className="h-14 border-b border-white/[0.08] bg-[#141517] px-4 flex items-center justify-between gap-4 shrink-0">
        
        {/* Left: Back & Project Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Voltar ao Painel"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-white/20 focus:border-brand-500 focus:outline-none px-1 py-0.5 max-w-[200px] sm:max-w-[280px] truncate"
              placeholder="Nome do Website"
            />
            <span className="text-[10px] text-brand-400 bg-brand-500/20 border border-brand-500/30 px-2 py-0.5 rounded font-mono">
              {projectCategory}
            </span>
          </div>
        </div>

        {/* Center: Viewport Controls */}
        <div className="hidden md:flex items-center p-1 bg-[#1E1F23] border border-white/10 rounded-md">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              viewport === 'desktop' ? 'bg-brand-600 text-neutral-950' : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Desktop</span>
          </button>

          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              viewport === 'tablet' ? 'bg-brand-600 text-neutral-950' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Tablet</span>
          </button>

          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              viewport === 'mobile' ? 'bg-brand-600 text-neutral-950' : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Mobile</span>
          </button>
        </div>

        {/* Right: View mode & Actions */}
        <div className="flex items-center gap-2">
          
          {/* Mode switch: Preview vs Code */}
          <div className="flex items-center p-0.5 bg-[#1E1F23] border border-white/10 rounded-lg">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'preview' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-brand-400" />
              <span>Ver</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'code' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-brand-400" />
              <span>Código</span>
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveProject}
            disabled={!fullCode}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guardar</span>
          </button>

          {/* Export ZIP */}
          <button
            onClick={handleExportZip}
            disabled={!fullCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-brand-500 rounded-lg hover:opacity-90 shadow-sm transition-all cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar ZIP</span>
          </button>

          {/* User Credits Balance & Upgrade */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs font-mono tabular-nums text-slate-300 bg-white/[0.04] border border-white/[0.08] rounded-md">
              <span className="text-brand-400 font-bold">{user?.credits ?? 0}</span>
              <span className="text-slate-500 text-[10px]">CR</span>
            </div>

            {(user?.credits ?? 0) < 15 && (
              <button
                onClick={() => setShowOutOfCreditsModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/35 rounded-lg hover:bg-amber-500/25 transition-all cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Upgrade / Recarregar</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Banners */}
      {errorBanner && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2 flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {successBanner && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ----------------- WORKSPACE BODY ----------------- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: AI Chat & Refinement */}
        <div className="w-80 lg:w-96 border-r border-white/[0.08] bg-[#141517] flex flex-col justify-between shrink-0">
          
          {/* Chat Header */}
          <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Wrench className="w-3.5 h-3.5 text-brand-400" />
              <span>Copiloto de Criação com IA</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Gemini 3.8 Flash</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-lg text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-neutral-950 rounded-br-none shadow-sm'
                      : 'bg-[#202125] text-slate-300 border border-white/5 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">{msg.time}</span>
              </div>
            ))}

            {generating && (
              <div className="p-3.5 bg-brand-500/10 border border-brand-500/20 rounded-md space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
                  <Wrench className="w-4 h-4 animate-spin text-brand-400" />
                  <span>A processar com Inteligência Artificial...</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{statusMessage}</p>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {!generating && (
            <div className="p-3 border-t border-white/5 bg-[#18191C] space-y-1.5">
              <div className="text-[10px] font-semibold text-slate-400 mb-1">
                Sugestões de melhoria com IA:
              </div>
              <div className="space-y-1">
                {quickRefinements.slice(0, 3).map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInstructionInput(sug);
                    }}
                    className="w-full text-left text-[11px] text-slate-400 hover:text-brand-300 bg-white/[0.02] hover:bg-white/[0.05] p-1.5 rounded transition-colors truncate"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt / Instruction Input Area */}
          <div className="p-3.5 border-t border-white/[0.08] bg-[#1A1B1E]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (fullCode) {
                  handleRefine();
                } else {
                  handleGenerate();
                }
              }}
              className="space-y-2"
            >
              <div className="relative">
                <textarea
                  rows={3}
                  value={instructionInput}
                  onChange={(e) => setInstructionInput(e.target.value)}
                  placeholder={
                    fullCode
                      ? 'Ex: Adiciona uma secção de testemunhos com fotos e muda o tom do botão...'
                      : 'Descreva detalhadamente o website que pretende criar...'
                  }
                  className="w-full bg-[#222327] border border-white/10 rounded-md p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {fullCode ? 'Custo: 5 CR (refinamento)' : 'Custo: 10 CR (novo site)'}
                </span>

                <button
                  type="submit"
                  disabled={generating || !instructionInput.trim()}
                  className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{fullCode ? 'Modificar com IA' : 'Gerar com IA'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT PANEL: Canvas (Live Sandbox Preview or Code Inspector) */}
        <div className="flex-1 bg-[#0E0F11] flex flex-col overflow-hidden relative">
          
          {viewMode === 'preview' ? (
            <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto bg-[#111214]">
              {fullCode ? (
                <div
                  className={`transition-all duration-300 h-full bg-white shadow-2xl overflow-hidden ${
                    viewport === 'desktop'
                      ? 'w-full rounded-lg'
                      : viewport === 'tablet'
                      ? 'w-[768px] rounded-lg border-8 border-slate-800'
                      : 'w-[375px] rounded-lg border-8 border-slate-800'
                  }`}
                >
                  <iframe
                    ref={iframeRef}
                    title="Website Preview"
                    srcDoc={fullCode}
                    className="w-full h-full border-none bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                  />
                </div>
              ) : (
                <div className="text-center max-w-md p-8 bg-[#1A1B1E] border border-white/10 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 mx-auto flex items-center justify-center mb-4">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Pronto para criar o seu site</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Utilize a caixa de conversa à esquerda para descrever a sua visão ou escolha uma sugestão rápida para gerar o código em tempo real.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Code Inspector */
            <div className="flex-1 flex flex-col bg-[#18191C] overflow-hidden">
              
              {/* Code sub-tabs */}
              <div className="px-4 py-2.5 border-b border-white/[0.08] bg-[#141517] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCodeTab('full')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      codeTab === 'full' ? 'bg-brand-600 text-neutral-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    index.html (Completo)
                  </button>
                  <button
                    onClick={() => setCodeTab('html')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      codeTab === 'html' ? 'bg-brand-600 text-neutral-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Corpo HTML
                  </button>
                  <button
                    onClick={() => setCodeTab('css')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      codeTab === 'css' ? 'bg-brand-600 text-neutral-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    CSS Estilos
                  </button>
                  <button
                    onClick={() => setCodeTab('js')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      codeTab === 'js' ? 'bg-brand-600 text-neutral-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    JavaScript
                  </button>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Editor Content */}
              <div className="flex-1 p-4 overflow-auto">
                <pre className="font-mono text-xs text-brand-200 leading-relaxed whitespace-pre-wrap select-all">
                  {codeTab === 'full' && (fullCode || '<!-- Sem código gerado ainda -->')}
                  {codeTab === 'html' && (htmlCode || '<!-- Sem HTML gerado ainda -->')}
                  {codeTab === 'css' && (cssCode || '/* Sem estilos adicionais */')}
                  {codeTab === 'js' && (jsCode || '// Sem scripts adicionais')}
                </pre>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Out of Credits Modal Alert */}
      <OutOfCreditsModal
        isOpen={showOutOfCreditsModal}
        onClose={() => setShowOutOfCreditsModal(false)}
        onSelectPlan={onSelectPlan}
        onSelectPack={onSelectPack}
        currentCredits={user?.credits ?? 0}
      />

    </div>
  );
};
