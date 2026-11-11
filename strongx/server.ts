import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, hashPassword, User } from './server/db.ts';
import { generateWebsiteFromPrompt, refineWebsiteCode } from './server/ai.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to extract authenticated user from Authorization header
function getAuthUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  // Simple token format: user id or admin token
  if (token.startsWith('admin_token_')) {
    return {
      id: 'admin_master',
      firstName: 'Administrador',
      lastName: 'Geral',
      email: db.getConfig().adminEmail,
      passwordHash: '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
      credits: 99999,
      accountType: 'admin',
      emailVerified: true,
    };
  }

  return db.findUserById(token) || null;
}

// Admin validation middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso administrativo não autorizado.' });
  }

  const token = authHeader.split(' ')[1];
  if (token.startsWith('admin_token_')) {
    return next();
  }

  const user = db.findUserById(token);
  if (user && user.accountType === 'admin') {
    return next();
  }

  db.addAdminLog({
    adminEmail: 'desconhecido',
    action: 'Tentativa de acesso não autorizado à rota administrativa',
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
    success: false,
    details: `Rota: ${req.originalUrl}`,
  });

  return res.status(403).json({ error: 'Privilégios administrativos insuficientes.' });
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

// Register
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, ageDemographic } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de e-mail inválido.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'As palavras-passe não coincidem.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'A palavra-passe deve ter pelo menos 8 caracteres.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Este e-mail já está registado na plataforma.' });
  }

  const newUser = db.createUser({
    firstName,
    lastName,
    email,
    password,
    accountType: 'creator',
    ageDemographic: ageDemographic || 'adult',
  });

  const { passwordHash: _, ...safeUser } = newUser;
  return res.status(201).json({
    message: 'Conta criada com sucesso! 150 créditos atribuídos.',
    token: newUser.id,
    user: safeUser,
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e palavra-passe são obrigatórios.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail ou crie uma conta.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Esta conta encontra-se suspensa pela administração.' });
  }

  const hash = hashPassword(password);
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: 'Palavra-passe incorreta.' });
  }

  db.updateUserLogin(user.id);
  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    message: 'Sessão iniciada com sucesso.',
    token: user.id,
    user: safeUser,
  });
});

// Administrator Login (Strict Server-Side Validation)
app.post('/api/auth/admin-login', (req, res) => {
  const { email, adminKey } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  const config = db.getConfig();
  const configuredAdminEmail = config.adminEmail.toLowerCase();
  const validMasterKey = process.env.STRONGX_ADMIN_KEY || 'StrongX_AdminMasterKey_2026!';

  if (!email || !adminKey) {
    return res.status(400).json({ error: 'E-mail administrativo e chave de acesso são obrigatórios.' });
  }

  if (email.trim().toLowerCase() !== configuredAdminEmail) {
    db.addAdminLog({
      adminEmail: email,
      action: 'Tentativa de login com e-mail não autorizado',
      ip,
      success: false,
    });
    return res.status(403).json({ error: 'E-mail não autorizado para acesso administrativo.' });
  }

  if (adminKey.trim() !== validMasterKey) {
    db.addAdminLog({
      adminEmail: email,
      action: 'Falha na chave de acesso administrativa',
      ip,
      success: false,
    });
    return res.status(401).json({ error: 'Chave de acesso administrativa incorreta.' });
  }

  db.addAdminLog({
    adminEmail: email,
    action: 'Login administrativo efetuado com sucesso',
    ip,
    success: true,
  });

  const adminToken = `admin_token_${Date.now()}`;
  return res.json({
    message: 'Autenticação administrativa bem-sucedida.',
    token: adminToken,
    user: {
      id: 'admin_master',
      firstName: 'Administrador',
      lastName: 'StrongX',
      email: configuredAdminEmail,
      accountType: 'admin',
      credits: 999999,
      status: 'active',
      emailVerified: true,
    },
  });
});

// Current User Profile
app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Sessão expirada ou não autenticado.' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// Password recovery simulation
app.post('/api/auth/recover-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail obrigatório.' });

  const user = db.findUserByEmail(email);
  if (!user) {
    // For security, don't disclose if email exists
    return res.json({ message: 'Se o e-mail estiver registado, foram enviadas instruções de recuperação.' });
  }

  return res.json({
    message: `Instruções de recuperação de palavra-passe foram enviadas para ${email}.`,
    recoveryTokenSimulated: true,
  });
});

// -------------------------------------------------------------
// PROJECTS & BUILDER API
// -------------------------------------------------------------

// Get user projects
app.get('/api/projects', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Não autenticado.' });

  const projects = db.getUserProjects(user.id);
  return res.json({ projects });
});

// Create/Save project
app.post('/api/projects', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Não autenticado.' });

  const { name, description, category, sourceCode } = req.body;
  if (!name || !sourceCode) {
    return res.status(400).json({ error: 'Nome e código do projeto são obrigatórios.' });
  }

  const project = db.createProject({
    ownerId: user.id,
    name,
    description: description || '',
    category: category || 'Geral',
    sourceCode,
  });

  db.addActivity({
    userId: user.id,
    action: `Projeto "${name}" guardado`,
    projectId: project.id,
    creditsDeducted: 0,
  });

  return res.status(201).json({ project });
});

// Update project
app.put('/api/projects/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Não autenticado.' });

  const existing = db.getProjectById(req.params.id);
  if (!existing || existing.ownerId !== user.id) {
    return res.status(404).json({ error: 'Projeto não encontrado ou sem permissão.' });
  }

  const updated = db.updateProject(req.params.id, req.body);
  return res.json({ project: updated });
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Não autenticado.' });

  const success = db.deleteProject(req.params.id, user.id);
  if (!success) return res.status(404).json({ error: 'Projeto não encontrado.' });

  return res.json({ message: 'Projeto eliminado com sucesso.' });
});

// -------------------------------------------------------------
// AI GENERATION & CREDITS ENGINE
// -------------------------------------------------------------

// Generate new site from prompt
app.post('/api/generate-site', async (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Inicie sessão para gerar sites.' });

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return res.status(400).json({ error: 'Introduza uma descrição detalhada do site que pretende criar.' });
  }

  const cost = db.getConfig().generationCost; // 10 credits

  // 1. Check if user has sufficient credits
  if (user.credits < cost) {
    return res.status(402).json({
      error: `Créditos insuficientes. Necessita de ${cost} créditos, mas possui atualmente ${user.credits}. Faça o upgrade do seu plano para continuar a criar sites profissionais.`,
      outOfCredits: true,
      currentCredits: user.credits,
    });
  }

  // 2. Atomically deduct credits
  const deduction = db.updateUserCredits(user.id, -cost, `Criação de site com IA: "${prompt.slice(0, 40)}..."`);
  if (!deduction.success) {
    return res.status(402).json({ error: deduction.message });
  }

  try {
    // 3. Call real Gemini 3.8 Flash model
    const generated = await generateWebsiteFromPrompt(prompt.trim());

    // 4. Save project automatically
    const project = db.createProject({
      ownerId: user.id,
      name: generated.projectName,
      description: generated.description,
      category: generated.category,
      sourceCode: {
        html: generated.html,
        css: generated.css,
        js: generated.js,
        fullCode: generated.fullCode,
      },
    });

    db.addActivity({
      userId: user.id,
      action: `Site gerado com IA: "${generated.projectName}"`,
      projectId: project.id,
      creditsDeducted: cost,
    });

    return res.json({
      success: true,
      project,
      credits: deduction.newCredits,
      creditsDeducted: cost,
    });
  } catch (error: any) {
    console.error('[AI Generation Error]', error);

    // 5. Automatic Credit Refund on failure!
    const refund = db.updateUserCredits(
      user.id,
      cost,
      'Reembolso automático: Falha no processamento da Inteligência Artificial'
    );

    db.addActivity({
      userId: user.id,
      action: 'Tentativa de geração com erro (Créditos reembolsados)',
      creditsDeducted: 0,
    });

    return res.status(500).json({
      error: error.message || 'Erro ao gerar o site com Inteligência Artificial.',
      refundedCredits: cost,
      currentCredits: refund.newCredits,
    });
  }
});

// Refine site with prompt
app.post('/api/refine-site', async (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Inicie sessão para modificar sites.' });

  const { existingCode, instruction, projectId } = req.body;
  if (!instruction || !existingCode) {
    return res.status(400).json({ error: 'Código existente e instrução de alteração são obrigatórios.' });
  }

  // Refinement cost: 5 credits
  const refineCost = 5;
  if (user.credits < refineCost) {
    return res.status(402).json({
      error: `Créditos insuficientes. A modificação requer ${refineCost} créditos. Faça o upgrade do seu plano para continuar.`,
      outOfCredits: true,
      currentCredits: user.credits,
    });
  }

  const deduction = db.updateUserCredits(user.id, -refineCost, `Refinamento de site: "${instruction.slice(0, 40)}"`);
  if (!deduction.success) {
    return res.status(402).json({ error: deduction.message });
  }

  try {
    const refined = await refineWebsiteCode(existingCode, instruction);

    if (projectId) {
      db.updateProject(projectId, {
        sourceCode: {
          html: refined.html,
          css: refined.css,
          js: refined.js,
          fullCode: refined.fullCode,
        },
      });
    }

    db.addActivity({
      userId: user.id,
      action: `Site refinado: "${instruction.slice(0, 30)}..."`,
      projectId,
      creditsDeducted: refineCost,
    });

    return res.json({
      success: true,
      refined,
      credits: deduction.newCredits,
      creditsDeducted: refineCost,
    });
  } catch (error: any) {
    // Refund on failure
    const refund = db.updateUserCredits(
      user.id,
      refineCost,
      'Reembolso automático: Falha no refinamento do site'
    );
    return res.status(500).json({
      error: error.message || 'Erro ao refinar código com IA.',
      refundedCredits: refineCost,
      currentCredits: refund.newCredits,
    });
  }
});

// Credit history
app.get('/api/credits/history', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Não autenticado.' });

  const transactions = db.getUserTransactions(user.id);
  const activities = db.getUserActivities(user.id);
  return res.json({
    credits: user.credits,
    transactions,
    activities,
  });
});

// Checkout Purchase (VISA or PayPal in USD)
app.post('/api/checkout/purchase', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Inicie sessão para efetuar pagamentos.' });

  const { itemType, itemId, paymentMethod, paymentDetails } = req.body;

  if (!itemType || !itemId || !paymentMethod) {
    return res.status(400).json({ error: 'Dados de compra incompletos.' });
  }

  if (paymentMethod !== 'visa' && paymentMethod !== 'paypal') {
    return res.status(400).json({ error: 'Método de pagamento inválido. Escolha Cartão VISA ou PayPal.' });
  }

  // Payment method validation
  if (paymentMethod === 'visa') {
    const { cardNumber, cardHolder, expiryDate, cvv } = paymentDetails || {};
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      return res.status(400).json({ error: 'Preencha todos os dados do cartão VISA (Número, Titular, Validade e CVV).' });
    }
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      return res.status(400).json({ error: 'Número de cartão VISA inválido.' });
    }
    if (cvv.length < 3 || cvv.length > 4) {
      return res.status(400).json({ error: 'Código CVV inválido (3 ou 4 dígitos).' });
    }
  } else if (paymentMethod === 'paypal') {
    const { paypalEmail } = paymentDetails || {};
    if (!paypalEmail || !paypalEmail.includes('@')) {
      return res.status(400).json({ error: 'Introduza um e-mail PayPal válido.' });
    }
  }

  // Define catalog items
  let creditsToAdd = 0;
  let amountUsd = 0;
  let details = '';
  let planId: 'free' | 'pro' | 'agency' | undefined = undefined;

  if (itemType === 'plan') {
    if (itemId === 'pro') {
      creditsToAdd = 500;
      amountUsd = 19;
      details = 'Subscrição Mensal Plano Pro Creator (+500 Créditos)';
      planId = 'pro';
    } else if (itemId === 'agency') {
      creditsToAdd = 1500;
      amountUsd = 49;
      details = 'Subscrição Mensal Plano Agency Business (+1500 Créditos)';
      planId = 'agency';
    } else {
      return res.status(400).json({ error: 'Plano selecionado não reconhecido.' });
    }
  } else if (itemType === 'pack') {
    if (itemId === 'pack_100') {
      creditsToAdd = 100;
      amountUsd = 9;
      details = 'Recarga Avulsa: Pacote de 100 Créditos';
    } else if (itemId === 'pack_300') {
      creditsToAdd = 300;
      amountUsd = 22;
      details = 'Recarga Avulsa: Pacote de 300 Créditos';
    } else if (itemId === 'pack_1000') {
      creditsToAdd = 1000;
      amountUsd = 59;
      details = 'Recarga Avulsa: Pacote de 1000 Créditos';
    } else {
      return res.status(400).json({ error: 'Pacote de créditos inválido.' });
    }
  } else {
    return res.status(400).json({ error: 'Tipo de item inválido.' });
  }

  // Atomically process transaction
  const result = db.recordPurchase({
    userId: user.id,
    creditsToAdd,
    amountUsd,
    paymentMethod,
    type: itemType === 'plan' ? 'plan_subscription' : 'credit_purchase',
    planId,
    details,
  });

  if (!result.success || !result.user) {
    return res.status(500).json({ error: result.message || 'Erro ao processar transação.' });
  }

  const { passwordHash: _, ...safeUser } = result.user;
  return res.json({
    success: true,
    message: `Pagamento de $${amountUsd} USD aprovado com sucesso via ${paymentMethod === 'visa' ? 'Cartão VISA' : 'PayPal'}! Foram adicionados ${creditsToAdd} créditos à sua conta.`,
    user: safeUser,
    newCredits: safeUser.credits,
    addedCredits: creditsToAdd,
  });
});

// -------------------------------------------------------------
// VISITOR TELEMETRY & ANALYTICS (ANONYMOUS & ETHICAL)
// -------------------------------------------------------------

app.post('/api/visitors/track', (req, res) => {
  const { country, device, browser, referrer, voluntaryAge } = req.body;

  const record = db.recordVisitor({
    anonymousId: `vis_${Math.random().toString(36).slice(2, 9)}`,
    country: country || 'Portugal',
    device: device || 'desktop',
    browser: browser || 'Chrome',
    referrer: referrer || 'Direct',
    voluntaryAge: voluntaryAge || 'unspecified',
  });

  return res.json({ tracked: true, id: record.id });
});

// -------------------------------------------------------------
// ADMIN GOVERNANCE API
// -------------------------------------------------------------

app.get('/api/admin/metrics', requireAdmin, (req, res) => {
  const users = db.getAllUsers();
  const projects = db.getAllProjects();
  const visitors = db.getVisitors();
  const transactions = db.getAllTransactions();

  const totalCreditsDistributed = transactions
    .filter(t => t.type === 'initial_grant' || (t.type === 'admin_adjustment' && t.credits > 0))
    .reduce((acc, t) => acc + t.credits, 0);

  const totalCreditsConsumed = transactions
    .filter(t => t.type === 'deduction')
    .reduce((acc, t) => acc + Math.abs(t.credits), 0);

  const completedGenerations = transactions.filter(t => t.type === 'deduction').length;
  const failedGenerations = transactions.filter(t => t.type === 'refund').length;

  return res.json({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalProjects: projects.length,
    totalVisitors: visitors.length,
    totalCreditsDistributed,
    totalCreditsConsumed,
    completedGenerations,
    failedGenerations,
    config: db.getConfig(),
  });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.getAllUsers();
  const projects = db.getAllProjects();

  const enriched = users.map(u => ({
    ...u,
    projectsCount: projects.filter(p => p.ownerId === u.id).length,
  }));

  return res.json({ users: enriched });
});

app.put('/api/admin/users/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (status !== 'active' && status !== 'suspended') {
    return res.status(400).json({ error: 'Estado inválido.' });
  }

  const ok = db.updateUserStatus(req.params.id, status);
  if (!ok) return res.status(404).json({ error: 'Utilizador não encontrado.' });

  return res.json({ success: true, message: `Estado do utilizador atualizado para ${status}.` });
});

app.post('/api/admin/users/:id/credits', requireAdmin, (req, res) => {
  const { amount, reason } = req.body;
  if (typeof amount !== 'number' || !reason) {
    return res.status(400).json({ error: 'Montante numérico e motivo obrigatórios.' });
  }

  const result = db.updateUserCredits(req.params.id, amount, `Ajuste Administrativo: ${reason}`);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  return res.json({ success: true, newCredits: result.newCredits });
});

app.get('/api/admin/visitors', requireAdmin, (req, res) => {
  const visitors = db.getVisitors();

  // Aggregate country breakdown
  const countryCounts: Record<string, number> = {};
  const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
  const browserCounts: Record<string, number> = {};
  const ageCounts: Record<string, number> = { minor: 0, youth: 0, adult: 0, unspecified: 0 };

  visitors.forEach(v => {
    countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
    if (deviceCounts[v.device] !== undefined) deviceCounts[v.device]++;
    browserCounts[v.browser] = (browserCounts[v.browser] || 0) + 1;
    if (v.voluntaryAge && ageCounts[v.voluntaryAge] !== undefined) {
      ageCounts[v.voluntaryAge]++;
    } else {
      ageCounts.unspecified++;
    }
  });

  return res.json({
    total: visitors.length,
    countries: Object.entries(countryCounts).map(([country, count]) => ({ country, count })),
    devices: deviceCounts,
    browsers: Object.entries(browserCounts).map(([browser, count]) => ({ browser, count })),
    demographics: ageCounts,
    recent: visitors.slice(-25).reverse(),
  });
});

app.get('/api/admin/health', requireAdmin, (req, res) => {
  return res.json({
    serverTime: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    databaseStatus: 'healthy',
    geminiStatus: process.env.GEMINI_API_KEY ? 'connected' : 'missing_key',
    memoryUsage: process.memoryUsage(),
    logs: db.getAdminLogs().slice(0, 30),
  });
});

app.post('/api/admin/config', requireAdmin, (req, res) => {
  const { initialCredits, generationCost, maintenanceMode } = req.body;
  db.updateConfig({
    ...(typeof initialCredits === 'number' ? { initialCredits } : {}),
    ...(typeof generationCost === 'number' ? { generationCost } : {}),
    ...(typeof maintenanceMode === 'boolean' ? { maintenanceMode } : {}),
  });
  return res.json({ success: true, config: db.getConfig() });
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC ASSETS MOUNT
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[StrongX] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
