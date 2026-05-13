import { FastMCP } from 'fastmcp';
import { validateConfig } from './config/index.js';
import { registerTools } from './tools/index.js';
import { logger } from './utils/logger.js';

// Validar configuração antes de inicializar
try {
  validateConfig();
} catch (error) {
  logger.error('Falha na validação da configuração', {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
}

const mcp = new FastMCP({
  name: 'Bling MCP Pro',
  version: '2.0.0',
});

registerTools(mcp);

logger.info('Servidor Bling MCP Pro inicializado', {
  toolsRegistradas: '45+',
  ambiente: process.env.NODE_ENV || 'development',
});

export { mcp };
