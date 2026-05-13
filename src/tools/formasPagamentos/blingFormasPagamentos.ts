import { logger } from '../../utils/logger.js';
import { blingClient, renovarToken } from '../blingClient.js';
import axios from 'axios';

// Interface baseada no schema FormasPagamentosDadosBaseDTO
export interface FormaPagamento {
  id?: number;
  descricao: string;
  tipoPagamento: number; // 1=Dinheiro, 2=Cheque, ...
  finalidade: number; // 1=Pagamentos, 2=Recebimentos, 3=Ambos
  situacao?: number; // 0=Inativa, 1=Ativa
  padrao?: number; // 0=Não, 1=Padrão, 2=Padrão devolução
  fixa?: boolean;
}

export interface ListarFormasPagamentosParams {
  pagina?: number;
  limite?: number;
  descricao?: string;
  situacao?: number;
  tipoPagamento?: number;
  finalidade?: number;
}

/**
 * Lista as formas de pagamento cadastradas no Bling
 */
export async function listarFormasPagamentos(params?: ListarFormasPagamentosParams): Promise<FormaPagamento[]> {
  try {
    logger.debug('Listando formas de pagamento', params);
    const response = await blingClient.get('/formas-pagamentos', { params });
    return response.data.data as FormaPagamento[];
  } catch (error) {
    return handleApiError(error, 'listarFormasPagamentos', params);
  }
}

/**
 * Obtém uma forma de pagamento pelo ID
 */
export async function obterFormaPagamento(id: number | string): Promise<FormaPagamento> {
  try {
    logger.debug('Obtendo forma de pagamento', id);
    const response = await blingClient.get(`/formas-pagamentos/${id}`);
    return response.data.data as FormaPagamento;
  } catch (error) {
    return handleApiError(error, 'obterFormaPagamento', { id });
  }
}

/**
 * Cria uma nova forma de pagamento
 */
export async function criarFormaPagamento(forma: Omit<FormaPagamento, 'id' | 'fixa'>): Promise<FormaPagamento> {
  try {
    logger.debug('Criando forma de pagamento', forma);
    const response = await blingClient.post('/formas-pagamentos', forma);
    return response.data.data as FormaPagamento;
  } catch (error) {
    return handleApiError(error, 'criarFormaPagamento', forma);
  }
}

/**
 * Atualiza uma forma de pagamento existente
 */
export async function atualizarFormaPagamento(id: number | string, forma: Partial<FormaPagamento>): Promise<FormaPagamento> {
  try {
    logger.debug('Atualizando forma de pagamento', id, forma);
    const response = await blingClient.put(`/formas-pagamentos/${id}`, forma);
    return response.data.data as FormaPagamento;
  } catch (error) {
    return handleApiError(error, 'atualizarFormaPagamento', { id, forma });
  }
}

/**
 * Remove uma forma de pagamento pelo ID
 */
export async function excluirFormaPagamento(id: number | string): Promise<void> {
  try {
    logger.debug('Excluindo forma de pagamento', id);
    await blingClient.delete(`/formas-pagamentos/${id}`);
    logger.debug('Forma de pagamento excluída com sucesso');
  } catch (error) {
    return handleApiError(error, 'excluirFormaPagamento', { id });
  }
}

// Tratamento centralizado de erro e renovação de token
async function handleApiError(error: unknown, funcName: string, params: any): Promise<any> {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    await renovarToken();
    if (funcName === 'listarFormasPagamentos') return listarFormasPagamentos(params);
    if (funcName === 'obterFormaPagamento') return obterFormaPagamento(params.id);
    if (funcName === 'criarFormaPagamento') return criarFormaPagamento(params);
    if (funcName === 'atualizarFormaPagamento') return atualizarFormaPagamento(params.id, params.forma);
    if (funcName === 'excluirFormaPagamento') return excluirFormaPagamento(params.id);
  }
  throw error;
} 