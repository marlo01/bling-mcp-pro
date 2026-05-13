import { mcp } from './server.js';
import { logger } from './utils/logger.js';

const TRANSPORT = (process.env.MCP_TRANSPORT || 'stdio').toLowerCase();

async function startServer(): Promise<void> {
  if (TRANSPORT === 'sse' || TRANSPORT === 'http') {
    const port = parseInt(process.env.MCP_PORT || '4545', 10);
    const endpoint = process.env.MCP_ENDPOINT || '/sse';

    logger.info('Iniciando servidor em modo HTTP/SSE', { port, endpoint });

    await mcp.start({
      transportType: 'sse',
      sse: { endpoint: endpoint as `/${string}`, port },
    });
  } else {
    logger.info('Iniciando servidor em modo stdio (Claude Desktop)');
    await mcp.start({ transportType: 'stdio' });
  }
}

startServer().catch((error) => {
  logger.error('Falha fatal ao iniciar servidor', {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});

// Encerramento limpo
process.on('SIGINT', () => {
  logger.info('Recebido SIGINT, encerrando...');
  process.exit(0);
});
process.on('SIGTERM', () => {
  logger.info('Recebido SIGTERM, encerrando...');
  process.exit(0);
});

export { mcp };
