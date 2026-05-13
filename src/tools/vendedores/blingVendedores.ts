import { logger } from '../../utils/logger.js';
import { blingClient, renovarToken } from '../blingClient.js';
import axios from 'axios';

/**
 * Interface para parâmetros de listagem de vendedores
 */
interface ListarVendedoresParams {
  pagina?: number;
  limite?: number;
}

/**
 * Interface para o retorno de um vendedor
 */
export interface Vendedor {
  id: string;
  nome: string;
  [key: string]: any;
}

/**
 * Interface para resposta de listagem de vendedores
 */
interface VendedoresResponse {
  data: Vendedor[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

/**
 * Lista os vendedores cadastrados no Bling
 * @param params - Parâmetros para a listagem de vendedores
 * @returns Resposta com os vendedores e informações de paginação
 */
export async function listarVendedores(params?: ListarVendedoresParams): Promise<VendedoresResponse> {
  try {
    logger.debug(`Buscando vendedores com parâmetros:`, JSON.stringify(params, null, 2));
    const response = await blingClient.get('/vendedores', { params });
    logger.debug('Status:', response.status);
    if (response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data as Vendedor[],
        pagination: {
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.data.length,
          limit: response.data.limit || response.data.data.length
        }
      };
    }
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        pagination: {
          page: 1,
          totalPages: 1,
          totalItems: response.data.length,
          limit: 50
        }
      };
    }
    return {
      data: Array.isArray(response.data) ? response.data : (response.data && Array.isArray(response.data.data)) ? response.data.data : [],
      pagination: {
        page: 1,
        totalPages: 1,
        totalItems: Array.isArray(response.data) ? response.data.length : (response.data && Array.isArray(response.data.data)) ? response.data.data.length : 0,
        limit: 50
      }
    };
  } catch (error) {
    return handleApiError(error, 'listarVendedores', params);
  }
}

/**
 * Obtém um vendedor pelo ID
 * @param id - ID do vendedor
 * @returns Dados do vendedor
 */
export async function obterVendedor(id: string): Promise<Vendedor> {
  try {
    logger.debug(`Buscando vendedor com ID: ${id}`);
    const response = await blingClient.get(`/vendedores/${id}`);
    logger.debug('Status:', response.status);
    if (response.data && response.data.data) {
      return response.data.data as Vendedor;
    }
    return response.data as Vendedor;
  } catch (error) {
    return handleApiError(error, 'obterVendedor', { id });
  }
}

/**
 * Função auxiliar para tratamento de erros da API
 */
async function handleApiError(error: unknown, funcName: string, params: any): Promise<any> {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    // Token expirado, tentar renovar
    logger.debug(`Token expirado (401) em ${funcName}, tentando renovar...`);
    try {
      await renovarToken();
      if (funcName === 'listarVendedores') return listarVendedores(params as ListarVendedoresParams);
      if (funcName === 'obterVendedor') return obterVendedor(params.id);
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
