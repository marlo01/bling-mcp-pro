import { AxiosError } from 'axios';
import { logger, redactValue } from './logger.js';

/**
 * Trata erros da API do Bling de forma segura.
 * Loga internamente (com redação) e retorna mensagem limpa para o LLM.
 */
export function handleApiError(
  error: unknown,
  funcName: string,
  params: unknown = {},
): Error {
  logger.error(`Erro em ${funcName}`, {
    params: redactValue(params),
    errorType: error instanceof Error ? error.constructor.name : typeof error,
  });

  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    const data = error.response.data as { error?: { description?: string } };

    logger.debug(`Detalhes do erro ${status}`, { data });

    switch (status) {
      case 400: return new Error(`Requisição inválida: ${data?.error?.description || 'verifique os parâmetros'}`);
      case 401: return new Error('Não autorizado: token inválido ou expirado');
      case 403: return new Error('Acesso negado: sem permissão para esta operação');
      case 404: return new Error('Recurso não encontrado no Bling');
      case 422: return new Error(`Dados inválidos: ${data?.error?.description || 'verifique os campos'}`);
      case 429: return new Error('Limite de requisições atingido. Aguarde alguns segundos.');
      case 500:
      case 502:
      case 503: return new Error('Bling temporariamente indisponível. Tente novamente.');
      default: return new Error(`Erro ${status} na API do Bling`);
    }
  }

  if (error instanceof Error) return new Error(`Erro em ${funcName}: ${error.message}`);
  return new Error(`Erro desconhecido em ${funcName}`);
}
