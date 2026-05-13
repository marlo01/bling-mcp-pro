import dotenv from 'dotenv';

dotenv.config();

export interface BlingConfig {
  apiUrl: string;
  token: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  mcpTransport: 'stdio' | 'sse' | 'http';
  mcpAuthToken?: string;
}

function validateToken(token: string): void {
  if (!token) return;
  if (token.length < 20) {
    throw new Error('BLING_TOKEN parece inválido (muito curto). Verifique a configuração.');
  }
  if (/\s/.test(token)) {
    throw new Error('BLING_TOKEN contém espaços. Remova-os.');
  }
}

function parseTransport(value: string | undefined): 'stdio' | 'sse' | 'http' {
  const v = (value || 'stdio').toLowerCase();
  if (v === 'stdio' || v === 'sse' || v === 'http') return v;
  throw new Error(
    `MCP_TRANSPORT inválido: "${value}". Use stdio, sse ou http.`,
  );
}

export const config: BlingConfig = {
  apiUrl: process.env.BLING_API_URL || 'https://www.bling.com.br/Api/v3',
  token: process.env.BLING_TOKEN || '',
  clientId: process.env.BLING_CLIENT_ID,
  clientSecret: process.env.BLING_CLIENT_SECRET,
  refreshToken: process.env.BLING_REFRESH_TOKEN,
  mcpTransport: parseTransport(process.env.MCP_TRANSPORT),
  mcpAuthToken: process.env.MCP_AUTH_TOKEN,
};

/**
 * Valida a configuração e aborta se estiver inadequada.
 * Chamar na inicialização do servidor.
 */
export function validateConfig(): void {
  if (!config.token) {
    throw new Error(
      'BLING_TOKEN não configurado. ' +
        'Defina a variável de ambiente BLING_TOKEN com seu access_token do Bling.',
    );
  }
  validateToken(config.token);

  if (!config.apiUrl.startsWith('https://')) {
    throw new Error('BLING_API_URL deve usar HTTPS por segurança.');
  }

  // Em modo de rede, exigir token de autenticação para o endpoint MCP.
  // Sem isso, qualquer pessoa com acesso à URL controla todas as ferramentas.
  if (config.mcpTransport === 'sse' || config.mcpTransport === 'http') {
    if (!config.mcpAuthToken) {
      throw new Error(
        'MCP_AUTH_TOKEN é obrigatório quando MCP_TRANSPORT=sse|http. ' +
          'Gere um valor secreto (ex: openssl rand -hex 32) e configure no .env.',
      );
    }
    if (config.mcpAuthToken.length < 32) {
      throw new Error(
        'MCP_AUTH_TOKEN deve ter pelo menos 32 caracteres para resistir a brute force.',
      );
    }
  }
}

export default config;
