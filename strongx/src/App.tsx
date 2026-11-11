import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { AuthRegister } from './components/AuthRegister';
import { AuthLogin } from './components/AuthLogin';
import { CreatorDashboard } from './components/CreatorDashboard';
import { BuilderStudio } from './components/BuilderStudio';
import { AdminDashboard } from './components/AdminDashboard';
import { LegalModals } from './components/LegalModals';
import { CheckoutModal } from './components/CheckoutModal';
import { Project } from './types';
import { CheckCircle } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isAdmin, refreshUser } = useAuth();

  // Navigation views: 'landing' | 'register' | 'login' | 'dashboard' | 'builder' | 'admin'
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeProjectForStudio, setActiveProjectForStudio] = useState<Project | null>(null);
  const [initialPromptForStudio, setInitialPromptForStudio] = useState<string>('');

  // Legal modals
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);

  // Checkout modal
  const [checkoutItem, setCheckoutItem] = useState<{
    type: 'plan' | 'pack';
    id: string;
    title: string;
    priceUsd: number;
    credits: number;
    description: string;
  } | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);

  // If user signs in and was on auth page, route to dashboard or admin
  useEffect(() => {
    if (isAuthenticated) {
      if (currentView === 'login' || currentView === 'register') {
        const pendingPrompt = sessionStorage.getItem('pending_prompt');
        const pendingPlan = sessionStorage.getItem('pending_plan');
        const pendingPack = sessionStorage.getItem('pending_pack');

        if (pendingPlan) {
          sessionStorage.removeItem('pending_plan');
          handleSelectPlan(pendingPlan as any);
        } else if (pendingPack) {
          sessionStorage.removeItem('pending_pack');
          handleSelectPack(pendingPack);
        } else if (pendingPrompt) {
          sessionStorage.removeItem('pending_prompt');
          setInitialPromptForStudio(pendingPrompt);
          setActiveProjectForStudio(null);
          setCurrentView('builder');
        } else {
          setCurrentView(isAdmin ? 'admin' : 'dashboard');
        }
      }
    }
  }, [isAuthenticated, isAdmin]);

  const handleStartWithPrompt = (promptText: string) => {
    setInitialPromptForStudio(promptText);
    setActiveProjectForStudio(null);
    if (isAuthenticated) {
      setCurrentView('builder');
    } else {
      sessionStorage.setItem('pending_prompt', promptText);
      setCurrentView('register');
    }
  };

  const handleOpenStudio = (project?: Project) => {
    if (project) {
      setActiveProjectForStudio(project);
      setInitialPromptForStudio('');
    } else {
      setActiveProjectForStudio(null);
      setInitialPromptForStudio('');
    }
    setCurrentView('builder');
  };

  const handleSelectPlan = (planId: 'free' | 'pro' | 'agency') => {
    if (planId === 'free') {
      if (!isAuthenticated) setCurrentView('register');
      return;
    }
    if (!isAuthenticated) {
      sessionStorage.setItem('pending_plan', planId);
      setCurrentView('register');
      return;
    }
    if (planId === 'pro') {
      setCheckoutItem({
        type: 'plan',
        id: 'pro',
        title: 'Subscrição Mensal Plano Pro Creator',
        priceUsd: 19,
        credits: 500,
        description: '500 créditos mensais renováveis, refinamento ilimitado e fila prioritária.',
      });
      setShowCheckoutModal(true);
    } else if (planId === 'agency') {
      setCheckoutItem({
        type: 'plan',
        id: 'agency',
        title: 'Subscrição Mensal Plano Agency Business',
        priceUsd: 49,
        credits: 1500,
        description: '1500 créditos mensais, projetos ilimitados e suporte VIP 24/7.',
      });
      setShowCheckoutModal(true);
    }
  };

  const handleSelectPack = (packId: string) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pending_pack', packId);
      setCurrentView('register');
      return;
    }
    if (packId === 'pack_100') {
      setCheckoutItem({
        type: 'pack',
        id: 'pack_100',
        title: 'Recarga: Pacote 100 Créditos',
        priceUsd: 9,
        credits: 100,
        description: '100 créditos avulsos que nunca expiram (~10 websites).',
      });
    } else if (packId === 'pack_300') {
      setCheckoutItem({
        type: 'pack',
        id: 'pack_300',
        title: 'Recarga: Pacote 300 Créditos',
        priceUsd: 22,
        credits: 300,
        description: '300 créditos avulsos que nunca expiram (~30 websites).',
      });
    } else if (packId === 'pack_1000') {
      setCheckoutItem({
        type: 'pack',
        id: 'pack_1000',
        title: 'Recarga: Pacote 1000 Créditos',
        priceUsd: 59,
        credits: 1000,
        description: '1000 créditos avulsos que nunca expiram (~100 websites).',
      });
    }
    setShowCheckoutModal(true);
  };

  const handleCheckoutSuccess = (newCredits: number, message: string) => {
    setPurchaseSuccessMessage(message);
    refreshUser();
    setTimeout(() => setPurchaseSuccessMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#111214] text-[#F3F4F6] flex flex-col font-sans selection:bg-brand-600 selection:text-neutral-950 relative">
      
      {/* Success purchase toast */}
      {purchaseSuccessMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-lg shadow-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{purchaseSuccessMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenStudio={() => handleOpenStudio()}
      />

      {/* Main Viewport Routing */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartWithPrompt={handleStartWithPrompt}
            onNavigate={(view) => setCurrentView(view)}
            onSelectPlan={handleSelectPlan}
            onSelectPack={handleSelectPack}
          />
        )}

        {currentView === 'register' && (
          <AuthRegister
            onSuccessCreator={() => {
              const pendingPrompt = sessionStorage.getItem('pending_prompt');
              if (pendingPrompt) {
                sessionStorage.removeItem('pending_prompt');
                setInitialPromptForStudio(pendingPrompt);
                setCurrentView('builder');
              } else {
                setCurrentView('dashboard');
              }
            }}
            onSuccessAdmin={() => setCurrentView('admin')}
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'login' && (
          <AuthLogin
            onSuccess={() => {
              const pendingPrompt = sessionStorage.getItem('pending_prompt');
              if (pendingPrompt) {
                sessionStorage.removeItem('pending_prompt');
                setInitialPromptForStudio(pendingPrompt);
                setCurrentView('builder');
              } else {
                setCurrentView(isAdmin ? 'admin' : 'dashboard');
              }
            }}
            onNavigateRegister={() => setCurrentView('register')}
          />
        )}

        {currentView === 'dashboard' && (
          <CreatorDashboard
            onOpenStudio={(project) => handleOpenStudio(project)}
            onNavigateHome={() => setCurrentView('landing')}
            onSelectPlan={handleSelectPlan}
            onSelectPack={handleSelectPack}
          />
        )}

        {currentView === 'builder' && (
          <BuilderStudio
            initialProject={activeProjectForStudio}
            initialPrompt={initialPromptForStudio}
            onBackToDashboard={() => setCurrentView(isAuthenticated ? 'dashboard' : 'landing')}
            onSelectPlan={handleSelectPlan}
            onSelectPack={handleSelectPack}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onNavigateHome={() => setCurrentView('landing')}
          />
        )}
      </main>

      {/* Footer (only show on non-studio screens) */}
      {currentView !== 'builder' && (
        <Footer
          onOpenPrivacy={() => setShowPrivacy(true)}
          onOpenTerms={() => setShowTerms(true)}
          onNavigateAdmin={() => {
            if (isAdmin) {
              setCurrentView('admin');
            } else {
              setCurrentView('login');
            }
          }}
        />
      )}

      {/* Legal & Cookie Modals */}
      <LegalModals
        showPrivacy={showPrivacy}
        showTerms={showTerms}
        onClosePrivacy={() => setShowPrivacy(false)}
        onCloseTerms={() => setShowTerms(false)}
      />

      {/* Checkout Payment Modal in USD (VISA or PayPal) */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        selectedItem={checkoutItem}
        onSuccess={handleCheckoutSuccess}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
