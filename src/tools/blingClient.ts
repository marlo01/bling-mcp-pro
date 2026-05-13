import axios, { AxiosInstance } from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { rateLimit } from '../utils/rateLimit.js';

/**
 * Cliente HTTP para a API do Bling.
 *
 * Recursos:
 * - Rate limiting automático antes de cada requisição
 * - Renovação automática de token em caso de 401 (com retry limitado)
 * - Persistência do refresh_token rotacionado em arquivo .env
 * - Logs sanitizados (tokens nunca aparecem em log)
 * - Timeout configurável
 */

export const blingClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${config.token}`,
    'Content-Type': 'application/json',
  },
});

// Aplicar rate limit antes de cada requisição
blingClient.interceptors.request.use(async (req) => {
  await rateLimit();
  return req;
});

/**
 * Persiste o novo refresh_token no arquivo .env (se existir).
 * Sobrevive a restarts do servidor. Falhas são logadas mas não impedem
 * a renovação em memória.
 */
async function persistRefreshToken(novoRefreshToken: string): Promise<void> {
  const envPath = process.env.BLING_ENV_FILE || path.resolve(process.cwd(), '.env');
  let conteudo: string;
  try {
    conteudo = await fs.readFile(envPath, 'utf8');
  } catch {
    // Arquivo .env ausente (ex: variáveis vindas só do ambiente): nada a persistir
    logger.debug('Arquivo .env não encontrado; refresh_token mantido apenas em memória');
    return;
  }

  const linhas = conteudo.split(/\r?\n/);
  let encontrou = false;
  const novasLinhas = linhas.map((linha) => {
    if (/^\s*BLING_REFRESH_TOKEN\s*=/.test(linha)) {
      encontrou = true;
      return `BLING_REFRESH_TOKEN=${novoRefreshToken}`;
    }
    return linha;
  });
  if (!encontrou) novasLinhas.push(`BLING_REFRESH_TOKEN=${novoRefreshToken}`);

  try {
    await fs.writeFile(envPath, novasLinhas.join('\n'), { mode: 0o600 });
    logger.info('refresh_token rotacionado persistido em .env');
  } catch (e) {
    logger.warn('Falha ao persistir refresh_token no .env', {
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

// Deduplicação de renovações concorrentes (race protection em modo SSE)
let renovacaoEmAndamento: Promise<string> | null = null;

/**
 * Renova o access_token usando refresh_token (OAuth2).
 * Concorrência: múltiplas chamadas paralelas compartilham a mesma renovação.
 */
export async function renovarToken(): Promise<string> {
  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new Error(
      'Credenciais OAuth incompletas. Configure BLING_CLIENT_ID, BLING_CLIENT_SECRET e BLING_REFRESH_TOKEN.',
    );
  }

  if (renovacaoEmAndamento) return renovacaoEmAndamento;

  renovacaoEmAndamento = (async (): Promise<string> => {
    logger.info('Renovando access_token');

    const credenciais = Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
    ).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', config.refreshToken as string);

    try {
      const response = await axios.post(
        'https://www.bling.com.br/Api/v3/oauth/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credenciais}`,
          },
          timeout: 15000,
        },
      );

      const novoToken = response.data.access_token;
      if (!novoToken) {
        throw new Error('Resposta inválida: access_token ausente');
      }

      blingClient.defaults.headers.Authorization = `Bearer ${novoToken}`;
      config.token = novoToken;
      if (response.data.refresh_token) {
        config.refreshToken = response.data.refresh_token;
        await persistRefreshToken(response.data.refresh_token);
      }

      logger.info('access_token renovado com sucesso');
      return novoToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Falha ao renovar token', {
          status: error.response?.status,
        });
        throw new Error(
          `Falha ao renovar token (HTTP ${error.response?.status}). ` +
            'Verifique se o refresh_token ainda é válido.',
        );
      }
      throw error;
    }
  })().finally(() => {
    renovacaoEmAndamento = null;
  });

  return renovacaoEmAndamento;
}

/**
 * Executa uma operação com retry automático em caso de 401.
 * Limite estrito de tentativas para impedir recursão infinita.
 *
 * @param operation Função que executa a chamada à API.
 * @param funcName Nome da função para logs.
 * @param maxRetries Número máximo de retries após renovação (padrão: 1).
 */
export async function withTokenRefresh<T>(
  operation: () => Promise<T>,
  funcName: string,
  maxRetries = 1,
): Promise<T> {
  let tentativa = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      const ehAuthError =
        axios.isAxiosError(error) && error.response?.status === 401;
      if (!ehAuthError || tentativa >= maxRetries) throw error;

      tentativa += 1;
      logger.warn(
        `Token expirado em ${funcName}, renovando (tentativa ${tentativa}/${maxRetries})`,
      );
      try {
        await renovarToken();
      } catch (renewError) {
        logger.error(`Não foi possível renovar token em ${funcName}`, {
          message: renewError instanceof Error ? renewError.message : String(renewError),
        });
        throw renewError;
      }
    }
  }
}
