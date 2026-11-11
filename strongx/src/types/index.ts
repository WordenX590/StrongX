export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  status: 'active' | 'suspended';
  credits: number;
  accountType: 'creator' | 'admin';
  emailVerified: boolean;
  ageDemographic?: 'minor' | 'youth' | 'adult';
  plan?: 'free' | 'pro' | 'agency';
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  sourceCode: {
    html: string;
    css: string;
    js: string;
    fullCode: string;
  };
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  projectId?: string;
  creditsDeducted: number;
  timestamp: string;
}

export interface Transaction {
  id: string;
  userId: string;
  credits: number;
  type: 'initial_grant' | 'deduction' | 'refund' | 'admin_adjustment' | 'credit_purchase' | 'plan_subscription';
  reason: string;
  timestamp: string;
}

export interface PricingPlan {
  id: 'free' | 'pro' | 'agency';
  name: string;
  priceUsd: number;
  period: string;
  credits: number;
  sitesEstimate: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface CreditPack {
  id: string;
  credits: number;
  priceUsd: number;
  sitesEstimate: number;
  description: string;
  popular?: boolean;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalVisitors: number;
  totalCreditsDistributed: number;
  totalCreditsConsumed: number;
  completedGenerations: number;
  failedGenerations: number;
  config: {
    initialCredits: number;
    generationCost: number;
    adminEmail: string;
    maintenanceMode: boolean;
  };
}

export interface VisitorAnalytics {
  total: number;
  countries: { country: string; count: number }[];
  devices: { desktop: number; mobile: number; tablet: number };
  browsers: { browser: string; count: number }[];
  demographics: { minor: number; youth: number; adult: number; unspecified: number };
  recent: Array<{
    id: string;
    country: string;
    device: string;
    browser: string;
    visitedAt: string;
  }>;
}

export interface SystemHealth {
  serverTime: string;
  uptimeSeconds: number;
  databaseStatus: string;
  geminiStatus: string;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  logs: Array<{
    id: string;
    adminEmail: string;
    action: string;
    ip?: string;
    success: boolean;
    timestamp: string;
    details?: string;
  }>;
}
