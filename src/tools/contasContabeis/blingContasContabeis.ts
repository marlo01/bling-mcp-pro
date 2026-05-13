import { logger } from '../../utils/logger.js';
import { blingClient, withTokenRefresh } from '../blingClient.js';

export interface ContaContabil {
  id: number;
  descricao: string;
  tipo: 'banco' | 'caixa' | 'conta-bancaria' | 'integracao-pagamento';
  aliasIntegracao?: string;
}

export interface ListarContasContabeisParams {
  pagina?: number;
  limite?: number;
  ocultarInvisiveis?: boolean;
  ocultarTipoContaBancaria?: boolean;
}

export async function listarContasContabeis(
  params?: ListarContasContabeisParams,
): Promise<{ data: ContaContabil[] }> {
  logger.debug('Listando contas contábeis', { params });
  return withTokenRefresh(async () => {
    const response = await blingClient.get('/contas-contabeis', { params });
    return { data: response.data.data as ContaContabil[] };
  }, 'listarContasContabeis');
}
