import { Project, Transaction, ActivityLog, AdminMetrics, VisitorAnalytics, SystemHealth, User } from '../types';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('strongx_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    ageDemographic?: string;
  }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao criar conta.');
    return json;
  },

  async login(credentials: { email: string; password: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao iniciar sessão.');
    return json;
  },

  async adminLogin(credentials: { email: string; adminKey: string }) {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Acesso administrativo recusado.');
    return json;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Sessão inválida');
    return json;
  },

  async recoverPassword(email: string) {
    const res = await fetch('/api/auth/recover-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  // Projects
  async getProjects(): Promise<{ projects: Project[] }> {
    const res = await fetch('/api/projects', { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao carregar projetos');
    return json;
  },

  async saveProject(projectData: Partial<Project>): Promise<{ project: Project }> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(projectData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao guardar projeto');
    return json;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<{ project: Project }> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao atualizar projeto');
    return json;
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Erro ao eliminar projeto');
    }
  },

  // AI Site Generation
  async generateSite(prompt: string): Promise<{
    success: boolean;
    project: Project;
    credits: number;
    creditsDeducted: number;
  }> {
    const res = await fetch('/api/generate-site', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Erro na geração com Inteligência Artificial');
    }
    return json;
  },

  async refineSite(data: {
    existingCode: string;
    instruction: string;
    projectId?: string;
  }): Promise<{
    success: boolean;
    refined: {
      projectName: string;
      description: string;
      category: string;
      html: string;
      css: string;
      js: string;
      fullCode: string;
    };
    credits: number;
  }> {
    const res = await fetch('/api/refine-site', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Erro ao refinar código com IA');
    }
    return json;
  },

  // Credits & History
  async getCreditHistory(): Promise<{
    credits: number;
    transactions: Transaction[];
    activities: ActivityLog[];
  }> {
    const res = await fetch('/api/credits/history', { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao carregar histórico');
    return json;
  },

  // Checkout & Upgrade
  async checkoutPurchase(data: {
    itemType: 'plan' | 'pack';
    itemId: string;
    paymentMethod: 'visa' | 'paypal';
    paymentDetails: any;
  }): Promise<{
    success: boolean;
    message: string;
    user: User;
    newCredits: number;
    addedCredits: number;
  }> {
    const res = await fetch('/api/checkout/purchase', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao processar pagamento.');
    return json;
  },

  // Visitor Tracking
  async trackVisitor(data: {
    country?: string;
    device?: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    referrer?: string;
    voluntaryAge?: string;
  }) {
    try {
      await fetch('/api/visitors/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // Non-blocking telemetry
    }
  },

  // Admin API
  async getAdminMetrics(): Promise<AdminMetrics> {
    const res = await fetch('/api/admin/metrics', { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Acesso negado às métricas');
    return json;
  },

  async getAdminUsers(): Promise<{ users: (User & { projectsCount: number })[] }> {
    const res = await fetch('/api/admin/users', { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao obter utilizadores');
    return json;
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended') {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao alterar estado');
    return json;
  },

  async adjustUserCredits(userId: string, amount: number, reason: string) {
    const res = await fetch(`/api/admin/users/${userId}/credits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao ajustar créditos');
    return json;
  },

  async getAdminVisitors(): Promise<VisitorAnalytics> {
    const res = await fetch('/api/admin/visitors', { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao obter visitantes');
    return json;
  },

  async getAdminHealth(): Promise<SystemHealth> {
    const res = await fetch('/api/admin/health', { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao obter estado do sistema');
    return json;
  },

  async updateConfig(updates: { initialCredits?: number; generationCost?: number; maintenanceMode?: boolean }) {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao atualizar configurações');
    return json;
  },
};
