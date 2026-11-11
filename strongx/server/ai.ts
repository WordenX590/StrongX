import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client strictly on server-side
const apiKey = process.env.GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface GeneratedSiteResult {
  projectName: string;
  description: string;
  category: string;
  html: string;
  css: string;
  js: string;
  fullCode: string;
}

export async function generateWebsiteFromPrompt(prompt: string): Promise<GeneratedSiteResult> {
  if (!ai) {
    throw new Error('Chave de API Gemini (GEMINI_API_KEY) não está configurada no servidor.');
  }

  const systemInstruction = `Você é o Engenheiro Chefe e Especialista UI/UX do StrongX, a plataforma SaaS de ponta para criação de sites profissionais.
Sua missão é gerar um website completo, moderno, esteticamente impecável e 100% funcional baseado no pedido do usuário.

REGRAS DE PRODUÇÃO:
1. Retorne APENAS um objeto JSON válido no seguinte formato:
{
  "projectName": "Nome curto e atraente do projeto",
  "description": "Breve sumário do site criado",
  "category": "E-Commerce | Tecnologia | Portfólio | Landing Page | Institucional | Educação | Blog",
  "html": "O código HTML semântico da tag <body> (ex: <header>...</header><main>...</main><footer>...</footer>)",
  "css": "Estilos CSS complementares ou animações personalizadas",
  "js": "JavaScript funcional para interatividade (menus móveis, filtros, cálculo de carrinho, modais, acordeões, formulários)",
  "fullCode": "<!DOCTYPE html><html lang='pt' class='dark'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>...</title><script src='https://cdn.tailwindcss.com'></script><link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'><style>/* css */</style></head><body class='bg-[#0A0B10] text-[#E2E8F0] antialiased'>...</body><script>/* js */</script></html>"
}

2. PADRÕES DE QUALIDADE VISUAL:
- Design Ultra-Moderno com tema escuro (Dark Tech / Obsidian / Roxo Tecnológico / Azul Marinho Profundo).
- Utilize Tailwind CSS (via CDN no fullCode).
- Tipografia elegante, espaçamento generoso, contrastes excelentes, micro-interações e transições suaves.
- O site deve conter seções completas: Barra de navegação com logotipo e links, Hero com chamada impactante e botões funcionais, Grade de recursos/produtos/serviços, Prova social/depoimentos reais, Tabela de preços ou catálogo interativo se aplicável, FAQ expansível funcional e Rodapé com links e copyright.
- O código JavaScript deve realmente manipular o DOM (ex: abrir/fechar menu mobile, tabs de categorias, formulário de contato com feedback visual em modal/toast, FAQ toggles).
- NUNCA use marcadores [Em breve] ou textos vazios. Gere copy em Português profissional, fluente e persuasivo.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: `Crie um site profissional completo para a seguinte especificação:\n\n"${prompt}"`,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
    },
  });

  const responseText = response.text || '';
  try {
    const parsed = JSON.parse(responseText);
    return {
      projectName: parsed.projectName || 'Novo Site StrongX',
      description: parsed.description || prompt.slice(0, 80),
      category: parsed.category || 'Geral',
      html: parsed.html || '',
      css: parsed.css || '',
      js: parsed.js || '',
      fullCode: parsed.fullCode || assembleFullHtml(parsed.projectName, parsed.html, parsed.css, parsed.js),
    };
  } catch (err) {
    console.error('Failed parsing JSON response from Gemini, recovering with fallback wrap', err);
    // If json parse failed, generate a wrapped page
    return fallbackWrap(prompt, responseText);
  }
}

export async function refineWebsiteCode(existingFullCode: string, instruction: string): Promise<GeneratedSiteResult> {
  if (!ai) {
    throw new Error('Chave de API Gemini (GEMINI_API_KEY) não está configurada no servidor.');
  }

  const systemInstruction = `Você é o Engenheiro Chefe do StrongX.
O utilizador já possui um website em código HTML/Tailwind/JS e solicitou uma alteração ou melhoria específica.
Sua tarefa é modificar o código existente preservando tudo o que não foi pedido para mudar, e aplicando a nova instrução com precisão cirúrgica.

Retorne APENAS um objeto JSON no formato:
{
  "projectName": "Nome atualizado do projeto",
  "description": "Breve sumário das alterações efetuadas",
  "category": "Categoria do site",
  "html": "O código HTML semântico da tag <body> atualizado",
  "css": "Estilos CSS complementares atualizados",
  "js": "JavaScript funcional atualizado",
  "fullCode": "O documento HTML completo atualizado com <!DOCTYPE html>..."
}`;

  const promptContent = `INSTRUÇÃO DE MODIFICAÇÃO DO UTILIZADOR:
"${instruction}"

CÓDIGO ATUAL DO WEBSITE:
\`\`\`html
${existingFullCode.slice(0, 30000)}
\`\`\`
Aplique a alteração solicitada mantendo a alta qualidade visual e responsiva.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: promptContent,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
    },
  });

  const responseText = response.text || '';
  try {
    const parsed = JSON.parse(responseText);
    return {
      projectName: parsed.projectName || 'Site Atualizado StrongX',
      description: parsed.description || `Alteração: ${instruction}`,
      category: parsed.category || 'Personalizado',
      html: parsed.html || '',
      css: parsed.css || '',
      js: parsed.js || '',
      fullCode: parsed.fullCode || assembleFullHtml(parsed.projectName, parsed.html, parsed.css, parsed.js),
    };
  } catch (err) {
    console.error('Failed parsing refinement JSON, preserving and applying fallback', err);
    return fallbackWrap(instruction, responseText);
  }
}

function assembleFullHtml(title: string, html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html lang="pt" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'StrongX Generated Site'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    ${css}
  </style>
</head>
<body class="bg-[#090A0F] text-[#E2E8F0] antialiased selection:bg-purple-600 selection:text-white">
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>`;
}

function fallbackWrap(prompt: string, text: string): GeneratedSiteResult {
  const cleanCode = text.replace(/```html/g, '').replace(/```json/g, '').replace(/```/g, '').trim();
  return {
    projectName: 'Projeto StrongX AI',
    description: prompt.slice(0, 100),
    category: 'Geral',
    html: `<div class="p-8 max-w-4xl mx-auto"><h1 class="text-3xl font-bold mb-4">Projeto Gerado</h1><p class="text-slate-400 mb-6">${prompt}</p></div>`,
    css: '',
    js: '',
    fullCode: cleanCode.includes('<!DOCTYPE html>') ? cleanCode : assembleFullHtml('Projeto StrongX', cleanCode, '', ''),
  };
}
