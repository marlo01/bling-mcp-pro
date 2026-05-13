import { FastMCP } from 'fastmcp';
import { timingSafeEqual } from 'crypto';
import { config, validateConfig } from './config/index.js';
import { registerTools } from './tools/index.js';
import { logger } from './utils/logger.js';

try {
  validateConfig();
} catch (error) {
  logger.error('Falha na validação da configuração', {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
}

/**
 * Comparação em tempo constante para evitar timing attacks ao validar tokens.
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

interface MinimalRequest {
  headers: Record<string, string | string[] | undefined>;
}

function authenticateRequest(request: MinimalRequest): void {
  const expected = config.mcpAuthToken as string;
  const headerValue = request.headers.authorization || request.headers.Authorization;
  const auth = Array.isArray(headerValue) ? headerValue[0] : headerValue || '';
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
  const provided = match ? match[1] : '';
  if (!provided || !safeEqual(provided, expected)) {
    logger.warn('Tentativa de acesso SSE/HTTP rejeitada (token inválido)');
    throw new Response(null, { status: 401, statusText: 'Unauthorized' });
  }
}

const mcpOptions: Record<string, unknown> = {
  name: 'Bling MCP Pro',
  version: '2.1.0',
};

if (config.mcpTransport === 'sse' || config.mcpTransport === 'http') {
  mcpOptions.authenticate = async (request: MinimalRequest): Promise<undefined> => {
    authenticateRequest(request);
    return undefined;
  };
  logger.info('Autenticação Bearer ativada para transporte de rede');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mcp = new FastMCP<undefined>(mcpOptions as any);

registerTools(mcp);

logger.info('Servidor Bling MCP Pro inicializado', {
  toolsRegistradas: '45+',
  ambiente: process.env.NODE_ENV || 'development',
  transporte: config.mcpTransport,
});

export { mcp };
