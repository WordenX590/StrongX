import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
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

export interface VisitorRecord {
  id: string;
  anonymousId: string;
  country: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  referrer: string;
  visitedAt: string;
  voluntaryAge?: 'minor' | 'youth' | 'adult' | 'unspecified';
}

export interface AdminLog {
  id: string;
  adminEmail: string;
  action: string;
  ip?: string;
  success: boolean;
  timestamp: string;
  details?: string;
}

export interface PlatformConfig {
  initialCredits: number;
  generationCost: number;
  adminEmail: string;
  maintenanceMode: boolean;
}

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  activities: ActivityLog[];
  transactions: Transaction[];
  visitors: VisitorRecord[];
  adminLogs: AdminLog[];
  config: PlatformConfig;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'strongx-store.json');

// Helper to hash passwords securely with salt
export function hashPassword(password: string): string {
  const salt = 'strongx_sec_salt_2026';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.load();
    this.seedDefaults();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Failed reading db file, re-initializing', err);
    }

    return {
      users: [],
      projects: [],
      activities: [],
      transactions: [],
      visitors: [],
      adminLogs: [],
      config: {
        initialCredits: 150,
        generationCost: 10,
        adminEmail: 'flatthedragon@gmail.com',
        maintenanceMode: false,
      },
    };
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving data', err);
    }
  }

  private seedDefaults() {
    // Seed initial demo data for realistic analytics if completely empty
    if (this.data.visitors.length === 0) {
      const sampleCountries = ['Portugal', 'Brasil', 'Espanha', 'Reino Unido', 'França', 'Alemanha', 'Estados Unidos'];
      const devices: ('desktop' | 'mobile' | 'tablet')[] = ['desktop', 'desktop', 'desktop', 'mobile', 'mobile', 'tablet'];
      const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
      const demographics: ('minor' | 'youth' | 'adult')[] = ['youth', 'adult', 'adult', 'youth', 'adult', 'minor'];

      for (let i = 0; i < 48; i++) {
        const date = new Date(Date.now() - (48 - i) * 3600 * 1000 * 5).toISOString();
        this.data.visitors.push({
          id: `vis_${crypto.randomUUID().slice(0, 8)}`,
          anonymousId: `anon_${Math.floor(Math.random() * 10000)}`,
          country: sampleCountries[i % sampleCountries.length],
          device: devices[i % devices.length],
          browser: browsers[i % browsers.length],
          referrer: i % 2 === 0 ? 'https://google.com' : 'Direct',
          visitedAt: date,
          voluntaryAge: demographics[i % demographics.length],
        });
      }
      this.save();
    }
  }

  // --- Users ---
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getAllUsers(): Omit<User, 'passwordHash'>[] {
    return this.data.users.map(({ passwordHash: _, ...rest }) => rest);
  }

  createUser(params: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    accountType?: 'creator' | 'admin';
    ageDemographic?: 'minor' | 'youth' | 'adult';
  }): User {
    const newUser: User = {
      id: `usr_${crypto.randomUUID().slice(0, 8)}`,
      firstName: params.firstName.trim(),
      lastName: params.lastName.trim(),
      email: params.email.trim().toLowerCase(),
      passwordHash: hashPassword(params.password),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
      credits: this.data.config.initialCredits,
      accountType: params.accountType || 'creator',
      emailVerified: true,
      ageDemographic: params.ageDemographic,
      plan: 'free',
    };

    this.data.users.push(newUser);

    // Record initial transaction
    this.addTransaction({
      userId: newUser.id,
      credits: newUser.credits,
      type: 'initial_grant',
      reason: 'Bónus de boas-vindas: 150 créditos iniciais',
    });

    this.addActivity({
      userId: newUser.id,
      action: 'Conta criada com sucesso',
      creditsDeducted: 0,
    });

    this.save();
    return newUser;
  }

  updateUserLogin(userId: string) {
    const user = this.findUserById(userId);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      this.save();
    }
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended'): boolean {
    const user = this.findUserById(userId);
    if (user) {
      user.status = status;
      this.save();
      return true;
    }
    return false;
  }

  updateUserCredits(userId: string, delta: number, reason: string): { success: boolean; newCredits: number; message?: string } {
    const user = this.findUserById(userId);
    if (!user) return { success: false, newCredits: 0, message: 'Utilizador não encontrado' };

    if (delta < 0 && user.credits < Math.abs(delta)) {
      return { success: false, newCredits: user.credits, message: 'Saldo de créditos insuficiente' };
    }

    user.credits += delta;

    this.addTransaction({
      userId: user.id,
      credits: delta,
      type: delta < 0 ? 'deduction' : delta === 10 ? 'refund' : 'admin_adjustment',
      reason,
    });

    this.save();
    return { success: true, newCredits: user.credits };
  }

  recordPurchase(params: {
    userId: string;
    creditsToAdd: number;
    amountUsd: number;
    paymentMethod: 'visa' | 'paypal';
    type: 'plan_subscription' | 'credit_purchase';
    planId?: 'free' | 'pro' | 'agency';
    details: string;
  }): { success: boolean; user?: User; message?: string } {
    const user = this.findUserById(params.userId);
    if (!user) return { success: false, message: 'Utilizador não encontrado.' };

    user.credits += params.creditsToAdd;
    if (params.planId) {
      user.plan = params.planId;
    }

    const txReason = `${params.details} ($${params.amountUsd} USD via ${params.paymentMethod.toUpperCase()})`;
    this.addTransaction({
      userId: user.id,
      credits: params.creditsToAdd,
      type: params.type,
      reason: txReason,
    });

    this.addActivity({
      userId: user.id,
      action: `Pagamento concluído: +${params.creditsToAdd} créditos (${params.details})`,
      creditsDeducted: 0,
    });

    this.save();
    return { success: true, user };
  }

  // --- Transactions ---
  addTransaction(tx: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const item: Transaction = {
      id: `tx_${crypto.randomUUID().slice(0, 10)}`,
      timestamp: new Date().toISOString(),
      ...tx,
    };
    this.data.transactions.unshift(item);
    this.save();
    return item;
  }

  getUserTransactions(userId: string): Transaction[] {
    return this.data.transactions.filter(t => t.userId === userId);
  }

  getAllTransactions(): Transaction[] {
    return this.data.transactions;
  }

  // --- Projects ---
  createProject(params: {
    ownerId: string;
    name: string;
    description: string;
    category?: string;
    sourceCode: { html: string; css: string; js: string; fullCode: string };
  }): Project {
    const project: Project = {
      id: `proj_${crypto.randomUUID().slice(0, 8)}`,
      ownerId: params.ownerId,
      name: params.name,
      description: params.description,
      category: params.category || 'Geral',
      sourceCode: params.sourceCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
    };
    this.data.projects.unshift(project);
    this.save();
    return project;
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const p = this.data.projects.find(item => item.id === id);
    if (p) {
      Object.assign(p, updates, { updatedAt: new Date().toISOString() });
      this.save();
      return p;
    }
    return undefined;
  }

  deleteProject(id: string, ownerId: string): boolean {
    const idx = this.data.projects.findIndex(p => p.id === id && p.ownerId === ownerId);
    if (idx !== -1) {
      this.data.projects.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  getUserProjects(ownerId: string): Project[] {
    return this.data.projects.filter(p => p.ownerId === ownerId);
  }

  getProjectById(id: string): Project | undefined {
    return this.data.projects.find(p => p.id === id);
  }

  getAllProjects(): Project[] {
    return this.data.projects;
  }

  // --- Activities ---
  addActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const item: ActivityLog = {
      id: `act_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      ...activity,
    };
    this.data.activities.unshift(item);
    if (this.data.activities.length > 500) {
      this.data.activities.pop();
    }
    this.save();
  }

  getUserActivities(userId: string): ActivityLog[] {
    return this.data.activities.filter(a => a.userId === userId);
  }

  // --- Visitors ---
  recordVisitor(record: Omit<VisitorRecord, 'id' | 'visitedAt'>): VisitorRecord {
    const item: VisitorRecord = {
      id: `vis_${crypto.randomUUID().slice(0, 8)}`,
      visitedAt: new Date().toISOString(),
      ...record,
    };
    this.data.visitors.push(item);
    if (this.data.visitors.length > 2000) {
      this.data.visitors.shift();
    }
    this.save();
    return item;
  }

  getVisitors(): VisitorRecord[] {
    return this.data.visitors;
  }

  // --- Admin Logs ---
  addAdminLog(log: Omit<AdminLog, 'id' | 'timestamp'>) {
    const item: AdminLog = {
      id: `adm_log_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.data.adminLogs.unshift(item);
    this.save();
  }

  getAdminLogs(): AdminLog[] {
    return this.data.adminLogs;
  }

  // --- Config ---
  getConfig(): PlatformConfig {
    return this.data.config;
  }

  updateConfig(updates: Partial<PlatformConfig>) {
    this.data.config = { ...this.data.config, ...updates };
    this.save();
  }
}

export const db = new Database();
