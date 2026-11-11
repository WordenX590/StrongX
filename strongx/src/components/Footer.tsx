import React from 'react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms, onNavigateAdmin }) => {
  const linkClass = 'text-slate-400 hover:text-white cursor-pointer text-left';
  return (
    <footer className="w-full border-t border-white/10 bg-[#0E0F11] px-6 py-10 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-xs">
          <div className="font-display font-bold text-white text-lg">StrongX</div>
          <p className="mt-2 text-slate-400">
            Gera sites a partir de uma descrição. O código é seu: exporte e publique onde quiser.
          </p>
          <p className="mt-4 text-slate-500 text-xs">© {new Date().getFullYear()} StrongX</p>
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end items-start">
          <li><a href="#showcase" className={linkClass}>Exemplos</a></li>
          <li><a href="#pricing" className={linkClass}>Preços</a></li>
          <li><button onClick={onOpenPrivacy} className={linkClass}>Privacidade</button></li>
          <li><button onClick={onOpenTerms} className={linkClass}>Termos</button></li>
          <li><button onClick={onNavigateAdmin} className={linkClass}>Administração</button></li>
        </ul>
      </div>
    </footer>
  );
};
