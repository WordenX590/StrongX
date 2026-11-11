import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenStudio?: () => void;
}

const links = [
  { id: 'showcase', label: 'Exemplos' },
  { id: 'how-it-works', label: 'Como funciona' },
  { id: 'pricing', label: 'Preços' },
  { id: 'faq', label: 'Perguntas' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenStudio }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const goTo = (id: string) => {
    if (currentView !== 'landing') onNavigate('landing');
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#111214]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-6 h-14">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 shrink-0"
          aria-label="StrongX, página inicial"
        >
          <span className="w-6 h-6 bg-brand-500 text-neutral-950 grid place-items-center font-display font-extrabold text-sm leading-none">X</span>
          <span className="font-display font-bold text-lg tracking-tight text-white">StrongX</span>
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          {links.map((l) => (
            <button key={l.id} onClick={() => goTo(l.id)} className="hover:text-white whitespace-nowrap cursor-pointer">
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0 text-sm">
          {!isAuthenticated ? (
            <>
              <button onClick={() => onNavigate('login')} className="px-3 py-1.5 text-slate-300 hover:text-white whitespace-nowrap cursor-pointer">
                Entrar
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-1.5 font-semibold bg-brand-500 text-neutral-950 rounded hover:bg-brand-400 whitespace-nowrap cursor-pointer"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => (onOpenStudio ? onOpenStudio() : onNavigate('builder'))}
                className="hidden sm:inline-block px-3.5 py-1.5 font-semibold bg-brand-500 text-neutral-950 rounded hover:bg-brand-400 whitespace-nowrap cursor-pointer"
              >
                Novo site
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                aria-current={currentView === 'dashboard' ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded whitespace-nowrap cursor-pointer ${
                  currentView === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Painel</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  aria-current={currentView === 'admin' ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded whitespace-nowrap cursor-pointer ${
                    currentView === 'admin' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}
              <span className="hidden lg:inline px-2 text-slate-300 font-mono tabular-nums text-xs">
                {user?.credits ?? 0} créditos
              </span>
              <button onClick={logout} title="Terminar sessão" aria-label="Terminar sessão" className="p-1.5 text-slate-400 hover:text-white cursor-pointer">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
