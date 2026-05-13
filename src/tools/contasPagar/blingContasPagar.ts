import { logger } from '../../utils/logger.js';
import { blingClient, renovarToken } from '../blingClient.js';
import axios from 'axios';

/**
 * Interface para Conta a Pagar (baseada no schema da API)
 */
export interface ContaPagar {
  id?: number;
  situacao?: number;
  vencimento?: string;
  valor?: number;
  dataEmissao?: string;
  contato?: any;
  formaPagamento?: any;
  contaContabil?: any;
  origem?: any;
  saldo?: number;
  vencimentoOriginal?: string;
  numeroDocumento?: string;
  competencia?: string;
  historico?: string;
  numeroBanco?: string;
  portador?: any;
  categoria?: any;
  borderos?: number[];
  ocorrencia?: any;
  [key: string]: any;
}

export interface ListarContasPagarParams {
  pagina?: number;
  limite?: number;
  dataEmissaoInicial?: string;
  dataEmissaoFinal?: string;
  dataVencimentoInicial?: string;
  dataVencimentoFinal?: string;
  dataPagamentoInicial?: string;
  dataPagamentoFinal?: string;
  situacao?: number;
  idContato?: number;
}

/**
 * Lista as contas a pagar
 */
export async function listarContasPagar(params?: ListarContasPagarParams): Promise<{ data: ContaPagar[]; pagination: any }> {
  try {
    logger.debug('Listando contas a pagar', params);
    const response = await blingClient.get('/contas/pagar', { params });
    return {
      data: response.data.data as ContaPagar[],
      pagination: {
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.data?.length || 0,
        limit: response.data.limit || response.data.data?.length || 0
      }
    };
  } catch (error) {
    return handleApiError(error, 'listarContasPagar', params);
  }
}

/**
 * Obtém uma conta a pagar pelo ID
 */
export async function obterContaPagar(id: number | string): Promise<ContaPagar> {
  try {
    logger.debug('Obtendo conta a pagar', id);
    const response = await blingClient.get(`/contas/pagar/${id}`);
    if (response.data && response.data.data) {
      return response.data.data as ContaPagar;
    }
    return response.data as ContaPagar;
  } catch (error) {
    return handleApiError(error, 'obterContaPagar', { id });
  }
}

/**
 * Cria uma nova conta a pagar
 */
export async function criarContaPagar(conta: ContaPagar): Promise<ContaPagar> {
  try {
    logger.debug('Criando conta a pagar', conta);
    const response = await blingClient.post('/contas/pagar', conta);
    if (response.data && response.data.data) {
      return response.data.data as ContaPagar;
    }
    return response.data as ContaPagar;
  } catch (error) {
    return handleApiError(error, 'criarContaPagar', conta);
  }
}

/**
 * Atualiza uma conta a pagar existente
 */
export async function atualizarContaPagar(id: number | string, conta: Partial<ContaPagar>): Promise<ContaPagar> {
  try {
    logger.debug('Atualizando conta a pagar', id, conta);
    const response = await blingClient.put(`/contas/pagar/${id}`, conta);
    if (response.data && response.data.data) {
      return response.data.data as ContaPagar;
    }
    return response.data as ContaPagar;
  } catch (error) {
    return handleApiError(error, 'atualizarContaPagar', { id, conta });
  }
}

/**
 * Remove uma conta a pagar pelo ID
 */
export async function excluirContaPagar(id: number | string): Promise<void> {
  try {
    logger.debug('Excluindo conta a pagar', id);
    await blingClient.delete(`/contas/pagar/${id}`);
    logger.debug('Conta a pagar excluída com sucesso');
  } catch (error) {
    return handleApiError(error, 'excluirContaPagar', { id });
  }
}

/**
 * Baixa (paga) uma conta a pagar
 */
export async function baixarContaPagar(id: number | string, payload: any): Promise<any> {
  try {
    logger.debug('Baixando conta a pagar', id, payload);
    const response = await blingClient.post(`/contas/pagar/${id}/baixar`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'baixarContaPagar', { id, payload });
  }
}

/**
 * Função auxiliar para tratamento de erros da API
 */
async function handleApiError(error: unknown, funcName: string, params: any): Promise<any> {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    logger.debug(`Token expirado (401) em ${funcName}, tentando renovar...`);
    try {
      await renovarToken();
      if (funcName === 'listarContasPagar') return listarContasPagar(params as ListarContasPagarParams);
      if (funcName === 'obterContaPagar') return obterContaPagar(params.id);
      if (funcName === 'criarContaPagar') return criarContaPagar(params);
      if (funcName === 'atualizarContaPagar') return atualizarContaPagar(params.id, params.conta);
      if (funcName === 'excluirContaPagar') return excluirContaPagar(params.id);
      if (funcName === 'baixarContaPagar') return baixarContaPagar(params.id, params.payload);
      throw new Error(`Função desconhecida: ${funcName}`);
    } catch (renewError) {
      logger.error(`Erro ao renovar token em ${funcName}:`, renewError);
      throw new Error(`Falha na renovação do token: ${renewError instanceof Error ? renewError.message : 'Erro desconhecido'}`);
    }
  }
  if (axios.isAxiosError(error)) {
    logger.error(`Erro em ${funcName}:`);
    logger.error('Status:', error.response?.status);
    logger.error('Data:', JSON.stringify(error.response?.data, null, 2));
    throw new Error(`Erro ao ${funcName}: ${error.response?.data?.message || error.message}`);
  }
  logger.error(`Erro não relacionado ao Axios em ${funcName}:`, error);
  throw error;
} 