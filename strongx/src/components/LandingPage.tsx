import React, { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PricingTable } from './PricingTable';

interface LandingPageProps {
  onStartWithPrompt: (promptText: string) => void;
  onNavigate: (view: string) => void;
  onSelectPlan: (planId: 'free' | 'pro' | 'agency') => void;
  onSelectPack: (packId: string) => void;
}

const examples = [
  {
    id: 'clinica',
    tab: 'Clínica',
    prompt: 'Site institucional para clínica médica, com equipa, especialidades e pedido de marcação',
    result: 'Página inicial, equipa, especialidades e formulário de marcação com validação dos campos.',
  },
  {
    id: 'loja',
    tab: 'Loja',
    prompt: 'Loja de café artesanal com catálogo, carrinho e modo escuro',
    result: 'Catálogo em grelha, carrinho lateral que guarda os itens e resumo da encomenda.',
  },
  {
    id: 'portfolio',
    tab: 'Portfólio',
    prompt: 'Portfólio para arquiteto com galeria de projetos e página de contacto',
    result: 'Galeria com filtro por tipo de obra, página por projeto e formulário de contacto.',
  },
];

const steps = [
  { t: 'Descreva o site', d: 'Diga o que a empresa faz, que páginas quer e que cores prefere. Quanto mais concreto, melhor o resultado.' },
  { t: 'Reveja no estúdio', d: 'O site abre numa pré-visualização que pode ver em computador, tablet e telemóvel. Peça ajustes por escrito ou edite o código diretamente.' },
  { t: 'Exporte e publique', d: 'Descarregue um ZIP com HTML, CSS e JavaScript. Funciona em qualquer alojamento.' },
];

const faqs = [
  {
    q: 'O que recebo no fim?',
    a: 'Um site completo em ficheiros HTML, CSS e JavaScript, mais um ficheiro com instruções de publicação. Não depende do StrongX para funcionar.',
  },
  {
    q: 'Como funcionam os créditos?',
    a: 'Cada conta nova começa com 150 créditos. Gerar um site gasta 10, por isso dá para criar 15 sites sem pagar. Se uma geração falhar por erro do sistema ou da rede, os 10 créditos voltam à sua conta.',
  },
  {
    q: 'Posso exportar o código e alojá-lo noutro sítio?',
    a: 'Sim. A exportação é um ZIP e pode publicá-lo na Vercel, na Netlify, na Cloudflare Pages ou no seu próprio servidor.',
  },
  {
    q: 'Posso alterar o site depois de gerado?',
    a: 'Sim. No estúdio pode pedir alterações por escrito (por exemplo, "fixa o menu no topo" ou "adiciona uma tabela com três planos") ou editar o código e ver o resultado logo a seguir.',
  },
  {
    q: 'Os sites funcionam em telemóvel?',
    a: 'Sim. São construídos a pensar primeiro no ecrã pequeno. No estúdio pode alternar entre computador, tablet e telemóvel antes de exportar.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartWithPrompt,
  onNavigate,
  onSelectPlan,
  onSelectPack,
}) => {
  const { isAuthenticated } = useAuth();
  const [demoPrompt, setDemoPrompt] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeExample, setActiveExample] = useState(examples[0].id);
  const current = examples.find((e) => e.id === activeExample) ?? examples[0];

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoPrompt.trim()) return;
    if (isAuthenticated) {
      onStartWithPrompt(demoPrompt);
    } else {
      sessionStorage.setItem('pending_prompt', demoPrompt);
      onNavigate('register');
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] text-white" style={{ textWrap: 'balance' }}>
            Descreva o site que precisa. Receba o código pronto a publicar.
          </h1>
          <p className="mt-5 text-lg text-slate-300 max-w-xl">
            O StrongX gera HTML, CSS e JavaScript a partir de uma descrição em português. Depois edita, exporta e aloja onde quiser.
          </p>

          <form onSubmit={handleDemoSubmit} className="mt-8 max-w-xl">
            <label htmlFor="hero-prompt" className="block text-sm font-semibold text-white mb-2">
              O que deve ter o site?
            </label>
            <textarea
              id="hero-prompt"
              rows={3}
              value={demoPrompt}
              onChange={(e) => setDemoPrompt(e.target.value)}
              placeholder="Ex.: Site para uma consultora financeira, com serviços, equipa e formulário de contacto"
              className="w-full bg-[#1A1B1E] border border-white/15 rounded px-4 py-3 text-base text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none resize-none"
            />
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <button
                type="submit"
                className="px-5 py-2.5 font-semibold bg-brand-500 text-neutral-950 rounded hover:bg-brand-400 inline-flex items-center gap-2 cursor-pointer"
              >
                Gerar o site
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-400">150 créditos grátis ao criar conta. Não pede cartão.</span>
            </div>
          </form>
        </div>

        {/* Amostra real de saída */}
        <div className="border border-white/10 bg-[#0E0F11] rounded overflow-hidden">
          <div className="flex text-sm border-b border-white/10 bg-[#141517]">
            <span className="px-4 py-2 text-white border-b-2 border-brand-500 font-mono text-xs leading-6">index.html</span>
            <span className="px-4 py-2 text-slate-500 font-mono text-xs leading-6">styles.css</span>
            <span className="px-4 py-2 text-slate-500 font-mono text-xs leading-6">app.js</span>
          </div>
          <pre className="p-5 text-[13px] leading-6 text-slate-300 overflow-x-auto"><code>{`<header class="site-header">
  <a class="logo" href="/">Clínica Mar Azul</a>
  <nav aria-label="Principal">
    <a href="#equipa">Equipa</a>
    <a href="#especialidades">Especialidades</a>
    <a href="#marcacao">Marcar consulta</a>
  </nav>
</header>

<main>
  <section class="hero">
    <h1>Cuidados de saúde perto de si</h1>
    <p>Consultas de clínica geral, pediatria
       e dermatologia.</p>
    <a class="btn" href="#marcacao">
      Marcar consulta
    </a>
  </section>
</main>`}</code></pre>
        </div>
      </section>

      {/* Exemplos */}
      <section id="showcase" className="px-6 py-20 max-w-6xl mx-auto border-t border-white/10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl">Três pedidos e o que saiu de cada um</h2>
        <p className="mt-3 text-slate-300 max-w-xl">Escolha um exemplo para ver a descrição usada e o que o StrongX construiu.</p>

        <div role="tablist" aria-label="Exemplos" className="mt-8 flex gap-6 border-b border-white/10">
          {examples.map((ex) => (
            <button
              key={ex.id}
              role="tab"
              aria-selected={activeExample === ex.id}
              onClick={() => setActiveExample(ex.id)}
              className={`pb-3 -mb-px border-b-2 cursor-pointer ${
                activeExample === ex.id ? 'border-brand-500 text-white font-semibold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {ex.tab}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="mt-8 grid md:grid-cols-2 gap-10 max-w-4xl">
          <div>
            <h3 className="text-sm font-semibold text-slate-400">O que foi pedido</h3>
            <p className="mt-2 text-lg text-white">{current.prompt}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400">O que foi gerado</h3>
            <p className="mt-2 text-lg text-white">{current.result}</p>
          </div>
        </div>

        <button
          onClick={() => onStartWithPrompt(current.prompt)}
          className="mt-8 px-5 py-2.5 font-semibold border border-white/20 rounded text-white hover:bg-white/5 cursor-pointer"
        >
          Começar com este pedido
        </button>
      </section>

      {/* Funcionalidades */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto border-t border-white/10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl">O que o StrongX entrega</h2>
        <dl className="mt-10 divide-y divide-white/10 border-y border-white/10 max-w-4xl">
          <div className="grid md:grid-cols-[14rem_1fr] gap-2 md:gap-8 py-6">
            <dt className="font-display font-bold text-white text-lg">Código que se lê</dt>
            <dd className="text-slate-300">HTML semântico, CSS com Tailwind e JavaScript simples. Um programador pode pegar nos ficheiros e continuar o trabalho.</dd>
          </div>
          <div className="grid md:grid-cols-[14rem_1fr] gap-2 md:gap-8 py-6">
            <dt className="font-display font-bold text-white text-lg">Pré-visualização</dt>
            <dd className="text-slate-300">Veja o site em computador (1440 px), tablet (768 px) e telemóvel (375 px) sem sair do estúdio.</dd>
          </div>
          <div className="grid md:grid-cols-[14rem_1fr] gap-2 md:gap-8 py-6">
            <dt className="font-display font-bold text-white text-lg">Exportação em ZIP</dt>
            <dd className="text-slate-300">Um pacote com index.html, estilos e scripts. Sem ligação ao StrongX depois de exportado.</dd>
          </div>
        </dl>
      </section>

      {/* Como funciona */}
      <section id="how-it-works" className="px-6 py-20 max-w-6xl mx-auto border-t border-white/10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl">Como funciona</h2>
        <ol className="mt-10 grid md:grid-cols-3 gap-10 max-w-5xl list-none">
          {steps.map((s, i) => (
            <li key={s.t}>
              <div className="font-display font-bold text-brand-500 text-lg">Passo {i + 1}</div>
              <h3 className="mt-1 text-xl font-bold text-white">{s.t}</h3>
              <p className="mt-2 text-slate-300">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Créditos */}
      <section id="credits-system" className="px-6 py-20 max-w-6xl mx-auto border-t border-white/10">
        <div className="grid md:grid-cols-[1fr_1fr] gap-12 items-start max-w-5xl">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">150 créditos para começar</h2>
            <p className="mt-3 text-slate-300">
              Chegam quando cria a conta. Cada site gerado gasta 10, por isso dá para fazer 15 sem pagar nada.
              Se uma geração falhar, os créditos voltam.
            </p>
            <button
              onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'register')}
              className="mt-6 px-5 py-2.5 font-semibold bg-brand-500 text-neutral-950 rounded hover:bg-brand-400 cursor-pointer"
            >
              {isAuthenticated ? 'Ir para o painel' : 'Criar conta grátis'}
            </button>
          </div>
          <dl className="grid grid-cols-3 gap-4 text-center md:text-left">
            <div>
              <dt className="text-sm text-slate-400">Ao registar</dt>
              <dd className="mt-1 font-display text-4xl font-bold text-white tabular-nums">150</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">Por site</dt>
              <dd className="mt-1 font-display text-4xl font-bold text-white tabular-nums">10</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">Sites grátis</dt>
              <dd className="mt-1 font-display text-4xl font-bold text-white tabular-nums">15</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Preços */}
      <section id="pricing" className="border-t border-white/10">
        <PricingTable onSelectPlan={onSelectPlan} onSelectPack={onSelectPack} />
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-20 max-w-3xl mx-auto border-t border-white/10">
        <h2 className="text-3xl font-bold text-white">Perguntas frequentes</h2>
        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={faq.q}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full py-4 text-left flex items-center justify-between gap-4 font-semibold text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <p className="pb-5 text-slate-300 max-w-2xl">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
