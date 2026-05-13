import axios, { AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { rateLimit } from '../utils/rateLimit.js';

/**
 * Cliente HTTP para a API do Bling.
 *
 * Recursos:
 * - Rate limiting automático antes de cada requisição
 * - Renovação automática de token em caso de 401 (com retry)
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

// Interceptor: aplicar rate limit antes de cada requisição
blingClient.interceptors.request.use(async (req) => {
  await rateLimit();
  return req;
});

/**
 * Renova o access_token usando refresh_token (OAuth2).
 * Não loga o token completo em nenhum momento.
 */
export async function renovarToken(): Promise<string> {
  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new Error(
      'Credenciais OAuth incompletas. Configure BLING_CLIENT_ID, BLING_CLIENT_SECRET e BLING_REFRESH_TOKEN.',
    );
  }

  logger.info('Renovando access_token');

  const credenciais = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString('base64');

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', config.refreshToken);

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

    // Atualizar cliente em memória
    blingClient.defaults.headers.Authorization = `Bearer ${novoToken}`;
    // Atualizar config para próximas renovações
    config.token = novoToken;
    if (response.data.refresh_token) {
      config.refreshToken = response.data.refresh_token;
    }

    logger.info('access_token renovado com sucesso');
    return novoToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Falha ao renovar token', {
        status: error.response?.status,
        // Não logar response.data — pode conter detalhes sensíveis
      });
      throw new Error(
        `Falha ao renovar token (HTTP ${error.response?.status}). ` +
          'Verifique se o refresh_token ainda é válido.',
      );
    }
    throw error;
  }
}

/**
 * Helper: executa uma requisição com retry automático em caso de 401.
 * Tenta renovar o token e refazer a requisição uma única vez.
 */
export async function withTokenRefresh<T>(
  operation: () => Promise<T>,
  funcName: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logger.warn(`Token expirado em ${funcName}, tentando renovar`);
      try {
        await renovarToken();
        return await operation();
      } catch (renewError) {
        logger.error(`Falha ao renovar token em ${funcName}`);
        throw renewError;
      }
    }
    throw error;
  }
}
