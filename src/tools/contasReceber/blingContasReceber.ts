import { logger } from '../../utils/logger.js';
import { blingClient, renovarToken } from '../blingClient.js';
import axios from 'axios';

/**
 * Interface para Conta a Receber (baseada no schema da API)
 */
export interface ContaReceber {
  id?: number;
  situacao: number;
  vencimento: string;
  valor: number;
  idTransacao?: string;
  linkQRCodePix?: string;
  linkBoleto?: string;
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
  vendedor?: any;
  borderos?: number[];
  ocorrencia?: any;
  [key: string]: any;
}

export interface ListarContasReceberParams {
  pagina?: number;
  limite?: number;
  situacoes?: number[];
  tipoFiltroData?: string;
  dataInicial?: string;
  dataFinal?: string;
  idsCategorias?: number[];
  idPortador?: number;
  idContato?: number;
  idVendedor?: number;
  idFormaPagamento?: number;
  boletoGerado?: number;
}

/**
 * Lista as contas a receber
 */
export async function listarContasReceber(params?: ListarContasReceberParams): Promise<{ data: ContaReceber[]; pagination: any }> {
  try {
    logger.debug('Listando contas a receber', params);
    const response = await blingClient.get('/contas/receber', { params });
    return {
      data: response.data.data as ContaReceber[],
      pagination: {
        // Adapte conforme resposta real da API
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.data?.length || 0,
        limit: response.data.limit || response.data.data?.length || 0
      }
    };
  } catch (error) {
    return handleApiError(error, 'listarContasReceber', params);
  }
}

/**
 * Obtém uma conta a receber pelo ID
 */
export async function obterContaReceber(id: number | string): Promise<ContaReceber> {
  try {
    logger.debug('Obtendo conta a receber', id);
    const response = await blingClient.get(`/contas/receber/${id}`);
    if (response.data && response.data.data) {
      return response.data.data as ContaReceber;
    }
    return response.data as ContaReceber;
  } catch (error) {
    return handleApiError(error, 'obterContaReceber', { id });
  }
}

/**
 * Cria uma nova conta a receber
 */
export async function criarContaReceber(conta: ContaReceber): Promise<ContaReceber> {
  try {
    logger.debug('Criando conta a receber', conta);
    const response = await blingClient.post('/contas/receber', conta);
    if (response.data && response.data.data) {
      return response.data.data as ContaReceber;
    }
    return response.data as ContaReceber;
  } catch (error) {
    return handleApiError(error, 'criarContaReceber', conta);
  }
}

/**
 * Atualiza uma conta a receber existente
 */
export async function atualizarContaReceber(id: number | string, conta: Partial<ContaReceber>): Promise<ContaReceber> {
  try {
    logger.debug('Atualizando conta a receber', id, conta);
    const response = await blingClient.put(`/contas/receber/${id}`, conta);
    if (response.data && response.data.data) {
      return response.data.data as ContaReceber;
    }
    return response.data as ContaReceber;
  } catch (error) {
    return handleApiError(error, 'atualizarContaReceber', { id, conta });
  }
}

/**
 * Remove uma conta a receber pelo ID
 */
export async function excluirContaReceber(id: number | string): Promise<void> {
  try {
    logger.debug('Excluindo conta a receber', id);
    await blingClient.delete(`/contas/receber/${id}`);
    logger.debug('Conta a receber excluída com sucesso');
  } catch (error) {
    return handleApiError(error, 'excluirContaReceber', { id });
  }
}

/**
 * Baixa (recebe) uma conta a receber
 */
export async function baixarContaReceber(id: number | string, payload: any): Promise<any> {
  try {
    logger.debug('Baixando conta a receber', id, payload);
    const response = await blingClient.post(`/contas/receber/${id}/baixar`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'baixarContaReceber', { id, payload });
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
      if (funcName === 'listarContasReceber') return listarContasReceber(params as ListarContasReceberParams);
      if (funcName === 'obterContaReceber') return obterContaReceber(params.id);
      if (funcName === 'criarContaReceber') return criarContaReceber(params);
      if (funcName === 'atualizarContaReceber') return atualizarContaReceber(params.id, params.conta);
      if (funcName === 'excluirContaReceber') return excluirContaReceber(params.id);
      if (funcName === 'baixarContaReceber') return baixarContaReceber(params.id, params.payload);
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