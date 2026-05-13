import { logger } from '../../utils/logger.js';
import { blingClient } from '../blingClient.js';
import { handleApiError } from '../../utils/errorHandler.js';

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

export async function listarContasContabeis(params?: ListarContasContabeisParams): Promise<{ data: ContaContabil[] }> {
  try {
    const response = await blingClient.get('/contas-contabeis', { params });
    return { data: response.data.data as ContaContabil[] };
  } catch (error) {
    handleApiError(error, 'listarContasContabeis', params);
    return { data: [] };
  }
}
